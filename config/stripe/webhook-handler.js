const express = require('express');
const { verifyWebhookSignature, handleWebhookEvent } = require('./stripe.config');
const logger = require('../logging/winston.config');

const router = express.Router();

// Stripe webhook endpoint
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.get('stripe-signature');
  const payload = req.body;

  try {
    // Verify webhook signature
    const event = verifyWebhookSignature(payload, signature);
    
    logger.info('Stripe webhook received', {
      event_type: event.type,
      event_id: event.id,
      livemode: event.livemode
    });

    // Handle the event
    const result = await handleWebhookEvent(event);
    
    logger.info('Stripe webhook processed', {
      event_type: event.type,
      event_id: event.id,
      result
    });

    res.status(200).json({ received: true });
  } catch (error) {
    logger.error('Stripe webhook error', {
      error: error.message,
      stack: error.stack,
      signature: signature ? 'present' : 'missing'
    });

    res.status(400).json({
      error: 'Webhook signature verification failed',
      code: 'WEBHOOK_VERIFICATION_FAILED'
    });
  }
});

// Health check for webhook endpoint
router.get('/stripe/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    webhook_url: `${process.env.BACKEND_URL}/api/webhooks/stripe`
  });
});

module.exports = router;