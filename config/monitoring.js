const client = require('prom-client');

// Create a Registry which registers the metrics
const register = new client.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: 'ballarat-tool-library',
  environment: process.env.NODE_ENV || 'development'
});

// Enable the collection of default metrics
client.collectDefaultMetrics({ register });

// Custom metrics for the application
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const activeConnections = new client.Gauge({
  name: 'active_connections',
  help: 'Number of active connections'
});

const databaseConnectionPool = new client.Gauge({
  name: 'database_connections_active',
  help: 'Number of active database connections'
});

const databaseQueryDuration = new client.Histogram({
  name: 'database_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['query_type', 'table'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 5, 10]
});

const redisOperationDuration = new client.Histogram({
  name: 'redis_operation_duration_seconds',
  help: 'Duration of Redis operations in seconds',
  labelNames: ['operation'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1]
});

const stripeApiCalls = new client.Counter({
  name: 'stripe_api_calls_total',
  help: 'Total number of Stripe API calls',
  labelNames: ['operation', 'status']
});

const toolBorrowings = new client.Counter({
  name: 'tool_borrowings_total',
  help: 'Total number of tool borrowings',
  labelNames: ['tool_category', 'status']
});

const userRegistrations = new client.Counter({
  name: 'user_registrations_total',
  help: 'Total number of user registrations',
  labelNames: ['registration_type']
});

const paymentTransactions = new client.Counter({
  name: 'payment_transactions_total',
  help: 'Total number of payment transactions',
  labelNames: ['status', 'payment_method']
});

const gstCollected = new client.Counter({
  name: 'gst_collected_total',
  help: 'Total GST collected in cents',
  labelNames: ['transaction_type']
});

// Register all custom metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(activeConnections);
register.registerMetric(databaseConnectionPool);
register.registerMetric(databaseQueryDuration);
register.registerMetric(redisOperationDuration);
register.registerMetric(stripeApiCalls);
register.registerMetric(toolBorrowings);
register.registerMetric(userRegistrations);
register.registerMetric(paymentTransactions);
register.registerMetric(gstCollected);

// Middleware to track HTTP requests
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  // Track active connections
  activeConnections.inc();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    
    httpRequestDuration
      .labels(req.method, route, res.statusCode)
      .observe(duration);
    
    httpRequestTotal
      .labels(req.method, route, res.statusCode)
      .inc();
    
    activeConnections.dec();
  });
  
  next();
};

// Database monitoring functions
const trackDatabaseQuery = (queryType, table, duration) => {
  databaseQueryDuration
    .labels(queryType, table)
    .observe(duration / 1000);
};

const updateDatabaseConnections = (count) => {
  databaseConnectionPool.set(count);
};

// Redis monitoring functions
const trackRedisOperation = (operation, duration) => {
  redisOperationDuration
    .labels(operation)
    .observe(duration / 1000);
};

// Business metrics functions
const trackStripeApiCall = (operation, status) => {
  stripeApiCalls.labels(operation, status).inc();
};

const trackToolBorrowing = (toolCategory, status) => {
  toolBorrowings.labels(toolCategory, status).inc();
};

const trackUserRegistration = (registrationType) => {
  userRegistrations.labels(registrationType).inc();
};

const trackPaymentTransaction = (status, paymentMethod) => {
  paymentTransactions.labels(status, paymentMethod).inc();
};

const trackGstCollection = (transactionType, amount) => {
  gstCollected.labels(transactionType).inc(amount);
};

// Health check metrics
const healthChecks = new client.Gauge({
  name: 'health_check_status',
  help: 'Status of various health checks (1 = healthy, 0 = unhealthy)',
  labelNames: ['check_name']
});

register.registerMetric(healthChecks);

const updateHealthCheck = (checkName, status) => {
  healthChecks.labels(checkName).set(status ? 1 : 0);
};

module.exports = {
  register,
  metricsMiddleware,
  trackDatabaseQuery,
  updateDatabaseConnections,
  trackRedisOperation,
  trackStripeApiCall,
  trackToolBorrowing,
  trackUserRegistration,
  trackPaymentTransaction,
  trackGstCollection,
  updateHealthCheck
};