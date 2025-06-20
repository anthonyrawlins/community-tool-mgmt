import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';
import { auditLog } from '../middleware/logging';
import { asyncHandler, ConflictError } from '../middleware/error';
import { prisma } from '../config/database';
import { calculateMembershipFee, generateMembershipNumber } from '../utils/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get current membership
router.get('/current', asyncHandler(async (req, res) => {
  const member = await prisma.member.findUnique({
    where: { userId: req.user!.id },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      }
    }
  });

  res.json({
    success: true,
    message: 'Membership retrieved successfully',
    data: { member }
  });
}));

// Create membership
router.post('/',
  validate({ body: schemas.createMembership }),
  auditLog('CREATE', 'membership'),
  asyncHandler(async (req, res) => {
    const { tier = 'BASIC' } = req.body;

    // Check if user already has membership
    const existingMember = await prisma.member.findUnique({
      where: { userId: req.user!.id }
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
        userId: req.user!.id,
        membershipNumber: generateMembershipNumber(),
        tier,
        expiresAt,
        maxLoans,
        maxReservations
      }
    });

    // Calculate membership fee for payment
    const baseFee = tier === 'PREMIUM' ? 70 : 55;
    const feeCalculation = calculateMembershipFee(baseFee);

    res.status(201).json({
      success: true,
      message: 'Membership created successfully',
      data: { 
        member,
        fee: feeCalculation
      }
    });
  })
);

// Renew membership
router.post('/renew',
  auditLog('UPDATE', 'membership_renewal'),
  asyncHandler(async (req, res) => {
    const member = await prisma.member.findUnique({
      where: { userId: req.user!.id }
    });

    if (!member) {
      throw new ConflictError('No membership found to renew');
    }

    // Extend membership by 1 year from current expiration
    const newExpirationDate = new Date(member.expiresAt);
    newExpirationDate.setFullYear(newExpirationDate.getFullYear() + 1);

    const updatedMember = await prisma.member.update({
      where: { id: member.id },
      data: {
        expiresAt: newExpirationDate,
        isActive: true
      }
    });

    // Calculate renewal fee
    const baseFee = member.tier === 'PREMIUM' ? 70 : 55;
    const feeCalculation = calculateMembershipFee(baseFee);

    res.json({
      success: true,
      message: 'Membership renewed successfully',
      data: { 
        member: updatedMember,
        fee: feeCalculation
      }
    });
  })
);

export default router;