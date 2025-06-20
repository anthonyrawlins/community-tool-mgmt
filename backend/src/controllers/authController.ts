import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { asyncHandler } from '../middleware/error';
import { logger } from '../config/logger';

export class AuthController {
  /**
   * Register new user
   * POST /api/v1/auth/register
   */
  static register = asyncHandler(async (req: Request, res: Response) => {
    const authResponse = await AuthService.register(req.body);

    logger.info('User registered successfully', {
      userId: authResponse.user.id,
      email: authResponse.user.email
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: authResponse
    });
  });

  /**
   * Login user
   * POST /api/v1/auth/login
   */
  static login = asyncHandler(async (req: Request, res: Response) => {
    const authResponse = await AuthService.login(req.body);

    logger.info('User logged in successfully', {
      userId: authResponse.user.id,
      email: authResponse.user.email
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: authResponse
    });
  });

  /**
   * Get current user profile
   * GET /api/v1/auth/profile
   */
  static getProfile = asyncHandler(async (req: Request, res: Response) => {
    const user = await AuthService.getUserProfile(req.user!.id);

    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: { user }
    });
  });

  /**
   * Update user profile
   * PUT /api/v1/auth/profile
   */
  static updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const user = await AuthService.updateProfile(req.user!.id, req.body);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  });

  /**
   * Change password
   * POST /api/v1/auth/change-password
   */
  static changePassword = asyncHandler(async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    
    await AuthService.changePassword(req.user!.id, currentPassword, newPassword);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  });

  /**
   * Logout user (client-side token invalidation)
   * POST /api/v1/auth/logout
   */
  static logout = asyncHandler(async (req: Request, res: Response) => {
    // In a JWT-based system, logout is typically handled client-side
    // Here we can log the logout event for audit purposes
    logger.info('User logged out', {
      userId: req.user?.id,
      email: req.user?.email
    });

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  });

  /**
   * Create membership for current user
   * POST /api/v1/auth/create-membership
   */
  static createMembership = asyncHandler(async (req: Request, res: Response) => {
    const { tier = 'BASIC' } = req.body;
    
    const member = await AuthService.createMembership(req.user!.id, tier);

    res.status(201).json({
      success: true,
      message: 'Membership created successfully',
      data: { member }
    });
  });
}