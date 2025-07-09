import { WebContent, AnalysisResult } from '../types';
import { aiConfig } from '../ai';

export class OpenRouterService {
  private static readonly API_BASE_URL = 'https://openrouter.ai/api/v1';

  /**
   * Analyzes website content using OpenRouter API
   */
  static async analyzeContent(content: WebContent, userId?: string): Promise<AnalysisResult> {
    try {
      const apiKey = process.env.OPENROUTER_API_KEY;
      
      if (!apiKey) {
        throw new Error('OPENROUTER_API_KEY is not defined in environment variables');
      }

      const config = await aiConfig.getConfig(userId);
      const prompt = await aiConfig.formatPrompt({
        title: content.title,
        url: content.url,
        content: content.content.substring(0, config.maxContentLength)
      }, userId);
      
      const modelSettings = await aiConfig.getModelSettingsAsync(userId);
      const systemPrompt = await aiConfig.getSystemPrompt(userId);
      console.log('modelSettings', modelSettings);
      const requestBody = {
        model: modelSettings.model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: modelSettings.maxTokens,
        temperature: modelSettings.temperature
      };
      
      console.log('OpenRouter: System prompt:', systemPrompt);
      console.log('OpenRouter: User prompt:', prompt);
      
      const response = await fetch(`${this.API_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://github.com/your-repo',
          'X-Title': 'Web Analyzer API'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        if (response.status === 401) {
          throw new Error('Invalid OpenRouter API key');
        }
        if (response.status === 429) {
          throw new Error('OpenRouter API rate limit exceeded');
        }
        if (response.status === 404) {
          throw new Error(`Model not found: ${modelSettings.model}. Please check if the model ID is correct.`);
        }
        throw new Error(`OpenRouter API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json() as any;
      const analysisText = data.choices?.[0]?.message?.content;
      
      if (!analysisText) {
        throw new Error('No response received from OpenRouter');
      }

      return this.parseAnalysisResponse(analysisText, content.content);

    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Content analysis error: ${error.message}`);
      }
      throw new Error('Content analysis error: Unknown error');
    }
  }



  /**
   * Parses OpenRouter response
   */
  private static parseAnalysisResponse(response: string, originalContent: string): AnalysisResult {
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        return {
          summary: parsed.summary || 'No summary available',
          keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : ['No key points available'],
          sentiment: ['positive', 'negative', 'neutral'].includes(parsed.sentiment) 
            ? parsed.sentiment as 'positive' | 'negative' | 'neutral'
            : 'neutral',
          wordCount: typeof parsed.wordCount === 'number' ? parsed.wordCount : this.countWords(originalContent)
        };
      }

      // Fallback - text parsing
      return this.fallbackParsing(response, originalContent);

    } catch (error) {
      // Fallback in case of JSON parsing error
      return this.fallbackParsing(response, originalContent);
    }
  }

  /**
   * Fallback parsing for cases when JSON is not valid
   */
  private static fallbackParsing(response: string, originalContent: string): AnalysisResult {
    const lines = response.split('\n').filter(line => line.trim().length > 0);
    
    return {
      summary: lines[0] || 'No summary available',
      keyPoints: lines.slice(1, 4).filter(line => line.length > 0) || ['No key points available'],
      sentiment: 'neutral',
      wordCount: this.countWords(originalContent)
    };
  }

  /**
   * Counts words in text
   */
  private static countWords(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }
} 