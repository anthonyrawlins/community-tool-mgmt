import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

/**
 * Hash a password using bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
  return bcrypt.hash(password, saltRounds);
};

/**
 * Compare a password with its hash
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

/**
 * Generate JWT access token
 */
export const generateAccessToken = (payload: JWTPayload): string => {
  return (jwt as any).sign(
    payload, 
    JWT_SECRET, 
    { 
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'ballarat-tool-library',
      audience: 'ballarat-tool-library-users'
    }
  );
};

/**
 * Generate JWT refresh token
 */
export const generateRefreshToken = (payload: JWTPayload): string => {
  return (jwt as any).sign(
    payload, 
    JWT_REFRESH_SECRET, 
    { 
      expiresIn: JWT_REFRESH_EXPIRES_IN,
      issuer: 'ballarat-tool-library',
      audience: 'ballarat-tool-library-users'
    }
  );
};

/**
 * Verify JWT access token
 */
export const verifyAccessToken = (token: string): JWTPayload => {
  try {
    return (jwt as any).verify(token, JWT_SECRET, {
      issuer: 'ballarat-tool-library',
      audience: 'ballarat-tool-library-users'
    }) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
};

/**
 * Verify JWT refresh token
 */
export const verifyRefreshToken = (token: string): JWTPayload => {
  try {
    return (jwt as any).verify(token, JWT_REFRESH_SECRET, {
      issuer: 'ballarat-tool-library',
      audience: 'ballarat-tool-library-users'
    }) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

/**
 * Generate membership number
 */
export const generateMembershipNumber = (): string => {
  const prefix = 'BTL';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

/**
 * Calculate membership fee with GST
 */
export const calculateMembershipFee = (baseFee: number): { base: number; gst: number; total: number } => {
  const gstRate = parseFloat(process.env.GST_RATE || '0.10');
  const gst = baseFee * gstRate;
  const total = baseFee + gst;
  
  return {
    base: Math.round(baseFee * 100) / 100,
    gst: Math.round(gst * 100) / 100,
    total: Math.round(total * 100) / 100
  };
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Get token expiration time in seconds
 */
export const getTokenExpirationTime = (): number => {
  const expiresIn = JWT_EXPIRES_IN;
  
  // Convert to seconds
  if (expiresIn.endsWith('d')) {
    return parseInt(expiresIn) * 24 * 60 * 60;
  } else if (expiresIn.endsWith('h')) {
    return parseInt(expiresIn) * 60 * 60;
  } else if (expiresIn.endsWith('m')) {
    return parseInt(expiresIn) * 60;
  } else if (expiresIn.endsWith('s')) {
    return parseInt(expiresIn);
  }
  
  // Default to 7 days
  return 7 * 24 * 60 * 60;
};