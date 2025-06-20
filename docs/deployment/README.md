# Deployment Guide - Ballarat Tool Library

## Overview

This guide covers the complete deployment process for the Ballarat Tool Library infrastructure across different environments.

## 🏗️ Architecture Summary

```
Production Deployment Architecture

Internet
    │
    ▼
┌─────────────────┐
│   Cloudflare    │  ◄── CDN, DDoS Protection, SSL
│      CDN        │
└─────────────────┘
    │
    ▼
┌─────────────────┐      ┌─────────────────┐
│   Vercel        │      │   Railway       │
│  (Frontend)     │ ───► │  (Backend API)  │
│  Next.js 14     │      │  Node.js/Express│
└─────────────────┘      └─────────────────┘
                                 │
                                 ▼
                         ┌─────────────────┐
                         │   Railway       │
                         │  PostgreSQL     │
                         │     +           │
                         │    Redis        │
                         └─────────────────┘
                                 │
                                 ▼
                         ┌─────────────────┐
                         │    Stripe       │
                         │  (Payments)     │
                         │  + GST Calc     │
                         └─────────────────┘
```

## 🚀 Deployment Environments

### 1. Development Environment

**Purpose**: Local development and testing
**Infrastructure**: Docker Compose

```bash
# Start development environment
docker-compose up -d

# Services available:
# - Frontend: http://localhost:3000
# - Backend: http://localhost:8000
# - Database: localhost:5432
# - Redis: localhost:6379
# - Adminer: http://localhost:8080
```

#### Development Features:
- Hot reloading enabled
- Debug logging
- Test database with sample data
- Stripe test mode
- All services containerized

### 2. Staging Environment

**Purpose**: Pre-production testing and validation
**Infrastructure**: Vercel (frontend) + Railway (backend)

#### Frontend Staging (Vercel)
```bash
# Deploy to staging
vercel --env staging

# Preview URL: https://ballarat-tools-staging.vercel.app
```

#### Backend Staging (Railway)
```bash
# Deploy to staging environment
railway deploy --environment staging

# API URL: https://ballarat-tools-api-staging.railway.app
```

#### Staging Features:
- Production-like environment
- Stripe test mode
- Staging database with realistic data
- Full monitoring enabled
- Automated testing on deployment

### 3. Production Environment

**Purpose**: Live application serving real users
**Infrastructure**: Vercel (frontend) + Railway (backend)

#### Prerequisites for Production Deployment:
1. Domain configured (ballarattoollibrary.org.au)
2. SSL certificates configured
3. Stripe live keys configured
4. Australian Business Number (ABN) registered
5. Production secrets configured

## 🔧 Deployment Steps

### Frontend Deployment (Vercel)

#### 1. Initial Setup
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link project
vercel link
```

#### 2. Environment Configuration
Configure environment variables in Vercel dashboard:

**Required Variables:**
```bash
NEXTAUTH_URL=https://ballarattoollibrary.org.au
NEXTAUTH_SECRET=your-production-nextauth-secret
NEXT_PUBLIC_API_URL=https://api.ballarattoollibrary.org.au
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_GST_RATE=0.10
NEXT_PUBLIC_SITE_URL=https://ballarattoollibrary.org.au
```

#### 3. Deploy to Production
```bash
# Deploy to production
vercel --prod

# Verify deployment
curl -f https://ballarattoollibrary.org.au/api/health
```

### Backend Deployment (Railway)

#### 1. Initial Setup
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init
```

#### 2. Database Setup
```bash
# Create PostgreSQL service
railway add postgresql

# Create Redis service
railway add redis

# Generate database URL
railway variables
```

#### 3. Environment Configuration
Set environment variables in Railway dashboard:

**Required Variables:**
```bash
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:port/db
REDIS_URL=redis://user:pass@host:port
JWT_SECRET=your-production-jwt-secret
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
GST_RATE=0.10
BUSINESS_ABN=your-abn-number
BUSINESS_NAME=Ballarat Tool Library
```

#### 4. Deploy Backend
```bash
# Deploy to production
railway deploy

# Check deployment status
railway status

# View logs
railway logs
```

### Database Migration

#### 1. Production Database Setup
```bash
# Connect to production database
railway connect postgresql

# Run migrations
npm run migrate:prod

# Seed initial data (if needed)
npm run seed:prod
```

#### 2. Backup Configuration
```bash
# Set up automated backups
railway backup create --schedule "0 2 * * *"  # Daily at 2 AM

# Test backup restore
railway backup restore <backup-id>
```

## 🔒 Security Configuration

### SSL/TLS Setup

#### Vercel (Automatic)
Vercel automatically provides SSL certificates for custom domains.

#### Railway (Automatic)
Railway provides SSL certificates for all deployed services.

### Domain Configuration

#### 1. DNS Setup
```bash
# A Records
ballarattoollibrary.org.au     → Vercel IP
api.ballarattoollibrary.org.au → Railway IP

# CNAME Records
www.ballarattoollibrary.org.au → ballarattoollibrary.org.au
```

#### 2. Verify Domain Configuration
```bash
# Test frontend
curl -f https://ballarattoollibrary.org.au

# Test backend API
curl -f https://api.ballarattoollibrary.org.au/api/health
```

### Webhook Configuration

#### Stripe Webhooks
```bash
# Production webhook URL
https://api.ballarattoollibrary.org.au/api/webhooks/stripe

# Events to listen for:
# - payment_intent.succeeded
# - payment_intent.payment_failed
# - customer.subscription.created
# - customer.subscription.updated
# - invoice.payment_succeeded
```

