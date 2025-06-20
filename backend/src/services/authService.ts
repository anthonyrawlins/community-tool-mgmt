import { prisma } from '../config/database';
import { hashPassword, comparePassword, generateAccessToken, generateRefreshToken, generateMembershipNumber, getTokenExpirationTime } from '../utils/auth';
import { LoginRequest, RegisterRequest, AuthResponse, AuthUser } from '../types/auth';
import { ConflictError, UnauthorizedError, NotFoundError } from '../middleware/error';
import { auditLogger } from '../config/logger';

export class AuthService {
  /**
   * Register a new user
   */
  static async register(data: RegisterRequest): Promise<AuthResponse> {
    const { email, password, firstName, lastName, phone, address, suburb, postcode, state } = data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        address,
        suburb,
        postcode,
        state,
        role: 'MEMBER'
      }
    });

    // Log registration
    auditLogger.info('User Registration', {
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    });

    // Generate tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      member: null
    };

    return {
      user: authUser,
      accessToken,
      refreshToken,
      expiresIn: getTokenExpirationTime()
    };
  }

  /**
   * Login user
   */
  static async login(data: LoginRequest): Promise<AuthResponse> {
    const { email, password } = data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
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
      throw new UnauthorizedError('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // Log successful login
    auditLogger.info('User Login', {
      userId: user.id,
      email: user.email
    });

    // Generate tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      memberId: user.member?.id
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      member: user.member
    };

    return {
      user: authUser,
      accessToken,
      refreshToken,
      expiresIn: getTokenExpirationTime()
    };
  }

  /**
   * Create membership for user
   */
  static async createMembership(userId: string, tier: 'BASIC' | 'PREMIUM') {
    // Check if user already has an active membership
    const existingMember = await prisma.member.findUnique({
      where: { userId }
    });

    if (existingMember && existingMember.isActive) {
      throw new ConflictError('User already has an active membership');
    }

    // Calculate membership expiration (1 year from now)
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    // Set membership limits based on tier
    const maxLoans = tier === 'PREMIUM' ? 5 : 3;
    const maxReservations = tier === 'PREMIUM' ? 4 : 2;

    const member = await prisma.member.create({
      data: {
        userId,
        membershipNumber: generateMembershipNumber(),
        tier,
        expiresAt,
        maxLoans,
        maxReservations
      }
    });

    auditLogger.info('Membership Created', {
      userId,
      memberId: member.id,
      membershipNumber: member.membershipNumber,
      tier
    });

    return member;
  }

  /**
   * Get user profile with membership info
   */
  static async getUserProfile(userId: string): Promise<AuthUser> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
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

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      member: user.member
    };
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, data: Partial<{
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    suburb: string;
    postcode: string;
    state: string;
  }>) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
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

    auditLogger.info('Profile Updated', {
      userId,
      updatedFields: Object.keys(data)
    });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      member: user.member
    };
  }

  /**
   * Change user password
   */
  static async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });

    auditLogger.info('Password Changed', {
      userId,
      email: user.email
    });
  }
}