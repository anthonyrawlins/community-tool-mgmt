# Security Architecture - Ballarat Tool Library

## Overview

This document outlines the comprehensive security measures implemented for the Ballarat Tool Library application, covering authentication, authorization, data protection, payment security, and compliance requirements.

## 🛡️ Security Architecture

```
Security Layers

┌─────────────────────────────────────────────────────────────┐
│                     Internet/CDN Layer                      │
│  • DDoS Protection (Cloudflare)                            │
│  • WAF (Web Application Firewall)                          │
│  • Rate Limiting                                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer                         │
│  • HTTPS/TLS 1.3 Everywhere                               │
│  • Security Headers (HSTS, CSP, etc.)                     │
│  • Input Validation & Sanitization                        │
│  • CORS Configuration                                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Authentication Layer                        │
│  • JWT with secure secrets                                 │
│  • NextAuth.js integration                                 │
│  • Multi-factor authentication ready                       │
│  • Session management with Redis                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Authorization Layer                        │
│  • Role-based access control (RBAC)                       │
│  • Resource-level permissions                              │
│  • API endpoint protection                                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Data Layer                             │
│  • Database encryption at rest                            │
│  • Encrypted connections (SSL/TLS)                        │
│  • Backup encryption                                       │
│  • PII data handling                                       │
└─────────────────────────────────────────────────────────────┘
```

## 🔐 Authentication & Authorization

### Authentication Methods

#### 1. JWT-Based Authentication
```javascript
// JWT Configuration
{
  algorithm: 'HS256',
  expiresIn: '24h',
  issuer: 'ballarat-tool-library',
  audience: 'ballarat-tool-library-users'
}
```

**Features:**
- Secure random secrets (256-bit)
- Short-lived tokens (24 hours)
- Refresh token rotation
- Automatic token validation

#### 2. NextAuth.js Integration
```javascript
// Supported providers
- Email/Password (primary)
- Google OAuth (optional)
- Facebook OAuth (optional)
```

**Security Features:**
- CSRF protection
- Secure session cookies
- Database session storage
- Email verification required

### Authorization Framework

#### Role-Based Access Control (RBAC)

```javascript
const ROLES = {
  ADMIN: {
    permissions: ['*'], // All permissions
    description: 'System administrator'
  },
  STAFF: {
    permissions: [
      'tools.manage',
      'users.view',
      'rentals.manage',
      'payments.view'
    ],
    description: 'Library staff member'
  },
  MEMBER: {
    permissions: [
      'tools.browse',
      'tools.rent',
      'profile.manage',
      'payments.make'
    ],
    description: 'Library member'
  },
  GUEST: {
    permissions: [
      'tools.browse',
      'registration.create'
    ],
    description: 'Unregistered visitor'
  }
};
```

#### Permission Middleware
```javascript
// Express middleware for permission checking
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!hasPermission(req.user.role, permission)) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    
    next();
  };
};
```

## 🔒 Data Protection

### Encryption Standards

#### Data at Rest
- **Database**: AES-256 encryption (Railway managed)
- **File Storage**: S3 server-side encryption
- **Backups**: Encrypted with unique keys
- **Logs**: No sensitive data logged

#### Data in Transit
- **HTTPS/TLS 1.3**: All communications
- **Certificate Pinning**: Production deployments
- **HSTS**: Enforced for all domains
- **Perfect Forward Secrecy**: Supported

### Personal Information Handling

#### PII Classification
```javascript
const PII_LEVELS = {
  PUBLIC: ['firstName', 'toolPreferences'],
  INTERNAL: ['email', 'phone', 'address'],
  RESTRICTED: ['paymentMethods', 'financialData'],
  CONFIDENTIAL: ['passwords', 'socialSecurity']
};
```

#### Data Retention Policy
- **Active Users**: Retain while account active
- **Inactive Users**: 24 months after last activity
- **Payment Data**: 7 years (Australian tax requirements)
- **Audit Logs**: 12 months minimum

### GDPR/Privacy Compliance

#### Data Subject Rights
- **Right to Access**: User data export
- **Right to Rectification**: Profile updates
- **Right to Erasure**: Account deletion
- **Right to Portability**: Data export formats
- **Right to Object**: Marketing opt-out

#### Privacy by Design
- Data minimization principles
- Purpose limitation
- Consent management
- Regular privacy impact assessments

## 🌐 Network Security

### HTTPS/SSL Configuration

#### TLS Configuration
```nginx
# Modern TLS configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
ssl_prefer_server_ciphers off;
ssl_session_timeout 1d;
ssl_session_cache shared:MozTLS:10m;
ssl_session_tickets off;

# HSTS
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
```

