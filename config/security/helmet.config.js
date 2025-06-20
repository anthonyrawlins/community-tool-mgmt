const helmet = require('helmet');

// Security configuration for Express.js using Helmet
const helmetConfig = {
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
        "https://cdn.jsdelivr.net"
      ],
      scriptSrc: [
        "'self'",
        "https://js.stripe.com",
        "https://checkout.stripe.com",
        "https://analytics.google.com",
        "'unsafe-inline'" // Only for development - remove in production
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https:",
        "https://images.unsplash.com",
        "https://res.cloudinary.com"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "https://cdn.jsdelivr.net"
      ],
      connectSrc: [
        "'self'",
        "https://api.stripe.com",
        "https://checkout.stripe.com",
        "https://analytics.google.com",
        process.env.BACKEND_URL || "http://localhost:8000"
      ],
      frameSrc: [
        "https://js.stripe.com",
        "https://hooks.stripe.com"
      ],
      workerSrc: ["'self'", "blob:"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
    }
  },

  // HTTP Strict Transport Security
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },

  // X-Frame-Options
  frameguard: {
    action: 'deny'
  },

  // X-Content-Type-Options
  noSniff: true,

  // X-XSS-Protection
  xssFilter: true,

  // Referrer Policy
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin'
  },

  // Hide X-Powered-By header
  hidePoweredBy: true,

  // DNS Prefetch Control
  dnsPrefetchControl: {
    allow: false
  },

  // Expect-CT
  expectCt: {
    maxAge: 86400, // 24 hours
    enforce: true
  },

  // Feature Policy / Permissions Policy
  permittedCrossDomainPolicies: false,

  // Cross-Origin-Embedder-Policy
  crossOriginEmbedderPolicy: false, // Set to true if needed

  // Cross-Origin-Opener-Policy
  crossOriginOpenerPolicy: {
    policy: 'same-origin'
  },

  // Cross-Origin-Resource-Policy
  crossOriginResourcePolicy: {
    policy: 'cross-origin'
  }
};

// Development-specific adjustments
if (process.env.NODE_ENV === 'development') {
  // Relax CSP for development
  helmetConfig.contentSecurityPolicy.directives.scriptSrc.push("'unsafe-eval'");
  helmetConfig.contentSecurityPolicy.directives.connectSrc.push(
    "ws://localhost:*",
    "http://localhost:*"
  );
}

module.exports = {
  helmetConfig,
  securityHeaders: helmet(helmetConfig)
};