import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';

  console.error(`[${new Date().toISOString()}] Error:`, {
    method: req.method,
    url: req.url,
    statusCode,
    message: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });

  res.status(statusCode).json({
    success: false,
    error: message,
    code: error.code,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: `Endpoint ${req.method} ${req.url} not found`
  });
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}; 