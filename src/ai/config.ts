import { getModel, AIModel } from './models';
import { getPrompt, PromptTemplate, formatPrompt } from './prompts';
import { AIConfigService } from '../services/aiConfigService';

export interface AIConfig {
  model: AIModel;
  prompt: PromptTemplate;
  language: string;
  maxContentLength: number;
  enableCaching: boolean;
  cacheExpiration: number; // in seconds
}

export const DEFAULT_AI_CONFIG: AIConfig = {
  model: getModel(),
  prompt: getPrompt(),
  language: 'en',
  maxContentLength: 10000,
  enableCaching: true,
  cacheExpiration: 3600 // 1 hour
};

export class AIConfigManager {
  private static instance: AIConfigManager;
  private config: AIConfig;

  private constructor() {
    this.config = { ...DEFAULT_AI_CONFIG };
  }

  static getInstance(): AIConfigManager {
    if (!AIConfigManager.instance) {
      AIConfigManager.instance = new AIConfigManager();
    }
    return AIConfigManager.instance;
  }

  async getConfig(userId?: string): Promise<AIConfig> {
    if (userId) {
      try {
        const userConfig = await AIConfigService.getUserConfigWithDetails(userId);
        return {
          model: userConfig.model,
          prompt: userConfig.prompt,
          language: userConfig.language,
          maxContentLength: userConfig.maxContentLength,
          enableCaching: userConfig.enableCaching,
          cacheExpiration: userConfig.cacheExpiration
        };
      } catch (error) {
        console.warn('Failed to get user config, using default:', error);
        return { ...this.config };
      }
    }
    return { ...this.config };
  }

  async updateConfig(updates: Partial<AIConfig>, userId?: string): Promise<void> {
    if (userId) {
      try {
        const updateData: any = {};
        if (updates.model) updateData.modelId = updates.model.id;
        if (updates.prompt) {
          updateData.promptId = updates.prompt.id;
          updateData.language = updates.prompt.language;
        }
        if (updates.maxContentLength !== undefined) updateData.maxContentLength = updates.maxContentLength;
        if (updates.enableCaching !== undefined) updateData.enableCaching = updates.enableCaching;
        if (updates.cacheExpiration !== undefined) updateData.cacheExpiration = updates.cacheExpiration;

        await AIConfigService.updateUserConfig(userId, updateData);
      } catch (error) {
        console.warn('Failed to update user config:', error);
      }
    }

    // Update local config as fallback
    this.config = { ...this.config, ...updates };
    
    if (updates.model) {
      this.config.model = updates.model;
    }
    if (updates.prompt) {
      this.config.prompt = updates.prompt;
      this.config.language = updates.prompt.language;
    }
  }

  async setModel(modelId: string, userId?: string): Promise<void> {
    const model = getModel(modelId);
    await this.updateConfig({ model }, userId);
  }

  async setPrompt(promptId: string, userId?: string): Promise<void> {
    const prompt = getPrompt(promptId);
    await this.updateConfig({ prompt }, userId);
  }

  async setLanguage(language: string, userId?: string): Promise<void> {
    this.config.language = language;
    // Try to find a prompt for this language
    const prompts = require('./prompts').getPromptsByLanguage(language);
    if (prompts.length > 0) {
      await this.updateConfig({ prompt: prompts[0] }, userId);
    }
  }

  async formatPrompt(variables: Record<string, string>, userId?: string): Promise<string> {
    const config = await this.getConfig(userId);
    return formatPrompt(config.prompt, variables);
  }

  async getSystemPrompt(userId?: string): Promise<string> {
    const config = await this.getConfig(userId);
    return config.prompt.systemPrompt;
  }

  getUserPromptTemplate(): string {
    return this.config.prompt.userPromptTemplate;
  }

  async getModelSettingsAsync(userId?: string) {
    const config = await this.getConfig(userId);
    console.log('config', config);
    return {
      model: config.model.id,
      maxTokens: config.model.maxTokens,
      temperature: config.model.temperature
    };
  }
}

// Export singleton instance
export const aiConfig = AIConfigManager.getInstance(); 