import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/error';
import { prisma } from '../config/database';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get user's payments
router.get('/', asyncHandler(async (req, res) => {
  const payments = await prisma.payment.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: 'desc' }
  });

  res.json({
    success: true,
    message: 'Payments retrieved successfully',
    data: { payments }
  });
}));

// Create Stripe payment session (placeholder - would integrate with Stripe)
router.post('/create-session', asyncHandler(async (req, res) => {
  const { amount, type, description } = req.body;

  // This is a placeholder - in a real implementation you would:
  // 1. Create a Stripe checkout session
  // 2. Store the payment record with PENDING status
  // 3. Return the session URL for redirect

  const payment = await prisma.payment.create({
    data: {
      userId: req.user!.id,
      type,
      amount: parseFloat(amount),
      gstAmount: parseFloat(amount) * 0.10,
      totalAmount: parseFloat(amount) * 1.10,
      description,
      status: 'PENDING'
    }
  });

  res.json({
    success: true,
    message: 'Payment session created',
    data: { 
      payment,
      // In real implementation, return Stripe session URL
      checkoutUrl: `http://localhost:3000/payment/checkout/${payment.id}`
    }
  });
}));

// Stripe webhook handler (placeholder)
router.post('/webhook', asyncHandler(async (req, res) => {
  // This would handle Stripe webhook events
  // Verify webhook signature and update payment status
  
  res.json({
    success: true,
    message: 'Webhook processed'
  });
}));

export default router;