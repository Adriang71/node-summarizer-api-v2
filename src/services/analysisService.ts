import { WebScraperService } from './webScraper';
import { OpenRouterService } from './openRouterService';
import { ElevenLabsService } from './elevenLabsService';
import { Analysis } from '../models/Analysis';
import { AnalyzeRequest, AnalyzeResponse, WebContent, AnalysisResult, AudioResult } from '../types';

export class AnalysisService {
  /**
   * Main method for analyzing a website
   */
  static async analyzeWebsite(request: AnalyzeRequest, userId: string): Promise<AnalyzeResponse> {
    try {
      // Check cache for this specific user
      const cachedAnalysis = await this.getCachedAnalysis(request.url, userId);
      if (cachedAnalysis) {
        return {
          success: true,
          data: {
            url: cachedAnalysis.url,
            analysis: cachedAnalysis.analysis,
            audio: cachedAnalysis.audio,
            timestamp: cachedAnalysis.timestamp
          },
          cached: true
        };
      }

      // Fetch website content
      const webContent = await WebScraperService.scrapeWebsite(request.url);
      
      // Analyze content with OpenRouter using user-specific configuration
      const analysis = await OpenRouterService.analyzeContent(webContent, userId);
      
      // Generate audio with ElevenLabs
      const audio = await ElevenLabsService.generateSpeech(analysis.summary);
      
      // Save to database with user ID
      const analysisRecord = await this.saveAnalysis(request.url, analysis, audio, userId);
      
      return {
        success: true,
        data: {
          url: request.url,
          analysis,
          audio,
          timestamp: analysisRecord.timestamp
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unexpected error'
      };
    }
  }

  /**
   * Checks if analysis is already cached for specific user
   */
  private static async getCachedAnalysis(url: string, userId: string): Promise<any> {
    try {
      const cached = await Analysis.findOne({ url, userId }).sort({ createdAt: -1 });
      
      if (cached) {
        // Check if cache is not older than 24 hours
        const cacheAge = Date.now() - cached.createdAt.getTime();
        const maxCacheAge = 24 * 60 * 60 * 1000; // 24 hours
        
        if (cacheAge < maxCacheAge) {
          return cached;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error checking cache:', error);
      return null;
    }
  }

  /**
   * Saves analysis to database with user ID
   */
  private static async saveAnalysis(
    url: string, 
    analysis: AnalysisResult, 
    audio: AudioResult,
    userId: string
  ) {
    const analysisRecord = new Analysis({
      url,
      analysis,
      audio,
      userId,
      timestamp: new Date()
    });

    return await analysisRecord.save();
  }

  /**
   * Fetches analysis history for specific user
   */
  static async getAnalysisHistory(userId: string, limit: number = 10): Promise<any[]> {
    try {
      return await Analysis.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('-__v');
    } catch (error) {
      console.error('Error fetching history:', error);
      return [];
    }
  }

  /**
   * Fetches specific analysis by ID for specific user
   */
  static async getAnalysisById(id: string, userId: string): Promise<any> {
    try {
      return await Analysis.findOne({ _id: id, userId }).select('-__v');
    } catch (error) {
      console.error('Error fetching analysis:', error);
      return null;
    }
  }

  /**
   * Deletes analysis from database for specific user
   */
  static async deleteAnalysis(id: string, userId: string): Promise<boolean> {
    try {
      const result = await Analysis.findOneAndDelete({ _id: id, userId });
      return !!result;
    } catch (error) {
      console.error('Error deleting analysis:', error);
      return false;
    }
  }
} 