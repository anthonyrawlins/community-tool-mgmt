# Ballarat Tool Library - Infrastructure

## Overview

This repository contains the complete infrastructure setup for the Ballarat Tool Library, a community tool lending library web application deployed on Vercel (frontend) and Railway (backend) with full Australian GST compliance and payment processing via Stripe.

## 🏗️ Architecture

### Technology Stack
- **Frontend**: Next.js 14 (React) deployed on Vercel
- **Backend**: Node.js/Express API deployed on Railway
- **Database**: PostgreSQL on Railway
- **Cache**: Redis for session management and caching
- **Payments**: Stripe with Australian GST compliance
- **Monitoring**: Prometheus, Grafana, Loki stack
- **Security**: Helmet.js, CORS, Rate limiting, HTTPS/SSL

### Infrastructure Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (Vercel)      │───▶│   (Railway)     │───▶│ PostgreSQL      │
│   Next.js 14    │    │  Node.js/Express│    │  (Railway)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Stripe      │    │     Redis       │    │   Monitoring    │
│   (Payments)    │    │   (Caching)     │    │ Grafana/Prometheus│
│   GST Compliant │    │   (Railway)     │    │   (Optional)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- Git
- Vercel CLI
- Railway CLI

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd community-tool-mgmt
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Database: localhost:5432
   - Redis: localhost:6379

### Production Deployment

#### Frontend (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Backend (Railway)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway deploy
```

## 📁 Project Structure

```
community-tool-mgmt/
├── .github/workflows/          # CI/CD pipelines
├── backend/                    # Backend application code
├── frontend/                   # Frontend application code
├── config/                     # Configuration files
│   ├── logging/               # Winston logging config
│   ├── security/              # Security configurations
│   └── stripe/                # Stripe & GST configuration
├── monitoring/                # Monitoring stack
├── nginx/                     # Nginx configuration
├── docs/                      # Documentation
├── docker-compose.yml         # Local development
├── docker-compose.prod.yml    # Production overrides
├── Dockerfile.frontend        # Frontend container
├── Dockerfile.backend         # Backend container
├── vercel.json               # Vercel configuration
├── railway.json              # Railway configuration
└── .env.example              # Environment template
```

## 🔐 Security Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control
- Secure session management with Redis

### Security Headers
- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options, X-Content-Type-Options
- Referrer Policy

### Rate Limiting
- General API: 100 requests/15 minutes
- Authentication: 5 requests/15 minutes
- Payments: 10 requests/hour
- File uploads: 20 requests/15 minutes

### Data Protection
- HTTPS/SSL everywhere
- Database encryption at rest
- Secure cookie configuration
- Input validation and sanitization

## 💰 Payment Processing & GST

### Australian GST Compliance
- 10% GST rate applied to applicable services
- GST-inclusive pricing (Australian standard)
- Proper GST calculation and reporting
- Tax invoice generation

### Stripe Integration
- PCI DSS compliant payment processing
- Webhook handling for payment events
- Automatic receipt generation
- Refund processing with GST consideration

### Supported Payment Categories
- Tool rental fees (GST applicable)
- Membership fees (GST applicable)
- Late return fees (GST applicable)
- Damage fees (GST applicable)
- Security deposits (GST exempt)

## 📊 Monitoring & Logging

### Application Monitoring
- **Prometheus**: Metrics collection
- **Grafana**: Metrics visualization
- **Loki**: Log aggregation
- **Jaeger**: Distributed tracing

### Key Metrics Tracked
- HTTP request duration and count
- Database query performance
- Redis operation metrics
- Payment transaction metrics
- GST collection tracking
- User registration metrics

### Logging Strategy
- Structured JSON logging
- Separate logs for errors, audit, and performance
- Security event logging
- Log rotation and retention

## 🚀 Deployment Environments

### Development
- Local Docker Compose setup
- Hot reloading enabled
- Debug logging
- Test Stripe keys

### Staging
- Vercel preview deployments
- Railway staging environment
- Production-like data
- Stripe test mode

### Production
- Vercel production deployment
- Railway production environment
- Live Stripe integration
- Full monitoring enabled

## 🔧 Configuration

### Environment Variables

Key environment variables (see `.env.example` for complete list):

```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Authentication
JWT_SECRET=your-secure-jwt-secret
NEXTAUTH_SECRET=your-nextauth-secret

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# GST
GST_RATE=0.10
BUSINESS_ABN=your-abn-number
```

### Security Configuration

Critical security settings:
- Strong JWT secrets (256-bit)
- Secure CORS origins
- Rate limiting enabled
- Security headers configured
- HTTPS enforced in production

## 🚨 Backup & Recovery

### Database Backups
- Automated daily backups
- 30-day retention policy
- Point-in-time recovery available
- Cross-region backup storage

### Disaster Recovery
- Infrastructure as Code (Docker, configs)
- Database restore procedures
- Application rollback strategies
- Monitoring alert notifications

## 📈 Performance Optimization

### Frontend Optimization
- Next.js 14 app router
- Static site generation where possible
- Image optimization
- Code splitting and lazy loading

### Backend Optimization
- Redis caching layer
- Database query optimization
- Connection pooling
- API response compression

### Infrastructure Optimization
- CDN for static assets
- Database indexing strategy
- Caching at multiple levels
- Load balancing (production)

## 🧪 Testing Strategy

### Automated Testing
- Unit tests for business logic
- Integration tests for APIs
- End-to-end testing with Playwright
- Security testing with OWASP ZAP

### CI/CD Pipeline
- Automated testing on pull requests
- Security vulnerability scanning
- Performance testing
- Automated deployment to staging

## 🆘 Support & Maintenance

### Monitoring Alerts
- Application error rates
- Database performance issues
- Payment processing failures
- Security event notifications

### Maintenance Tasks
- Regular security updates
- Database maintenance
- Log cleanup
- Performance monitoring

## 📚 Additional Resources

- [Deployment Guide](docs/deployment/README.md)
- [Security Best Practices](docs/security/README.md)
- [API Documentation](docs/api/README.md)
- [Monitoring Setup](docs/monitoring/README.md)

## 🤝 Contributing

1. Follow the established architecture patterns
2. Update documentation for infrastructure changes
3. Test thoroughly in staging environment
4. Follow security best practices
5. Update monitoring and alerting as needed

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Ballarat Tool Library Infrastructure Team**
For support: infrastructure@ballarattoollibrary.org.au