const cors = require('cors');

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'https://ballarattoollibrary.org.au',
      'https://ballarat-tools-staging.vercel.app',
      'https://www.ballarattoollibrary.org.au'
    ];
    
    // Add development origins
    if (process.env.NODE_ENV === 'development') {
      allowedOrigins.push(
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001'
      );
    }
    
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-API-Key',
    'stripe-signature' // For Stripe webhook verification
  ],
  
  credentials: true, // Allow credentials (cookies, authorization headers)
  
  exposedHeaders: [
    'X-Total-Count',
    'X-Page',
    'X-Per-Page',
    'RateLimit-Limit',
    'RateLimit-Remaining',
    'RateLimit-Reset'
  ],
  
  maxAge: 86400, // 24 hours - how long the browser should cache CORS preflight responses
  
  preflightContinue: false,
  optionsSuccessStatus: 200
};

// More restrictive CORS for production
const productionCorsOptions = {
  ...corsOptions,
  origin: [
    'https://ballarattoollibrary.org.au',
    'https://www.ballarattoollibrary.org.au'
  ],
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'], // Remove OPTIONS for security
};

// Webhook-specific CORS (less restrictive for payment providers)
const webhookCorsOptions = {
  origin: [
    'https://api.stripe.com',
    'https://checkout.stripe.com',
    'https://js.stripe.com'
  ],
  methods: ['POST'],
  allowedHeaders: [
    'Content-Type',
    'stripe-signature',
    'User-Agent'
  ],
  credentials: false,
  maxAge: 3600 // 1 hour
};

// Development CORS (more permissive)
const developmentCorsOptions = {
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: '*',
  exposedHeaders: '*'
};

// Get appropriate CORS options based on environment
const getCorsOptions = () => {
  if (process.env.NODE_ENV === 'production') {
    return productionCorsOptions;
  } else if (process.env.NODE_ENV === 'development') {
    return developmentCorsOptions;
  } else {
    return corsOptions;
  }
};

module.exports = {
  corsOptions,
  productionCorsOptions,
  webhookCorsOptions,
  developmentCorsOptions,
  getCorsOptions,
  corsMiddleware: cors(getCorsOptions())
};