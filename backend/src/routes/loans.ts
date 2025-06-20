import { Router } from 'express';
import { authenticate, authorize, requireActiveMembership } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';
import { auditLog } from '../middleware/logging';
import { asyncHandler, NotFoundError, ConflictError } from '../middleware/error';
import { prisma } from '../config/database';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get user's loans
router.get('/', asyncHandler(async (req, res) => {
  const loans = await prisma.loan.findMany({
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
    orderBy: { loanedAt: 'desc' }
  });

  res.json({
    success: true,
    message: 'Loans retrieved successfully',
    data: { loans }
  });
}));

// Get loan details
router.get('/:id',
  validate({ params: schemas.id }),
  asyncHandler(async (req, res) => {
    const loan = await prisma.loan.findFirst({
      where: { 
        id: req.params.id,
        userId: req.user!.id
      },
      include: {
        tool: {
          select: {
            id: true,
            name: true,
            brand: true,
            model: true,
            imageUrl: true,
            instructions: true,
            safetyNotes: true
          }
        }
      }
    });

    if (!loan) {
      throw new NotFoundError('Loan not found');
    }

    res.json({
      success: true,
      message: 'Loan retrieved successfully',
      data: { loan }
    });
  })
);

// Staff only routes
router.use(authorize('ADMIN', 'VOLUNTEER'));

// Create loan (staff only)
router.post('/',
  validate({ body: schemas.createLoan }),
  auditLog('CREATE', 'loan'),
  asyncHandler(async (req, res) => {
    const { toolId, dueDate, notes } = req.body;
    const { userId } = req.body; // Staff can specify which user

    // Verify tool is available
    const tool = await prisma.tool.findUnique({
      where: { id: toolId }
    });

    if (!tool || tool.status !== 'AVAILABLE') {
      throw new ConflictError('Tool is not available for loan');
    }

    // Create loan and update tool status
    const [loan] = await prisma.$transaction([
      prisma.loan.create({
        data: {
          userId,
          toolId,
          dueDate: new Date(dueDate),
          notes,
          conditionOut: tool.condition,
          checkedOutBy: req.user!.id
        },
        include: {
          tool: {
            select: {
              id: true,
              name: true,
              brand: true,
              model: true
            }
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      }),
      prisma.tool.update({
        where: { id: toolId },
        data: { status: 'CHECKED_OUT' }
      })
    ]);

    res.status(201).json({
      success: true,
      message: 'Loan created successfully',
      data: { loan }
    });
  })
);

// Return loan
router.put('/:id/return',
  validate({ params: schemas.id }),
  auditLog('UPDATE', 'loan_return'),
  asyncHandler(async (req, res) => {
    const { conditionIn, notes, damageFees = 0 } = req.body;

    const loan = await prisma.loan.findUnique({
      where: { id: req.params.id },
      include: { tool: true }
    });

    if (!loan) {
      throw new NotFoundError('Loan not found');
    }

    if (loan.status !== 'ACTIVE') {
      throw new ConflictError('Loan is not active');
    }

    // Calculate late fees
    const now = new Date();
    const isLate = now > loan.dueDate;
    const lateFees = isLate ? 
      Math.ceil((now.getTime() - loan.dueDate.getTime()) / (1000 * 60 * 60 * 24)) * 2 : 0;

    // Update loan and tool status
    await prisma.$transaction([
      prisma.loan.update({
        where: { id: req.params.id },
        data: {
          status: 'RETURNED',
          returnedAt: now,
          conditionIn: conditionIn || loan.conditionOut,
          notes: notes || loan.notes,
          lateFees,
          damageFees: parseFloat(damageFees),
          checkedInBy: req.user!.id
        }
      }),
      prisma.tool.update({
        where: { id: loan.toolId },
        data: { 
          status: 'AVAILABLE',
          condition: conditionIn || loan.tool.condition
        }
      })
    ]);

    res.json({
      success: true,
      message: 'Loan returned successfully',
      data: { lateFees, damageFees }
    });
  })
);

export default router;