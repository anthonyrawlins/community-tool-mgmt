import { Router } from 'express';
import { ToolController } from '@/controllers/toolController';
import { validate, schemas } from '@/middleware/validation';
import { authenticate, authorize, optionalAuth } from '@/middleware/auth';
import { auditLog } from '@/middleware/logging';

const router = Router();

// Public routes (tools can be viewed by anyone)
router.get('/categories', ToolController.getCategories);

router.get('/', 
  optionalAuth,
  validate({ query: schemas.pagination }),
  ToolController.getTools
);

router.get('/:id',
  optionalAuth,
  validate({ params: schemas.id }),
  ToolController.getToolById
);

router.get('/:id/availability',
  validate({ params: schemas.id }),
  ToolController.checkAvailability
);

// Protected routes - require authentication and admin privileges
router.use(authenticate);
router.use(authorize('ADMIN', 'VOLUNTEER'));

router.post('/',
  validate({ body: schemas.createTool }),
  auditLog('CREATE', 'tool'),
  ToolController.createTool
);

router.put('/:id',
  validate({ 
    params: schemas.id,
    body: schemas.updateTool
  }),
  auditLog('UPDATE', 'tool'),
  ToolController.updateTool
);

router.delete('/:id',
  validate({ params: schemas.id }),
  auditLog('DELETE', 'tool'),
  ToolController.deleteTool
);

export default router;