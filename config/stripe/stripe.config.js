const Stripe = require('stripe');

// Initialize Stripe with the secret key
const stripe = Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  appInfo: {
    name: 'Ballarat Tool Library',
    version: '1.0.0',
    url: 'https://ballarattoollibrary.org.au'
  }
});

// Australian GST configuration
const GST_RATE = parseFloat(process.env.GST_RATE) || 0.10;
const BUSINESS_ABN = process.env.BUSINESS_ABN;
const BUSINESS_NAME = process.env.BUSINESS_NAME || 'Ballarat Tool Library';

// Australian currency
const CURRENCY = 'aud';

// Stripe webhook configuration
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// Payment intent configuration
const createPaymentIntentConfig = {
  currency: CURRENCY,
  automatic_payment_methods: {
    enabled: true,
  },
  metadata: {
    business_abn: BUSINESS_ABN,
    business_name: BUSINESS_NAME,
    gst_rate: GST_RATE.toString()
  }
};

// Product categories for different GST treatment
const PRODUCT_CATEGORIES = {
  TOOL_RENTAL: {
    name: 'Tool Rental',
    gst_applicable: true,
    description: 'Tool rental services'
  },
  MEMBERSHIP: {
    name: 'Membership Fee',
    gst_applicable: true,
    description: 'Annual membership fee'
  },
  DEPOSIT: {
    name: 'Security Deposit',
    gst_applicable: false, // Deposits are not subject to GST
    description: 'Refundable security deposit'
  },
  DAMAGE_FEE: {
    name: 'Damage Fee',
    gst_applicable: true,
    description: 'Fee for damaged equipment'
  },
  LATE_FEE: {
    name: 'Late Return Fee',
    gst_applicable: true,
    description: 'Fee for late return of tools'
  }
};

// Calculate GST components
const calculateGST = (amount, category = 'TOOL_RENTAL') => {
  const categoryConfig = PRODUCT_CATEGORIES[category];
  
  if (!categoryConfig || !categoryConfig.gst_applicable) {
    return {
      subtotal: amount,
      gst_amount: 0,
      total: amount,
      gst_rate: 0,
      gst_applicable: false
    };
  }

  // Amount is inclusive of GST (Australian standard)
  const subtotal = Math.round(amount / (1 + GST_RATE));
  const gst_amount = amount - subtotal;

  return {
    subtotal,
    gst_amount,
    total: amount,
    gst_rate: GST_RATE,
    gst_applicable: true,
    category: categoryConfig.name
  };
};

// Create payment intent with GST calculation
const createPaymentIntent = async (amount, category, metadata = {}) => {
  const gstCalculation = calculateGST(amount, category);
  
  const paymentIntent = await stripe.paymentIntents.create({
    ...createPaymentIntentConfig,
    amount: gstCalculation.total,
    metadata: {
      ...createPaymentIntentConfig.metadata,
      ...metadata,
      category: gstCalculation.category || category,
      subtotal: gstCalculation.subtotal.toString(),
      gst_amount: gstCalculation.gst_amount.toString(),
      gst_applicable: gstCalculation.gst_applicable.toString()
    }
  });

  return {
    paymentIntent,
    gstCalculation
  };
};

// Create Stripe customer with Australian address validation
const createCustomer = async (customerData) => {
  const customer = await stripe.customers.create({
    email: customerData.email,
    name: customerData.name,
    phone: customerData.phone,
    address: {
      line1: customerData.address.line1,
      line2: customerData.address.line2,
      city: customerData.address.city,
      state: customerData.address.state,
      postal_code: customerData.address.postal_code,
      country: 'AU' // Australia
    },
    metadata: {
      business_abn: BUSINESS_ABN,
      user_id: customerData.user_id,
      registration_date: new Date().toISOString()
    }
  });

  return customer;
};

// Create subscription for memberships with GST
const createSubscription = async (customerId, priceId, metadata = {}) => {
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' },
    expand: ['latest_invoice.payment_intent'],
    metadata: {
      business_abn: BUSINESS_ABN,
      business_name: BUSINESS_NAME,
      ...metadata
    }
  });

  return subscription;
};