#### Certificate Management
- **Automated renewal**: Let's Encrypt/Vercel
- **Certificate pinning**: Production environments
- **OCSP stapling**: Enabled
- **Certificate transparency**: Monitored

### Security Headers

#### Content Security Policy (CSP)
```javascript
const CSP_DIRECTIVES = {
  defaultSrc: ["'self'"],
  scriptSrc: [
    "'self'",
    "https://js.stripe.com",
    "https://checkout.stripe.com"
  ],
  styleSrc: [
    "'self'",
    "'unsafe-inline'",
    "https://fonts.googleapis.com"
  ],
  imgSrc: [
    "'self'",
    "data:",
    "https:"
  ],
  connectSrc: [
    "'self'",
    "https://api.stripe.com"
  ],
  frameSrc: [
    "https://js.stripe.com",
    "https://hooks.stripe.com"
  ]
};
```

#### Security Headers Implementation
```javascript
// Helmet.js configuration
app.use(helmet({
  contentSecurityPolicy: { directives: CSP_DIRECTIVES },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));
```

### CORS Configuration

#### Production CORS Policy
```javascript
const productionCorsOptions = {
  origin: [
    'https://ballarattoollibrary.org.au',
    'https://www.ballarattoollibrary.org.au'
  ],
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'stripe-signature'
  ]
};
```

## 🚫 Rate Limiting & DDoS Protection

### Rate Limiting Strategy

#### Endpoint-Specific Limits
```javascript
const RATE_LIMITS = {
  general: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // requests per window
  },
  authentication: {
    windowMs: 15 * 60 * 1000,
    max: 5, // strict limit for auth attempts
    skipSuccessfulRequests: true
  },
  payment: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10 // payment attempts per hour
  },
  fileUpload: {
    windowMs: 15 * 60 * 1000,
    max: 20 // file uploads per 15 minutes
  }
};
```

#### IP-Based Protection
- Automatic IP blocking after repeated violations
- Whitelist for known good IPs
- Geographic blocking (if needed)
- Honeypot endpoints for bot detection

### DDoS Mitigation

#### Cloudflare Integration
- Layer 3/4 DDoS protection
- Layer 7 application protection
- Bot management
- Geographic restrictions

#### Application-Level Protection
- Request size limits
- Connection timeouts
- Slow request protection
- Resource usage monitoring

## 💳 Payment Security

### PCI DSS Compliance

#### Stripe Integration Benefits
- **Level 1 PCI DSS Compliance**: Stripe handles card data
- **No card data storage**: Tokens only
- **Secure payment forms**: Stripe Elements
- **3D Secure support**: Enhanced authentication

#### Security Measures
```javascript
// Payment processing security
const paymentSecurity = {
  tokenization: true,
  encryptedTransmission: true,
  webhookVerification: true,
  fraudDetection: true,
  auditLogging: true
};
```

### Australian GST Security

#### Tax Calculation Integrity
```javascript
// GST calculation validation
const validateGSTCalculation = (amount, category) => {
  const calculation = calculateGSTByCategory(amount, category);
  
  // Verify calculation integrity
  if (calculation.inclusive_amount !== 
      calculation.exclusive_amount + calculation.gst_amount) {
    throw new SecurityError('GST calculation integrity check failed');
  }
  
  return calculation;
};
```

#### Audit Trail
- All payment transactions logged
- GST calculations recorded
- Refund tracking with reasons
- Financial reconciliation reports

### Webhook Security

#### Stripe Webhook Verification
```javascript
const verifyStripeWebhook = (payload, signature) => {
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    return event;
  } catch (err) {
    throw new SecurityError('Webhook signature verification failed');
  }
};
```

## 🔍 Security Monitoring

### Audit Logging

#### Security Events Tracking
```javascript
const SECURITY_EVENTS = {
  AUTHENTICATION: [
    'login_success',
    'login_failure',
    'password_change',
    'account_lockout'
  ],
  AUTHORIZATION: [
    'permission_denied',
    'role_change',
    'privileged_access'
  ],
  DATA_ACCESS: [
    'pii_access',
    'bulk_export',
    'admin_query'
  ],
  PAYMENT: [
    'payment_attempt',
    'payment_failure',
    'refund_request',
    'webhook_failure'
  ]
};
```

#### Audit Log Format
```json
{
  "timestamp": "2024-06-20T10:30:00.000Z",
  "event_type": "login_failure",
  "user_id": "user_123",
  "ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0...",
  "details": {
    "reason": "invalid_password",
    "attempt_number": 3
  },
  "risk_score": 7
}
```

### Intrusion Detection

#### Anomaly Detection
- Unusual login patterns
- Geographic anomalies
- Rapid request patterns
- Failed authentication clusters

