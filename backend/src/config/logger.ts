import winston from 'winston';
import path from 'path';

// Define log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// Define log colors
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
};

winston.addColors(logColors);

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}${info.stack ? '\n' + info.stack : ''}`
  )
);

// Create transports
const transports = [];

// Console transport for development
if (process.env.NODE_ENV === 'development') {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
      level: 'debug'
    })
  );
} else {
  transports.push(
    new winston.transports.Console({
      format: logFormat,
      level: process.env.LOG_LEVEL || 'info'
    })
  );
}

// File transports
const logDir = process.env.LOG_DIR || 'logs';

transports.push(
  // All logs
  new winston.transports.File({
    filename: path.join(logDir, 'app.log'),
    format: logFormat,
    level: process.env.LOG_LEVEL || 'info',
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    tailable: true
  }),
  // Error logs
  new winston.transports.File({
    filename: path.join(logDir, 'error.log'),
    format: logFormat,
    level: 'error',
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    tailable: true
  })
);

// Create logger
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels: logLevels,
  format: logFormat,
  transports,
  exitOnError: false
});

// Create HTTP logger middleware
export const httpLogger = winston.createLogger({
  level: 'http',
  levels: logLevels,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, 'http.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    })
  ]
});

// Audit logger for sensitive operations
export const auditLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, 'audit.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 10,
      tailable: true
    })
  ]
});

// Stream for Morgan HTTP logging
export const httpLoggerStream = {
  write: (message: string) => {
    httpLogger.http(message.trim());
  }
};