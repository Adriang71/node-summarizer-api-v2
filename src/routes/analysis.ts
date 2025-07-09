import { Router, Request, Response } from 'express';
import Joi from 'joi';
import { AnalysisService } from '../services/analysisService';
import { AnalyzeRequest } from '../types';
import { authenticateToken } from '../middleware/auth';
import { aiConfig } from '../ai';

const router = Router();

// Validation schema for analysis request
const analyzeSchema = Joi.object({
  url: Joi.string().uri().required().messages({
    'string.uri': 'URL must be a valid web address',
    'any.required': 'URL is required'
  })
});

/**
 * POST /analyze - Analyzes a website (requires authentication)
 */
router.post('/analyze', authenticateToken, async (req: Request, res: Response) => {
  try {
    // Input validation
    const { error, value } = analyzeSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0]?.message || 'Validation error'
      });
    }

    const request: AnalyzeRequest = value;
    const userId = req.user!.userId;
    
    const userConfig = await aiConfig.getConfig(userId);
    console.log('Analyze endpoint - User config:', {
      userId,
      model: userConfig.model.id,
      modelName: userConfig.model.name,
      language: userConfig.language,
      promptId: userConfig.prompt.id,
      promptName: userConfig.prompt.name
    });
    
    // Perform analysis
    const result = await AnalysisService.analyzeWebsite(request, userId);
    
    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(500).json(result);
    }

  } catch (error) {
    console.error('Error in /analyze endpoint:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /history - Fetches analysis history for authenticated user
 */
router.get('/history', authenticateToken, async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const userId = req.user!.userId;
    
    if (limit > 100) {
      return res.status(400).json({
        success: false,
        error: 'Limit cannot be greater than 100'
      });
    }

    const history = await AnalysisService.getAnalysisHistory(userId, limit);
    
    return res.status(200).json({
      success: true,
      data: history
    });

  } catch (error) {
    console.error('Error in /history endpoint:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /analysis/:id - Fetches specific analysis for authenticated user
 */
router.get('/analysis/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Analysis ID is required'
      });
    }

    const analysis = await AnalysisService.getAnalysisById(id, userId);
    
    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: 'Analysis not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: analysis
    });

  } catch (error) {
    console.error('Error in /analysis/:id endpoint:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * DELETE /analysis/:id - Deletes analysis for authenticated user
 */
router.delete('/analysis/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Analysis ID is required'
      });
    }

    const deleted = await AnalysisService.deleteAnalysis(id, userId);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Analysis not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Analysis deleted successfully'
    });

  } catch (error) {
    console.error('Error in DELETE /analysis/:id endpoint:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /health - Server health check endpoint
 */
router.get('/health', (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: 'Server is running properly',
    timestamp: new Date().toISOString()
  });
});



// Export schema for Swagger generation
export { analyzeSchema };
export default router; 