## 📊 Monitoring Setup

### Application Performance Monitoring

#### 1. Sentry Configuration
```bash
# Set Sentry DSN in environment variables
SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_ENVIRONMENT=production
```

#### 2. Railway Monitoring
Railway provides built-in monitoring:
- CPU and memory usage
- Request metrics
- Error tracking
- Performance insights

#### 3. Vercel Analytics
Vercel provides analytics:
- Page load times
- Core web vitals
- Geographic distribution
- Traffic patterns

### Health Checks

#### Frontend Health Check
```bash
# Endpoint: https://ballarattoollibrary.org.au/api/health
curl -f https://ballarattoollibrary.org.au/api/health
```

#### Backend Health Check
```bash
# Endpoint: https://api.ballarattoollibrary.org.au/api/health
curl -f https://api.ballarattoollibrary.org.au/api/health
```

## 🚨 Disaster Recovery

### Backup Strategy

#### Database Backups
- **Frequency**: Daily at 2 AM AEST
- **Retention**: 30 days
- **Storage**: Railway automated backups
- **Testing**: Weekly backup restore tests

#### Code Backups
- **Repository**: GitHub with multiple remotes
- **Container Images**: Stored in registry
- **Configuration**: Infrastructure as Code

### Recovery Procedures

#### 1. Database Recovery
```bash
# List available backups
railway backup list

# Restore from backup
railway backup restore <backup-id>

# Verify restoration
railway connect postgresql
```

#### 2. Application Recovery
```bash
# Rollback to previous deployment
vercel rollback
railway rollback

# Or deploy from specific commit
vercel --prod --git-commit <commit-hash>
railway deploy --git-commit <commit-hash>
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

The CI/CD pipeline automatically:
1. Runs tests on pull requests
2. Performs security scans
3. Builds Docker images
4. Deploys to staging on `staging` branch
5. Deploys to production on `main` branch

#### Required GitHub Secrets
```bash
# Vercel
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id

# Railway
RAILWAY_API_KEY=your-railway-api-key
RAILWAY_PROJECT_ID=your-project-id

# Database
DATABASE_URL_PROD=postgresql://...

# Notifications
SLACK_WEBHOOK_URL=your-slack-webhook
```

### Deployment Verification

#### Automated Tests
```bash
# Health checks
curl -f https://ballarattoollibrary.org.au/api/health
curl -f https://api.ballarattoollibrary.org.au/api/health

# Smoke tests
npm run test:smoke:production
```

#### Manual Verification Checklist
- [ ] Frontend loads correctly
- [ ] User registration works
- [ ] Authentication flow works
- [ ] Payment processing works
- [ ] GST calculation is correct
- [ ] Email notifications sent
- [ ] Database connections healthy
- [ ] All environment variables set

## 🔧 Troubleshooting

### Common Deployment Issues

#### 1. Build Failures
```bash
# Check build logs
vercel logs
railway logs

# Common fixes:
# - Update Node.js version
# - Clear build cache
# - Check environment variables
```

#### 2. Database Connection Issues
```bash
# Test database connection
railway connect postgresql

# Check connection string
echo $DATABASE_URL

# Verify database is running
railway status
```

#### 3. Payment Processing Issues
```bash
# Verify Stripe configuration
echo $STRIPE_SECRET_KEY
echo $STRIPE_WEBHOOK_SECRET

# Test webhook endpoint
curl -X POST https://api.ballarattoollibrary.org.au/api/webhooks/stripe/health
```

### Performance Issues

#### 1. Frontend Performance
```bash
# Run Lighthouse audit
lighthouse https://ballarattoollibrary.org.au --output html

# Check Core Web Vitals in Vercel dashboard
```

#### 2. Backend Performance
```bash
# Monitor API response times
curl -w "@curl-format.txt" https://api.ballarattoollibrary.org.au/api/health

# Check database performance
railway connect postgresql
EXPLAIN ANALYZE SELECT ...;
```

## 📈 Scaling Considerations

### Horizontal Scaling

#### Frontend (Vercel)
- Automatic scaling based on traffic
- Global CDN distribution
- Edge functions for improved performance

#### Backend (Railway)
- Horizontal pod autoscaling
- Load balancing across instances
- Database connection pooling

### Vertical Scaling

#### Database Performance
- Monitor query performance
- Add indexes as needed
- Consider read replicas for high traffic
- Implement caching strategies

#### Cost Optimization
- Monitor resource usage
- Optimize bundle sizes
- Use caching effectively
- Consider usage-based pricing

## 📞 Support and Maintenance

### Regular Maintenance Tasks

#### Weekly
- [ ] Review error logs
- [ ] Check backup integrity
- [ ] Monitor performance metrics
- [ ] Review security alerts

#### Monthly
- [ ] Update dependencies
- [ ] Review access logs
- [ ] Performance optimization
- [ ] Cost analysis

#### Quarterly
- [ ] Security audit
- [ ] Disaster recovery test
- [ ] Performance review
- [ ] Architecture review

### Getting Help

**Infrastructure Issues:**
- Railway Support: [railway.app/help](https://railway.app/help)
- Vercel Support: [vercel.com/support](https://vercel.com/support)

**Payment Issues:**
- Stripe Support: [stripe.com/support](https://stripe.com/support)

**Application Issues:**
- GitHub Issues: Create issue in repository
- Email: infrastructure@ballarattoollibrary.org.au

---

**Last Updated**: 2024-06-20
**Version**: 1.0.0