// Handle refunds with GST consideration
const createRefund = async (paymentIntentId, amount = null, reason = 'requested_by_customer') => {
  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount: amount, // null for full refund
    reason,
    metadata: {
      business_abn: BUSINESS_ABN,
      refund_date: new Date().toISOString()
    }
  });

  return refund;
};

// Webhook signature verification
const verifyWebhookSignature = (payload, signature) => {
  try {
    return stripe.webhooks.constructEvent(payload, signature, WEBHOOK_SECRET);
  } catch (err) {
    throw new Error(`Webhook signature verification failed: ${err.message}`);
  }
};

// Handle webhook events
const handleWebhookEvent = async (event) => {
  switch (event.type) {
    case 'payment_intent.succeeded':
      return handlePaymentSucceeded(event.data.object);
    
    case 'payment_intent.payment_failed':
      return handlePaymentFailed(event.data.object);
    
    case 'customer.subscription.created':
      return handleSubscriptionCreated(event.data.object);
    
    case 'customer.subscription.updated':
      return handleSubscriptionUpdated(event.data.object);
    
    case 'invoice.payment_succeeded':
      return handleInvoicePaymentSucceeded(event.data.object);
    
    case 'charge.dispute.created':
      return handleDisputeCreated(event.data.object);
    
    default:
      console.log(`Unhandled event type: ${event.type}`);
      return { received: true };
  }
};

// Event handlers
const handlePaymentSucceeded = async (paymentIntent) => {
  // Log GST information for accounting
  console.log('Payment succeeded with GST breakdown:', {
    payment_intent_id: paymentIntent.id,
    total_amount: paymentIntent.amount,
    subtotal: paymentIntent.metadata.subtotal,
    gst_amount: paymentIntent.metadata.gst_amount,
    gst_applicable: paymentIntent.metadata.gst_applicable,
    business_abn: paymentIntent.metadata.business_abn
  });
  
  // Add your business logic here
  return { processed: true };
};

const handlePaymentFailed = async (paymentIntent) => {
  console.log('Payment failed:', {
    payment_intent_id: paymentIntent.id,
    last_payment_error: paymentIntent.last_payment_error
  });
  
  // Add your business logic here
  return { processed: true };
};

const handleSubscriptionCreated = async (subscription) => {
  console.log('Subscription created:', {
    subscription_id: subscription.id,
    customer: subscription.customer
  });
  
  // Add your business logic here
  return { processed: true };
};

const handleSubscriptionUpdated = async (subscription) => {
  console.log('Subscription updated:', {
    subscription_id: subscription.id,
    status: subscription.status
  });
  
  // Add your business logic here
  return { processed: true };
};

const handleInvoicePaymentSucceeded = async (invoice) => {
  console.log('Invoice payment succeeded:', {
    invoice_id: invoice.id,
    subscription: invoice.subscription
  });
  
  // Add your business logic here
  return { processed: true };
};

const handleDisputeCreated = async (dispute) => {
  console.log('Dispute created:', {
    dispute_id: dispute.id,
    charge: dispute.charge,
    reason: dispute.reason
  });
  
  // Add your business logic here (notify admins, etc.)
  return { processed: true };
};

// Generate tax receipt data
const generateTaxReceipt = (paymentIntent) => {
  const gstCalculation = calculateGST(
    paymentIntent.amount,
    paymentIntent.metadata.category
  );

  return {
    receipt_number: `BT-${Date.now()}`,
    date: new Date().toISOString(),
    business_name: BUSINESS_NAME,
    business_abn: BUSINESS_ABN,
    customer_id: paymentIntent.customer,
    description: paymentIntent.description,
    subtotal: gstCalculation.subtotal / 100, // Convert cents to dollars
    gst_amount: gstCalculation.gst_amount / 100,
    total_amount: gstCalculation.total / 100,
    gst_rate: gstCalculation.gst_rate,
    payment_method: 'Credit Card',
    transaction_id: paymentIntent.id
  };
};

module.exports = {
  stripe,
  GST_RATE,
  BUSINESS_ABN,
  BUSINESS_NAME,
  CURRENCY,
  PRODUCT_CATEGORIES,
  calculateGST,
  createPaymentIntent,
  createCustomer,
  createSubscription,
  createRefund,
  verifyWebhookSignature,
  handleWebhookEvent,
  generateTaxReceipt
};