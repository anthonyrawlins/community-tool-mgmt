const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');

// Redis connection for rate limiting
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: null
});

// Store for rate limiting
const store = new RedisStore({
  sendCommand: (...args) => redis.call(...args)
});

// General API rate limiting
const generalLimiter = rateLimit({
  store,
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for certain routes in development
    if (process.env.NODE_ENV === 'development' && req.path.startsWith('/api/health')) {
      return true;
    }
    return false;
  }
});

// Strict rate limiting for authentication endpoints
const authLimiter = rateLimit({
  store,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // Don't count successful requests
});

// Payment endpoint rate limiting
const paymentLimiter = rateLimit({
  store,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 payment attempts per hour
  message: {
    error: 'Too many payment attempts, please try again later.',
    code: 'PAYMENT_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Registration rate limiting
const registrationLimiter = rateLimit({
  store,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 registration attempts per hour
  message: {
    error: 'Too many registration attempts, please try again later.',
    code: 'REGISTRATION_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Password reset rate limiting
const passwordResetLimiter = rateLimit({
  store,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 password reset attempts per hour
  message: {
    error: 'Too many password reset attempts, please try again later.',
    code: 'PASSWORD_RESET_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// File upload rate limiting
const uploadLimiter = rateLimit({
  store,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 file uploads per 15 minutes
  message: {
    error: 'Too many file uploads, please try again later.',
    code: 'UPLOAD_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Email sending rate limiting
const emailLimiter = rateLimit({
  store,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 emails per hour
  message: {
    error: 'Too many email requests, please try again later.',
    code: 'EMAIL_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Webhook rate limiting (more lenient for legitimate webhooks)
const webhookLimiter = rateLimit({
  store,
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, // Allow up to 100 webhook calls per 5 minutes
  message: {
    error: 'Webhook rate limit exceeded.',
    code: 'WEBHOOK_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use a combination of IP and webhook source for key generation
    const webhookSource = req.get('User-Agent') || 'unknown';
    return `${req.ip}-${webhookSource}`;
  }
});

// Dynamic rate limiting based on user authentication
const createUserBasedLimiter = (windowMs, max) => {
  return rateLimit({
    store,
    windowMs,
    max,
    keyGenerator: (req) => {
      // Use user ID for authenticated requests, IP for anonymous
      return req.user ? `user:${req.user.id}` : `ip:${req.ip}`;
    },
    message: {
      error: 'Rate limit exceeded for your account.',
      code: 'USER_RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false
  });
};

// Create user-based limiters
const userApiLimiter = createUserBasedLimiter(15 * 60 * 1000, 500); // 500 requests per 15 minutes for authenticated users
const userToolActionsLimiter = createUserBasedLimiter(60 * 60 * 1000, 50); // 50 tool actions per hour

module.exports = {
  generalLimiter,
  authLimiter,
  paymentLimiter,
  registrationLimiter,
  passwordResetLimiter,
  uploadLimiter,
  emailLimiter,
  webhookLimiter,
  userApiLimiter,
  userToolActionsLimiter,
  redis
};