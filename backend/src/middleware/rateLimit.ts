import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// General rate limiting
export const generalRateLimit = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // requests per window
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    statusCode: 429
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for authenticated admin users
  skip: (req: Request) => {
    return req.user?.role === 'ADMIN';
  }
});

// Strict rate limiting for authentication endpoints
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
    statusCode: 429
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Track by IP and email combination for login attempts
  keyGenerator: (req: Request) => {
    const email = req.body?.email || 'unknown';
    return `${req.ip}-${email}`;
  }
});

// Rate limiting for password reset requests
export const passwordResetRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 password reset requests per hour
  message: {
    success: false,
    message: 'Too many password reset requests, please try again later.',
    statusCode: 429
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const email = req.body?.email || 'unknown';
    return `reset-${req.ip}-${email}`;
  }
});

// Rate limiting for file uploads
export const uploadRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 uploads per minute
  message: {
    success: false,
    message: 'Too many file uploads, please try again later.',
    statusCode: 429
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting for email sending
export const emailRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 emails per hour per user
  message: {
    success: false,
    message: 'Too many emails sent, please try again later.',
    statusCode: 429
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    return req.user?.id || req.ip;
  }
});

// Rate limiting for API key/token refresh
export const tokenRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 token refresh requests per minute
  message: {
    success: false,
    message: 'Too many token refresh requests, please try again later.',
    statusCode: 429
  },
  standardHeaders: true,
  legacyHeaders: false
});