import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { ValidationError } from './error';

// Generic validation middleware
export const validate = (schema: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }
      
      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }
      
      if (schema.params) {
        req.params = schema.params.parse(req.params);
      }
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(err => {
          const path = err.path.join('.');
          return `${path}: ${err.message}`;
        });
        
        throw new ValidationError(`Validation failed: ${errorMessages.join(', ')}`);
      }
      
      throw error;
    }
  };
};

// Common validation schemas
export const schemas = {
  // ID parameter validation
  id: z.object({
    id: z.string().min(1, 'ID is required')
  }),

  // Pagination query validation
  pagination: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('asc'),
    search: z.string().optional()
  }),

  // User registration validation
  register: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    phone: z.string().optional(),
    address: z.string().optional(),
    suburb: z.string().optional(),
    postcode: z.string().optional(),
    state: z.string().optional()
  }).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
  }),

  // User login validation
  login: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required')
  }),

  // Password change validation
  changePassword: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string()
  }).refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
  }),

  // User profile update validation
  updateProfile: z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    suburb: z.string().optional(),
    postcode: z.string().optional(),
    state: z.string().optional()
  }),

  // Tool creation validation
  createTool: z.object({
    name: z.string().min(1, 'Tool name is required'),
    description: z.string().optional(),
    brand: z.string().optional(),
    model: z.string().optional(),
    serialNumber: z.string().optional(),
    barcode: z.string().optional(),
    categoryId: z.string().min(1, 'Category is required'),
    condition: z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'NEEDS_REPAIR', 'OUT_OF_SERVICE']).default('GOOD'),
    location: z.string().optional(),
    purchaseDate: z.string().datetime().optional(),
    purchasePrice: z.number().positive().optional(),
    replacementValue: z.number().positive().optional(),
    loanPeriodDays: z.number().positive().default(7),
    maxLoanDays: z.number().positive().default(14),
    requiresDeposit: z.boolean().default(false),
    depositAmount: z.number().positive().optional(),
    instructions: z.string().optional(),
    safetyNotes: z.string().optional()
  }),

  // Tool update validation
  updateTool: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    brand: z.string().optional(),
    model: z.string().optional(),
    serialNumber: z.string().optional(),
    barcode: z.string().optional(),
    categoryId: z.string().optional(),
    condition: z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'NEEDS_REPAIR', 'OUT_OF_SERVICE']).optional(),
    status: z.enum(['AVAILABLE', 'CHECKED_OUT', 'RESERVED', 'MAINTENANCE', 'RETIRED']).optional(),
    location: z.string().optional(),
    purchaseDate: z.string().datetime().optional(),
    purchasePrice: z.number().positive().optional(),
    replacementValue: z.number().positive().optional(),
    loanPeriodDays: z.number().positive().optional(),
    maxLoanDays: z.number().positive().optional(),
    requiresDeposit: z.boolean().optional(),
    depositAmount: z.number().positive().optional(),
    instructions: z.string().optional(),
    safetyNotes: z.string().optional()
  }),

  // Loan creation validation
  createLoan: z.object({
    toolId: z.string().min(1, 'Tool ID is required'),
    dueDate: z.string().datetime('Invalid due date format'),
    notes: z.string().optional()
  }),

  // Reservation creation validation
  createReservation: z.object({
    toolId: z.string().min(1, 'Tool ID is required'),
    startDate: z.string().datetime('Invalid start date format'),
    endDate: z.string().datetime('Invalid end date format'),
    notes: z.string().optional()
  }).refine(data => new Date(data.endDate) > new Date(data.startDate), {
    message: "End date must be after start date",
    path: ["endDate"]
  }),

  // Category creation validation
  createCategory: z.object({
    name: z.string().min(1, 'Category name is required'),
    description: z.string().optional(),
    parentId: z.string().optional()
  }),

  // Membership creation validation
  createMembership: z.object({
    userId: z.string().min(1, 'User ID is required'),
    tier: z.enum(['BASIC', 'PREMIUM']).default('BASIC')
  })
};