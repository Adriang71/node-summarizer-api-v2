import { Router, Request, Response } from 'express';
import Joi from 'joi';
import { aiConfig, getAvailableModels, getAvailablePrompts } from '../ai';
import { authenticateToken } from '../middleware/auth';
import { AIConfigService } from '../services/aiConfigService';

const router = Router();

// Validation schemas
const updateConfigSchema = Joi.object({
  modelId: Joi.string().optional().messages({
    'string.base': 'Model ID must be a string'
  }),
  promptId: Joi.string().optional().messages({
    'string.base': 'Prompt ID must be a string'
  }),
  language: Joi.string().valid('en', 'pl').optional().messages({
    'string.base': 'Language must be a string',
    'any.only': 'Language must be either "en" or "pl"'
  }),
  maxContentLength: Joi.number().integer().min(1000).max(50000).optional().messages({
    'number.base': 'Max content length must be a number',
    'number.integer': 'Max content length must be an integer',
    'number.min': 'Max content length must be at least 1000',
    'number.max': 'Max content length cannot exceed 50000'
  }),
  enableCaching: Joi.boolean().optional().messages({
    'boolean.base': 'Enable caching must be a boolean'
  }),
  cacheExpiration: Joi.number().integer().min(300).max(86400).optional().messages({
    'number.base': 'Cache expiration must be a number',
    'number.integer': 'Cache expiration must be an integer',
    'number.min': 'Cache expiration must be at least 300 seconds (5 minutes)',
    'number.max': 'Cache expiration cannot exceed 86400 seconds (24 hours)'
  })
});

// Response schemas
const aiModelSchema = Joi.object({
  id: Joi.string().description('Model identifier'),
  name: Joi.string().description('Model name'),
  provider: Joi.string().description('Model provider'),
  maxTokens: Joi.number().description('Maximum tokens for the model'),
  temperature: Joi.number().description('Model temperature setting'),
  description: Joi.string().description('Model description')
});

const aiPromptSchema = Joi.object({
  id: Joi.string().description('Prompt identifier'),
  name: Joi.string().description('Prompt name'),
  language: Joi.string().description('Prompt language'),
  description: Joi.string().description('Prompt description')
});

const aiConfigResponseSchema = Joi.object({
  success: Joi.boolean().description('Request success status'),
  data: Joi.object({
    model: aiModelSchema,
    prompt: aiPromptSchema,
    language: Joi.string().description('Current language setting'),
    maxContentLength: Joi.number().description('Maximum content length'),
    enableCaching: Joi.boolean().description('Caching enabled status'),
    cacheExpiration: Joi.number().description('Cache expiration time in seconds')
  })
});

const aiModelsResponseSchema = Joi.object({
  success: Joi.boolean().description('Request success status'),
  data: Joi.array().items(aiModelSchema).description('List of available AI models')
});

const aiPromptsResponseSchema = Joi.object({
  success: Joi.boolean().description('Request success status'),
  data: Joi.array().items(aiPromptSchema).description('List of available AI prompts')
});

const updateConfigResponseSchema = Joi.object({
  success: Joi.boolean().description('Request success status'),
  message: Joi.string().description('Success message'),
  data: Joi.object({
    model: aiModelSchema,
    prompt: aiPromptSchema,
    language: Joi.string().description('Current language setting'),
    maxContentLength: Joi.number().description('Maximum content length'),
    enableCaching: Joi.boolean().description('Caching enabled status'),
    cacheExpiration: Joi.number().description('Cache expiration time in seconds')
  })
});

/**
 * GET /config - Get current AI configuration
 */
router.get('/config', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const config = await aiConfig.getConfig(userId);
    
    return res.status(200).json({
      success: true,
      data: {
        model: config.model,
        prompt: config.prompt,
        language: config.language,
        maxContentLength: config.maxContentLength,
        enableCaching: config.enableCaching,
        cacheExpiration: config.cacheExpiration
      }
    });

  } catch (error) {
    console.error('Error in /ai/config endpoint:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * PUT /config - Update AI configuration
 */
router.put('/config', authenticateToken, async (req: Request, res: Response) => {
  try {
    // Input validation
    const { error, value } = updateConfigSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0]?.message || 'Validation error'
      });
    }

    const userId = req.user!.userId;
    const { modelId, promptId, language, maxContentLength, enableCaching, cacheExpiration } = value;
    
    // Prepare all updates in one object
    const updates: any = {};
    if (modelId) updates.modelId = modelId;
    if (promptId) updates.promptId = promptId;
    if (language) updates.language = language;
    if (maxContentLength !== undefined) updates.maxContentLength = maxContentLength;
    if (enableCaching !== undefined) updates.enableCaching = enableCaching;
    if (cacheExpiration !== undefined) updates.cacheExpiration = cacheExpiration;
    
    // Update configuration in one operation
    if (Object.keys(updates).length > 0) {
      await AIConfigService.updateUserConfig(userId, updates);
    }
    
    const updatedConfig = await aiConfig.getConfig(userId);
    console.log('Updated config:', updatedConfig);
    return res.status(200).json({
      success: true,
      data: {
        model: updatedConfig.model,
        prompt: updatedConfig.prompt,
        language: updatedConfig.language,
        maxContentLength: updatedConfig.maxContentLength,
        enableCaching: updatedConfig.enableCaching,
        cacheExpiration: updatedConfig.cacheExpiration
      },
      message: 'AI configuration updated successfully'
    });

  } catch (error) {
    console.error('Error in PUT /ai/config endpoint:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

/**
 * GET /models - Get available AI models
 */
router.get('/models', authenticateToken, (req: Request, res: Response) => {
  try {
    const models = getAvailableModels();
    
    return res.status(200).json({
      success: true,
      data: models
    });

  } catch (error) {
    console.error('Error in /ai/models endpoint:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /prompts - Get available AI prompts
 */
router.get('/prompts', authenticateToken, (req: Request, res: Response) => {
  try {
    const prompts = getAvailablePrompts();
    
    return res.status(200).json({
      success: true,
      data: prompts
    });

  } catch (error) {
    console.error('Error in /ai/prompts endpoint:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Export schemas for Swagger generation
export { 
  updateConfigSchema, 
  aiConfigResponseSchema, 
  aiModelsResponseSchema, 
  aiPromptsResponseSchema, 
  updateConfigResponseSchema,
  aiModelSchema,
  aiPromptSchema
};
export default router; 