import { Router } from 'express';
import { authenticate, authorize } from '@/middleware/auth';
import { validate, schemas } from '@/middleware/validation';
import { auditLog } from '@/middleware/logging';
import { asyncHandler, NotFoundError, ConflictError } from '@/middleware/error';
import { prisma } from '@/config/database';

const router = Router();

// Get all categories (public)
router.get('/', asyncHandler(async (req, res) => {
  const categories = await prisma.toolCategory.findMany({
    where: { isActive: true },
    include: {
      parent: {
        select: {
          id: true,
          name: true
        }
      },
      children: {
        select: {
          id: true,
          name: true,
          description: true
        }
      },
      _count: {
        select: {
          tools: {
            where: { isActive: true }
          }
        }
      }
    },
    orderBy: { name: 'asc' }
  });

  res.json({
    success: true,
    message: 'Categories retrieved successfully',
    data: { categories }
  });
}));

// Admin only routes
router.use(authenticate);
router.use(authorize('ADMIN'));

// Create category
router.post('/',
  validate({ body: schemas.createCategory }),
  auditLog('CREATE', 'category'),
  asyncHandler(async (req, res) => {
    const { name, description, parentId } = req.body;

    // Check for duplicate name
    const existing = await prisma.toolCategory.findFirst({
      where: { name, isActive: true }
    });

    if (existing) {
      throw new ConflictError('Category with this name already exists');
    }

    const category = await prisma.toolCategory.create({
      data: { name, description, parentId },
      include: {
        parent: {
          select: { id: true, name: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { category }
    });
  })
);

// Update category
router.put('/:id',
  validate({ params: schemas.id }),
  auditLog('UPDATE', 'category'),
  asyncHandler(async (req, res) => {
    const category = await prisma.toolCategory.update({
      where: { id: req.params.id },
      data: req.body,
      include: {
        parent: {
          select: { id: true, name: true }
        }
      }
    });

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: { category }
    });
  })
);

// Delete category
router.delete('/:id',
  validate({ params: schemas.id }),
  auditLog('DELETE', 'category'),
  asyncHandler(async (req, res) => {
    // Check if category has tools
    const toolCount = await prisma.tool.count({
      where: { categoryId: req.params.id, isActive: true }
    });

    if (toolCount > 0) {
      throw new ConflictError('Cannot delete category with associated tools');
    }

    await prisma.toolCategory.update({
      where: { id: req.params.id },
      data: { isActive: false }
    });

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  })
);

export default router;