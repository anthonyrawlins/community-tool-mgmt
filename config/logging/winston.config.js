const winston = require('winston');
const path = require('path');

// Custom format for structured logging
const structuredFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} [${level}]: ${message} ${metaStr}`;
  })
);

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: structuredFormat,
  defaultMeta: {
    service: 'ballarat-tool-library',
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  },
  transports: [
    // Write all logs to combined.log
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: structuredFormat
    }),

    // Write error logs to error.log
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: structuredFormat
    }),

    // Write audit logs to audit.log
    new winston.transports.File({
      filename: path.join(logsDir, 'audit.log'),
      level: 'info',
      maxsize: 5242880, // 5MB
      maxFiles: 10,
      format: structuredFormat
    })
  ],

  // Handle uncaught exceptions
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
      maxsize: 5242880,
      maxFiles: 5
    })
  ],

  // Handle unhandled promise rejections
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
      maxsize: 5242880,
      maxFiles: 5
    })
  ]
});

// Add console transport for non-production environments
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat,
    level: 'debug'
  }));
}

// Create child logger for specific modules
logger.child = (module) => {
  return logger.child({ module });
};

// Create audit logger for sensitive operations
logger.audit = (action, user, details = {}) => {
  logger.info('AUDIT_LOG', {
    action,
    user: user ? {
      id: user.id,
      email: user.email,
      role: user.role
    } : null,
    timestamp: new Date().toISOString(),
    ...details
  });
};

// Create security logger for security events
logger.security = (event, details = {}) => {
  logger.warn('SECURITY_EVENT', {
    event,
    timestamp: new Date().toISOString(),
    ...details
  });
};

// Create performance logger
logger.performance = (operation, duration, details = {}) => {
  logger.info('PERFORMANCE_LOG', {
    operation,
    duration,
    timestamp: new Date().toISOString(),
    ...details
  });
};

module.exports = logger;