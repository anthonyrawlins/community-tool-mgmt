import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/error';
import { prisma } from '../config/database';

const router = Router();

// All routes require admin authentication
router.use(authenticate);
router.use(authorize('ADMIN'));

// Dashboard statistics
router.get('/dashboard', asyncHandler(async (req, res) => {
  const [
    totalUsers,
    activeMembers,
    totalTools,
    availableTools,
    activeLoans,
    pendingReservations,
    overdueLoans,
    monthlyRevenue
  ] = await Promise.all([
    prisma.user.count(),
    prisma.member.count({ where: { isActive: true } }),
    prisma.tool.count({ where: { isActive: true } }),
    prisma.tool.count({ where: { status: 'AVAILABLE', isActive: true } }),
    prisma.loan.count({ where: { status: 'ACTIVE' } }),
    prisma.reservation.count({ where: { status: 'PENDING' } }),
    prisma.loan.count({
      where: {
        status: 'ACTIVE',
        dueDate: { lt: new Date() }
      }
    }),
    prisma.payment.aggregate({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      },
      _sum: { totalAmount: true }
    })
  ]);

  const stats = {
    users: {
      total: totalUsers,
      activeMembers
    },
    tools: {
      total: totalTools,
      available: availableTools,
      checkedOut: totalTools - availableTools
    },
    loans: {
      active: activeLoans,
      overdue: overdueLoans
    },
    reservations: {
      pending: pendingReservations
    },
    revenue: {
      thisMonth: monthlyRevenue._sum.totalAmount || 0
    }
  };

  res.json({
    success: true,
    message: 'Dashboard stats retrieved successfully',
    data: { stats }
  });
}));

// Get all users with details
router.get('/users', asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    include: {
      member: {
        select: {
          membershipNumber: true,
          tier: true,
          isActive: true,
          expiresAt: true
        }
      },
      _count: {
        select: {
          loans: true,
          reservations: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json({
    success: true,
    message: 'Users retrieved successfully',
    data: { users }
  });
}));

// Get all loans with details
router.get('/loans', asyncHandler(async (req, res) => {
  const loans = await prisma.loan.findMany({
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      },
      tool: {
        select: {
          id: true,
          name: true,
          brand: true,
          model: true
        }
      }
    },
    orderBy: { loanedAt: 'desc' }
  });

  res.json({
    success: true,
    message: 'Loans retrieved successfully',
    data: { loans }
  });
}));

// Get all reservations with details
router.get('/reservations', asyncHandler(async (req, res) => {
  const reservations = await prisma.reservation.findMany({
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      },
      tool: {
        select: {
          id: true,
          name: true,
          brand: true,
          model: true
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

// Get all payments
router.get('/payments', asyncHandler(async (req, res) => {
  const payments = await prisma.payment.findMany({
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json({
    success: true,
    message: 'Payments retrieved successfully',
    data: { payments }
  });
}));

export default router;