#### Automated Response
```javascript
const securityResponse = {
  lowRisk: 'log_event',
  mediumRisk: 'increase_monitoring',
  highRisk: 'temporary_block',
  criticalRisk: 'immediate_block_and_alert'
};
```

### Security Metrics

#### Key Performance Indicators
- Failed login attempts per hour
- Rate limit violations
- Security header compliance
- Certificate expiry monitoring
- Vulnerability scan results

## 🚨 Incident Response

### Security Incident Classification

#### Severity Levels
```javascript
const INCIDENT_SEVERITY = {
  CRITICAL: {
    response_time: '15 minutes',
    examples: ['data_breach', 'payment_compromise', 'system_takeover']
  },
  HIGH: {
    response_time: '1 hour',
    examples: ['ddos_attack', 'privilege_escalation', 'malware_detection']
  },
  MEDIUM: {
    response_time: '4 hours',
    examples: ['brute_force_attack', 'suspicious_activity', 'policy_violation']
  },
  LOW: {
    response_time: '24 hours',
    examples: ['security_scan', 'minor_vulnerability', 'false_positive']
  }
};
```

### Response Procedures

#### Immediate Response (0-15 minutes)
1. **Assess and contain** the threat
2. **Isolate** affected systems if necessary
3. **Document** initial findings
4. **Notify** incident response team

#### Investigation Phase (15 minutes - 4 hours)
1. **Collect** evidence and logs
2. **Analyze** attack vectors
3. **Determine** scope of impact
4. **Plan** remediation steps

#### Recovery Phase (4 hours - 24 hours)
1. **Implement** fixes and patches
2. **Restore** services if needed
3. **Validate** security measures
4. **Monitor** for recurrence

#### Post-Incident (24+ hours)
1. **Conduct** lessons learned session
2. **Update** security procedures
3. **Improve** monitoring capabilities
4. **Report** to stakeholders

## 🔧 Security Maintenance

### Regular Security Tasks

#### Daily
- Monitor security alerts
- Review failed authentication logs
- Check certificate status
- Validate backup integrity

#### Weekly
- Security scan results review
- Access log analysis
- Performance impact assessment
- User activity patterns review

#### Monthly
- Dependency vulnerability scan
- Security policy review
- Incident response drill
- Access rights audit

#### Quarterly
- Full security assessment
- Penetration testing
- Disaster recovery test
- Security training update

### Vulnerability Management

#### Scanning Schedule
- **Dependency scanning**: Every PR
- **Container scanning**: Weekly
- **Infrastructure scanning**: Monthly
- **Penetration testing**: Quarterly

#### Patch Management
```javascript
const patchPriority = {
  critical: '24 hours',
  high: '72 hours',
  medium: '1 week',
  low: '1 month'
};
```

## 📋 Compliance Requirements

### Australian Privacy Act

#### Privacy Principles
1. Open and transparent management
2. Anonymity and pseudonymity
3. Collection of solicited information
4. Dealing with unsolicited information
5. Notification of collection
6. Use or disclosure
7. Direct marketing
8. Cross-border disclosure
9. Government related identifiers
10. Quality of personal information
11. Security of personal information
12. Access to personal information
13. Correction of personal information

### Payment Card Industry (PCI DSS)

#### Requirements Compliance
- **Build and maintain secure networks**: ✅ Firewall, secure configs
- **Protect cardholder data**: ✅ No storage, encryption in transit
- **Maintain vulnerability management**: ✅ Antivirus, secure systems
- **Implement strong access controls**: ✅ RBAC, unique IDs, physical access
- **Regularly monitor networks**: ✅ Logging, file integrity monitoring
- **Maintain information security policy**: ✅ Documented policies

### Australian Taxation Office (ATO)

#### GST Record Keeping
- Transaction records for 5 years
- GST calculation documentation
- Business activity statements
- Audit trail maintenance

## 📞 Security Contacts

### Internal Team
- **Security Lead**: security@ballarattoollibrary.org.au
- **Infrastructure**: infrastructure@ballarattoollibrary.org.au
- **Emergency**: +61 XXX XXX XXX

### External Partners
- **Stripe Security**: security@stripe.com
- **Railway Security**: security@railway.app
- **Vercel Security**: security@vercel.com

### Incident Reporting
- **Internal Incidents**: security-incidents@ballarattoollibrary.org.au
- **Data Breaches**: privacy@ballarattoollibrary.org.au
- **Payment Issues**: payments@ballarattoollibrary.org.au

---

**Document Version**: 1.0.0  
**Last Updated**: 2024-06-20  
**Next Review**: 2024-09-20  
**Classification**: Internal Use