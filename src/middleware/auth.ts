import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Access token required'
    });
    return;
  }

  try {
    const decoded = AuthService.verifyToken(token);
    if (!decoded) {
      res.status(403).json({
        success: false,
        error: 'Invalid or expired token'
      });
      return;
    }

    req.user = {
      userId: decoded.userId,
      email: decoded.email
    };
    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      error: 'Invalid token'
    });
  }
};

export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = AuthService.verifyToken(token);
      if (decoded) {
        req.user = {
          userId: decoded.userId,
          email: decoded.email
        };
      }
    } catch (error) {
      // Token is invalid, but we continue without user
    }
  }
  
  next();
}; 