import { Router } from 'express';
import { AuthController } from '@/controllers/authController';
import { validate, schemas } from '@/middleware/validation';
import { authenticate } from '@/middleware/auth';
import { authRateLimit, passwordResetRateLimit } from '@/middleware/rateLimit';
import { auditLog } from '@/middleware/logging';

const router = Router();

// Public routes
router.post('/register', 
  authRateLimit,
  validate({ body: schemas.register }),
  auditLog('CREATE', 'user'),
  AuthController.register
);

router.post('/login',
  authRateLimit,
  validate({ body: schemas.login }),
  auditLog('LOGIN', 'user'),
  AuthController.login
);

// Protected routes
router.use(authenticate); // All routes below require authentication

router.get('/profile',
  AuthController.getProfile
);

router.put('/profile',
  validate({ body: schemas.updateProfile }),
  auditLog('UPDATE', 'user_profile'),
  AuthController.updateProfile
);

router.post('/change-password',
  validate({ body: schemas.changePassword }),
  auditLog('UPDATE', 'user_password'),
  AuthController.changePassword
);

router.post('/logout',
  auditLog('LOGOUT', 'user'),
  AuthController.logout
);

router.post('/create-membership',
  auditLog('CREATE', 'membership'),
  AuthController.createMembership
);

export default router;