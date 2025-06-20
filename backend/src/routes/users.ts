import { Router } from 'express';
import { authenticate, authorize } from '@/middleware/auth';
import { validate, schemas } from '@/middleware/validation';
import { auditLog } from '@/middleware/logging';
import { asyncHandler } from '@/middleware/error';
import { prisma } from '@/config/database';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get current user profile
router.get('/profile', asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      address: true,
      suburb: true,
      postcode: true,
      state: true,
      role: true,
      createdAt: true,
      member: {
        select: {
          id: true,
          membershipNumber: true,
          tier: true,
          isActive: true,
          expiresAt: true,
          maxLoans: true,
          maxReservations: true
        }
      }
    }
  });

  res.json({
    success: true,
    message: 'Profile retrieved successfully',
    data: { user }
  });
}));

// Update current user profile
router.put('/profile',
  validate({ body: schemas.updateProfile }),
  auditLog('UPDATE', 'user_profile'),
  asyncHandler(async (req, res) => {
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: req.body,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        address: true,
        suburb: true,
        postcode: true,
        state: true,
        role: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  })
);

// Admin only routes
router.use(authorize('ADMIN'));

// Get all users (admin only)
router.get('/',
  validate({ query: schemas.pagination }),
  asyncHandler(async (req, res) => {
    const { page, limit, search } = req.query as any;
    const skip = (page - 1) * limit;

    const where = search ? {
      OR: [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    } : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          member: {
            select: {
              membershipNumber: true,
              tier: true,
              isActive: true,
              expiresAt: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      }
    });
  })
);

export default router;