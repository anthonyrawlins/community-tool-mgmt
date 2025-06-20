import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { logger } from '@/config/logger';
import { errorHandler, notFoundHandler } from '@/middleware/error';
import { requestLogger } from '@/middleware/logging';
import { generalRateLimit } from '@/middleware/rateLimit';
import { prisma } from '@/config/database';

// Import routes
import authRoutes from '@/routes/auth';
import userRoutes from '@/routes/users';
import toolRoutes from '@/routes/tools';
import loanRoutes from '@/routes/loans';
import reservationRoutes from '@/routes/reservations';
import membershipRoutes from '@/routes/memberships';
import paymentRoutes from '@/routes/payments';
import categoryRoutes from '@/routes/categories';
import adminRoutes from '@/routes/admin';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const API_VERSION = process.env.API_VERSION || 'v1';

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(requestLogger);

// Rate limiting
app.use(generalRateLimit);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Ballarat Tool Library API is running',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
const apiRouter = express.Router();

// Mount all routes under /api/v1
apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/tools', toolRoutes);
apiRouter.use('/loans', loanRoutes);
apiRouter.use('/reservations', reservationRoutes);
apiRouter.use('/memberships', membershipRoutes);
apiRouter.use('/payments', paymentRoutes);
apiRouter.use('/categories', categoryRoutes);
apiRouter.use('/admin', adminRoutes);

app.use(`/api/${API_VERSION}`, apiRouter);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API documentation
app.get('/api-docs', (req, res) => {
  res.json({
    success: true,
    message: 'API Documentation',
    version: API_VERSION,
    endpoints: {
      auth: {
        'POST /api/v1/auth/register': 'Register new user',
        'POST /api/v1/auth/login': 'User login',
        'POST /api/v1/auth/refresh': 'Refresh access token',
        'POST /api/v1/auth/logout': 'User logout',
        'POST /api/v1/auth/forgot-password': 'Request password reset',
        'POST /api/v1/auth/reset-password': 'Reset password'
      },
      users: {
        'GET /api/v1/users/profile': 'Get user profile',
        'PUT /api/v1/users/profile': 'Update user profile',
        'POST /api/v1/users/change-password': 'Change password'
      },
      tools: {
        'GET /api/v1/tools': 'List all tools',
        'GET /api/v1/tools/:id': 'Get tool details',
        'POST /api/v1/tools': 'Create new tool (admin)',
        'PUT /api/v1/tools/:id': 'Update tool (admin)',
        'DELETE /api/v1/tools/:id': 'Delete tool (admin)'
      },
      loans: {
        'GET /api/v1/loans': 'List user loans',
        'POST /api/v1/loans': 'Create new loan (staff)',
        'PUT /api/v1/loans/:id/return': 'Return loan',
        'GET /api/v1/loans/:id': 'Get loan details'
      },
      reservations: {
        'GET /api/v1/reservations': 'List user reservations',
        'POST /api/v1/reservations': 'Create reservation',
        'PUT /api/v1/reservations/:id': 'Update reservation',
        'DELETE /api/v1/reservations/:id': 'Cancel reservation'
      },
      memberships: {
        'POST /api/v1/memberships': 'Create membership',
        'GET /api/v1/memberships/current': 'Get current membership',
        'POST /api/v1/memberships/renew': 'Renew membership'
      },
      payments: {
        'GET /api/v1/payments': 'List user payments',
        'POST /api/v1/payments/create-session': 'Create Stripe payment session',
        'POST /api/v1/payments/webhook': 'Stripe webhook handler'
      },
      categories: {
        'GET /api/v1/categories': 'List tool categories',
        'POST /api/v1/categories': 'Create category (admin)',
        'PUT /api/v1/categories/:id': 'Update category (admin)',
        'DELETE /api/v1/categories/:id': 'Delete category (admin)'
      },
      admin: {
        'GET /api/v1/admin/dashboard': 'Admin dashboard stats',
        'GET /api/v1/admin/users': 'List all users',
        'GET /api/v1/admin/loans': 'List all loans',
        'GET /api/v1/admin/reservations': 'List all reservations',
        'GET /api/v1/admin/payments': 'List all payments'
      }
    }
  });
});

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Graceful shutdown
const gracefulShutdown = async () => {
  logger.info('Received shutdown signal, closing HTTP server...');
  
  try {
    await prisma.$disconnect();
    logger.info('Database connection closed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('Database connected successfully');
    
    const server = app.listen(PORT, '0.0.0.0', () => {
      logger.info(`🚀 Ballarat Tool Library API server running on port ${PORT}`);
      logger.info(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🌐 Health check: http://0.0.0.0:${PORT}/health`);
      logger.info(`📖 API Documentation: http://0.0.0.0:${PORT}/api-docs`);
    });

    // Handle server errors
    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${PORT} is already in use`);
      } else {
        logger.error('Server error:', error);
      }
      process.exit(1);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;