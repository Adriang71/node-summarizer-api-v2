import { Router, Request, Response } from 'express';
import Joi from 'joi';
import { AuthService } from '../services/authService';
import { UserRegistration, UserLogin } from '../types';

const router = Router();

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required'
  }),
  name: Joi.string().min(2).required().messages({
    'string.min': 'Name must be at least 2 characters long',
    'any.required': 'Name is required'
  })
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
});

/**
 * POST /register - Register a new user
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    // Input validation
    const { error, value } = registerSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0]?.message || 'Validation error'
      });
    }

    const userData: UserRegistration = value;
    const result = await AuthService.register(userData);
    
    if (result.success) {
      return res.status(201).json(result);
    } else {
      return res.status(400).json(result);
    }

  } catch (error) {
    console.error('Error in /register endpoint:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * POST /login - Login user
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    // Input validation
    const { error, value } = loginSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0]?.message || 'Validation error'
      });
    }

    const loginData: UserLogin = value;
    const result = await AuthService.login(loginData);
    
    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(401).json(result);
    }

  } catch (error) {
    console.error('Error in /login endpoint:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Export schemas for Swagger generation
export { registerSchema, loginSchema };
export default router; 