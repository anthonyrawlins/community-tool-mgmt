import { Router } from 'express';
import { authenticate, requireActiveMembership } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';
import { auditLog } from '../middleware/logging';
import { asyncHandler, NotFoundError, ConflictError } from '../middleware/error';
import { prisma } from '../config/database';

const router = Router();

// All routes require authentication and active membership
router.use(authenticate);
router.use(requireActiveMembership);

// Get user's reservations
router.get('/', asyncHandler(async (req, res) => {
  const reservations = await prisma.reservation.findMany({
    where: { userId: req.user!.id },
    include: {
      tool: {
        select: {
          id: true,
          name: true,
          brand: true,
          model: true,
          imageUrl: true
        }
      }
    },
    orderBy: { startDate: 'asc' }
  });

  res.json({
    success: true,
    message: 'Reservations retrieved successfully',
    data: { reservations }
  });
}));

// Create reservation
router.post('/',
  validate({ body: schemas.createReservation }),
  auditLog('CREATE', 'reservation'),
  asyncHandler(async (req, res) => {
    const { toolId, startDate, endDate, notes } = req.body;

    // Check if user has reached reservation limit
    const member = await prisma.member.findUnique({
      where: { userId: req.user!.id },
      include: {
        user: {
          include: {
            reservations: {
              where: {
                status: { in: ['PENDING', 'CONFIRMED'] }
              }
            }
          }
        }
      }
    });

    if (!member) {
      throw new ConflictError('Active membership required');
    }

    if (member.user.reservations.length >= member.maxReservations) {
      throw new ConflictError(`Maximum ${member.maxReservations} reservations allowed`);
    }

    // Check tool availability for the requested period
    const conflictingReservations = await prisma.reservation.count({
      where: {
        toolId,
        status: { in: ['PENDING', 'CONFIRMED'] },
        OR: [
          {
            AND: [
              { startDate: { lte: new Date(endDate) } },
              { endDate: { gte: new Date(startDate) } }
            ]
          }
        ]
      }
    });

    const conflictingLoans = await prisma.loan.count({
      where: {
        toolId,
        status: 'ACTIVE',
        OR: [
          {
            AND: [
              { loanedAt: { lte: new Date(endDate) } },
              { dueDate: { gte: new Date(startDate) } }
            ]
          }
        ]
      }
    });

    if (conflictingReservations > 0 || conflictingLoans > 0) {
      throw new ConflictError('Tool is not available for the requested period');
    }

    const reservation = await prisma.reservation.create({
      data: {
        userId: req.user!.id,
        toolId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        notes,
        status: 'PENDING'
      },
      include: {
        tool: {
          select: {
            id: true,
            name: true,
            brand: true,
            model: true,
            imageUrl: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Reservation created successfully',
      data: { reservation }
    });
  })
);

// Update reservation
router.put('/:id',
  validate({ params: schemas.id }),
  auditLog('UPDATE', 'reservation'),
  asyncHandler(async (req, res) => {
    const { startDate, endDate, notes } = req.body;

    const reservation = await prisma.reservation.findFirst({
      where: { 
        id: req.params.id,
        userId: req.user!.id
      }
    });

    if (!reservation) {
      throw new NotFoundError('Reservation not found');
    }

    if (reservation.status !== 'PENDING') {
      throw new ConflictError('Can only update pending reservations');
    }

    const updatedReservation = await prisma.reservation.update({
      where: { id: req.params.id },
      data: {
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        notes
      },
      include: {
        tool: {
          select: {
            id: true,
            name: true,
            brand: true,
            model: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Reservation updated successfully',
      data: { reservation: updatedReservation }
    });
  })
);

// Cancel reservation
router.delete('/:id',
  validate({ params: schemas.id }),
  auditLog('DELETE', 'reservation'),
  asyncHandler(async (req, res) => {
    const reservation = await prisma.reservation.findFirst({
      where: { 
        id: req.params.id,
        userId: req.user!.id
      }
    });

    if (!reservation) {
      throw new NotFoundError('Reservation not found');
    }

    if (reservation.status === 'COMPLETED') {
      throw new ConflictError('Cannot cancel completed reservation');
    }

    await prisma.reservation.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED' }
    });

    res.json({
      success: true,
      message: 'Reservation cancelled successfully'
    });
  })
);

export default router;