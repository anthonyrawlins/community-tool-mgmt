import { Request, Response, NextFunction } from 'express';
import { logger, auditLogger } from '@/config/logger';

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // Log request
  logger.http('Incoming Request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id
  });

  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(body) {
    const duration = Date.now() - start;
    
    logger.http('Outgoing Response', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?.id
    });

    return originalJson.call(this, body);
  };

  next();
};

// Audit logging for sensitive operations
export const auditLog = (action: string, resource: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json;
    
    res.json = function(body) {
      // Only log successful operations (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        auditLogger.info('Audit Log', {
          action,
          resource,
          userId: req.user?.id,
          userEmail: req.user?.email,
          method: req.method,
          url: req.url,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          timestamp: new Date().toISOString(),
          statusCode: res.statusCode
        });
      }
      
      return originalJson.call(this, body);
    };

    next();
  };
};