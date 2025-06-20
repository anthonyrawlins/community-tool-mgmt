import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '@/utils/auth';
import { AuthUser, JWTPayload } from '@/types/auth';
import { prisma } from '@/config/database';
import { UserRole } from '@prisma/client';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify token
    const payload: JWTPayload = verifyAccessToken(token);
    
    // Get user from database to ensure they still exist and are active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        member: {
          select: {
            id: true,
            membershipNumber: true,
            tier: true,
            isActive: true,
            expiresAt: true
          }
        }
      }
    });
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account not found or inactive'
      });
    }
    
    // Check if membership is expired (for members)
    if (user.member && user.member.expiresAt < new Date()) {
      return res.status(401).json({
        success: false,
        message: 'Membership has expired. Please renew your membership.'
      });
    }
    
    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      member: user.member
    };
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

/**
 * Middleware to authorize specific roles
 */
export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }
    
    next();
  };
};

/**
 * Middleware to check if user is an active member
 */
export const requireActiveMembership = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  
  if (!req.user.member) {
    return res.status(403).json({
      success: false,
      message: 'Active membership required'
    });
  }
  
  if (!req.user.member.isActive) {
    return res.status(403).json({
      success: false,
      message: 'Membership is not active'
    });
  }
  
  if (req.user.member.expiresAt < new Date()) {
    return res.status(403).json({
      success: false,
      message: 'Membership has expired. Please renew your membership.'
    });
  }
  
  next();
};

/**
 * Optional authentication - sets user if token is valid but doesn't fail if not
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    
    const token = authHeader.substring(7);
    const payload: JWTPayload = verifyAccessToken(token);
    
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        member: {
          select: {
            id: true,
            membershipNumber: true,
            tier: true,
            isActive: true,
            expiresAt: true
          }
        }
      }
    });
    
    if (user && user.isActive) {
      req.user = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        member: user.member
      };
    }
    
    next();
  } catch (error) {
    // If token is invalid, just continue without setting user
    next();
  }
};