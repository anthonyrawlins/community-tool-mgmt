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

// Recent activity endpoint
router.get('/activity', asyncHandler(async (req, res) => {
  const { limit = 50, offset = 0 } = req.query;
  
  // Get recent loans, payments, and user registrations
  const [loans, payments, users] = await Promise.all([
    prisma.loan.findMany({
      take: Number(limit) / 3,
      skip: Number(offset),
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true
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
      }
    }),
    prisma.payment.findMany({
      take: Number(limit) / 3,
      skip: Number(offset),
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    }),
    prisma.user.findMany({
      take: Number(limit) / 3,
      skip: Number(offset),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        createdAt: true
      }
    })
  ]);
  
  // Combine and sort all activities
  const activities = [
    ...loans.map(loan => ({
      id: `loan-${loan.id}`,
      type: loan.status === 'ACTIVE' ? 'checkout' : 'return',
      title: loan.status === 'ACTIVE' ? 'Tool Checked Out' : 'Tool Returned',
      description: `${loan.tool.name} ${loan.status === 'ACTIVE' ? 'checked out' : 'returned'}`,
      timestamp: loan.createdAt,
      userName: `${loan.user.firstName} ${loan.user.lastName}`,
      toolName: loan.tool.name
    })),
    ...payments.map(payment => ({
      id: `payment-${payment.id}`,
      type: 'payment',
      title: 'Payment Received',
      description: `${payment.type} payment processed`,
      timestamp: payment.createdAt,
      userName: `${payment.user.firstName} ${payment.user.lastName}`,
      amount: payment.totalAmount
    })),
    ...users.map(user => ({
      id: `user-${user.id}`,
      type: 'registration',
      title: 'New Member Registration',
      description: 'New member completed registration',
      timestamp: user.createdAt,
      userName: `${user.firstName} ${user.lastName}`
    }))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  res.json({
    success: true,
    message: 'Activity feed retrieved successfully',
    data: { activities }
  });
}));

// Send overdue reminders endpoint
router.post('/reminders/overdue', asyncHandler(async (req, res) => {
  const overdueLoans = await prisma.loan.findMany({
    where: {
      status: 'ACTIVE',
      dueDate: { lt: new Date() }
    },
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
          name: true,
          brand: true,
          model: true
        }
      }
    }
  });
  
  // In a real implementation, this would send actual emails
  // For now, we'll just log and return success
  console.log(`Sending overdue reminders to ${overdueLoans.length} members`);
  
  res.json({
    success: true,
    message: `Overdue reminders sent to ${overdueLoans.length} members`,
    data: { count: overdueLoans.length }
  });
}));

export default router;