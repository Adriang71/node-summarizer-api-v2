import { AIConfigModel } from '../models/AIConfig';
import { AIConfig } from '../types';
import { getModel, getPrompt } from '../ai';

export class AIConfigService {
  /**
   * Get AI configuration for a user, create default if not exists
   */
  static async getUserConfig(userId: string): Promise<AIConfig> {
    try {
      let config = await AIConfigModel.findOne({ userId });
      
      if (!config) {
        // Create default configuration for new user
        config = await AIConfigModel.create({
          userId,
          modelId: 'qwen-7b',
          promptId: 'analysis-en',
          language: 'en',
          maxContentLength: 10000,
          enableCaching: true,
          cacheExpiration: 3600
        });
      }
      
      return config;
    } catch (error) {
      console.error('Error getting user AI config:', error);
      throw new Error('Failed to get AI configuration');
    }
  }

  /**
   * Update AI configuration for a user
   */
  static async updateUserConfig(userId: string, updates: Partial<AIConfig>): Promise<AIConfig> {
    try {
      // Validate model and prompt if provided
      if (updates.modelId) {
        getModel(updates.modelId); // This will throw if model doesn't exist
      }
      if (updates.promptId) {
        const prompt = getPrompt(updates.promptId); // This will throw if prompt doesn't exist
        // Automatically set language based on prompt
        updates.language = prompt.language as 'en' | 'pl';
      }

      const config = await AIConfigModel.findOneAndUpdate(
        { userId },
        { ...updates },
        { new: true, upsert: true, runValidators: true }
      );

      if (!config) {
        throw new Error('Failed to update AI configuration');
      }

      return config;
    } catch (error) {
      console.error('Error updating user AI config:', error);
      throw new Error('Failed to update AI configuration');
    }
  }

  /**
   * Create default AI configuration for a new user
   */
  static async createDefaultConfig(userId: string): Promise<AIConfig> {
    try {
      const config = await AIConfigModel.create({
        userId,
        modelId: 'qwen-7b',
        promptId: 'analysis-en',
        language: 'en',
        maxContentLength: 10000,
        enableCaching: true,
        cacheExpiration: 3600
      });

      return config;
    } catch (error) {
      console.error('Error creating default AI config:', error);
      throw new Error('Failed to create default AI configuration');
    }
  }

  /**
   * Delete AI configuration for a user
   */
  static async deleteUserConfig(userId: string): Promise<boolean> {
    try {
      const result = await AIConfigModel.deleteOne({ userId });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting user AI config:', error);
      throw new Error('Failed to delete AI configuration');
    }
  }

  /**
   * Get AI configuration with model and prompt details
   */
  static async getUserConfigWithDetails(userId: string) {
    try {
      const config = await this.getUserConfig(userId);
      
      // Get model and prompt details
      const model = getModel(config.modelId);
      const prompt = getPrompt(config.promptId);
      
      // Ensure language is set based on prompt
      const language = prompt.language;
      
      return {
        ...config,
        model,
        prompt,
        language
      };
    } catch (error) {
      console.error('Error getting user AI config with details:', error);
      throw new Error('Failed to get AI configuration with details');
    }
  }
} 