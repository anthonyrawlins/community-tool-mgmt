import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';
import { ZodError } from 'zod';
import { 
  Prisma
} from '@prisma/client';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Custom error types
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}

// Error handler for async route handlers
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Handle Prisma errors
const handlePrismaError = (error: any): AppError => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        // Unique constraint violation
        const field = error.meta?.target ? (error.meta.target as string[]).join(', ') : 'field';
        return new ConflictError(`${field} already exists`);
      
      case 'P2025':
        // Record not found
        return new NotFoundError('Record not found');
      
      case 'P2003':
        // Foreign key constraint violation
        return new ValidationError('Invalid reference to related record');
      
      case 'P2014':
        // Required relation violation
        return new ValidationError('Required relation missing');
      
      default:
        logger.error('Prisma Known Request Error', {
          code: error.code,
          message: error.message,
          meta: error.meta
        });
        return new AppError('Database operation failed', 500, false);
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return new ValidationError('Invalid data provided');
  }

  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    logger.error('Prisma Unknown Request Error', error);
    return new AppError('Database operation failed', 500, false);
  }

  return new AppError('Database error', 500, false);
};

// Global error handler middleware
export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let appError = error;

  // Handle Prisma errors
  if (error.name?.includes('Prisma') || error instanceof Prisma.PrismaClientKnownRequestError || 
      error instanceof Prisma.PrismaClientValidationError || error instanceof Prisma.PrismaClientUnknownRequestError) {
    appError = handlePrismaError(error);
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    appError = new ValidationError(error.message);
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    appError = new UnauthorizedError('Invalid token');
  }

  if (error.name === 'TokenExpiredError') {
    appError = new UnauthorizedError('Token expired');
  }

  // Handle multer errors (file upload)
  if (error.code === 'LIMIT_FILE_SIZE') {
    appError = new ValidationError('File too large');
  }

  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    appError = new ValidationError('Unexpected file field');
  }

  // Ensure we have an AppError
  if (!(appError instanceof AppError)) {
    logger.error('Unhandled Error', {
      message: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    appError = new AppError('Internal server error', 500, false);
  }

  // Log operational errors as warnings, programming errors as errors
  if (appError.isOperational) {
    logger.warn('Operational Error', {
      message: appError.message,
      statusCode: appError.statusCode,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userId: req.user?.id
    });
  } else {
    logger.error('Programming Error', {
      message: appError.message,
      stack: appError.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id
    });
  }

  // Send error response
  const response: any = {
    success: false,
    message: appError.message,
    statusCode: appError.statusCode
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = appError.stack;
  }

  res.status(appError.statusCode).json(response);
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    statusCode: 404
  });
};