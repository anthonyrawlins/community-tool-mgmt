# Ballarat Tool Library - Backend API

A comprehensive backend API for managing a community tool lending library with membership management, tool catalog, loan tracking, and payment processing.

## 🚀 Features

- **User Authentication & Authorization**: JWT-based auth with role-based access control
- **Membership Management**: Basic ($55) and Premium ($70) tiers with Australian GST
- **Tool Catalog**: Comprehensive tool management with categories, conditions, and availability
- **Loan System**: Check-out/return tracking with due dates and late fees
- **Reservation System**: Tool booking with availability checking
- **Payment Processing**: Stripe integration for membership fees and penalties
- **Audit Logging**: Complete audit trail for all operations
- **Rate Limiting**: API protection with configurable limits
- **File Upload**: Tool image management
- **Admin Dashboard**: Statistics and management interface

## 🏗️ Technology Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens with bcrypt password hashing
- **Validation**: Zod schema validation
- **Logging**: Winston for structured logging
- **Payments**: Stripe integration
- **Rate Limiting**: Express rate limit middleware
- **Security**: Helmet.js, CORS, input validation

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Database, logging configuration
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Authentication, validation, error handling
│   ├── prisma/          # Database schema and seeds
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   └── server.ts        # Express app setup
├── prisma/
│   └── schema.prisma    # Database schema
├── logs/                # Application logs
├── uploads/             # File uploads
└── package.json
```

## 🗄️ Database Schema

### Core Entities

- **Users**: Authentication and profile information
- **Members**: Membership tiers and limits
- **Tools**: Tool catalog with availability and conditions
- **Loans**: Borrowing records with due dates
- **Reservations**: Tool booking system
- **Payments**: Membership fees and late charges
- **Categories**: Tool categorization hierarchy
- **Audit Logs**: Complete operation tracking

### Key Relationships

- Users → Members (1:1)
- Users → Loans (1:N)
- Users → Reservations (1:N)
- Tools → Loans (1:N)
- Tools → Categories (N:1)
- Categories → Categories (parent/child hierarchy)

## 🔧 Installation & Setup

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 13+
- Redis (optional, for session storage)

### Installation

1. **Clone and install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Environment setup:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/ballarat_tool_library"
   
   # JWT Secrets
   JWT_SECRET="your-super-secret-jwt-key"
   JWT_REFRESH_SECRET="your-refresh-secret"
   
   # Stripe (for payments)
   STRIPE_SECRET_KEY="sk_test_your_stripe_key"
   STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
   ```

3. **Database setup:**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # Seed database with sample data
   npm run db:seed
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3001`

## 📚 API Documentation

### Authentication Endpoints

```
POST /api/v1/auth/register     # Register new user
POST /api/v1/auth/login        # User login
GET  /api/v1/auth/profile      # Get user profile
PUT  /api/v1/auth/profile      # Update profile
POST /api/v1/auth/change-password  # Change password
POST /api/v1/auth/logout       # Logout user
```

### Tool Management

```
GET    /api/v1/tools           # List tools (with filtering)
GET    /api/v1/tools/:id       # Get tool details
POST   /api/v1/tools           # Create tool (admin)
PUT    /api/v1/tools/:id       # Update tool (admin)
DELETE /api/v1/tools/:id       # Delete tool (admin)
GET    /api/v1/tools/:id/availability  # Check availability
GET    /api/v1/tools/categories        # List categories
```

### Loan Management

```
GET  /api/v1/loans             # List user loans
GET  /api/v1/loans/:id         # Get loan details
POST /api/v1/loans             # Create loan (staff)
PUT  /api/v1/loans/:id/return  # Return loan (staff)
```

### Reservation System

```
GET    /api/v1/reservations    # List user reservations
POST   /api/v1/reservations    # Create reservation
PUT    /api/v1/reservations/:id    # Update reservation
DELETE /api/v1/reservations/:id    # Cancel reservation
```

### Membership & Payments

```
GET  /api/v1/memberships/current   # Get current membership
POST /api/v1/memberships           # Create membership
POST /api/v1/memberships/renew     # Renew membership
GET  /api/v1/payments              # List payments
POST /api/v1/payments/create-session  # Create payment session
```

### Admin Endpoints

```
GET /api/v1/admin/dashboard     # Dashboard statistics
GET /api/v1/admin/users         # List all users
GET /api/v1/admin/loans         # List all loans
GET /api/v1/admin/reservations  # List all reservations
GET /api/v1/admin/payments      # List all payments
```

## 🔒 Authentication & Authorization

### User Roles

- **MEMBER**: Basic users with tool borrowing privileges
- **VOLUNTEER**: Staff members who can manage loans/returns
- **ADMIN**: Full system administration access

### JWT Token Structure

```json
{
  "userId": "cuid",
  "email": "user@example.com",
  "role": "MEMBER|VOLUNTEER|ADMIN",
  "memberId": "cuid"
}
```

### Rate Limiting

- General API: 100 requests per 15 minutes
- Auth endpoints: 5 attempts per 15 minutes  
- Password reset: 3 requests per hour
- File uploads: 10 per minute

## 💰 Australian GST Handling

The system automatically calculates and applies 10% GST to all membership fees:

- **Basic Membership**: $55.00 + $5.50 GST = $60.50 total
- **Premium Membership**: $70.00 + $7.00 GST = $77.00 total

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

## 📊 Logging & Monitoring

The system provides comprehensive logging:

- **Application logs**: `logs/app.log`
- **Error logs**: `logs/error.log`
- **HTTP logs**: `logs/http.log`
- **Audit logs**: `logs/audit.log`

Log levels: `error`, `warn`, `info`, `http`, `debug`

## 🔄 Database Scripts

```bash
npm run db:generate    # Generate Prisma client
npm run db:push        # Push schema changes
npm run db:migrate     # Create and run migrations
npm run db:seed        # Seed database with sample data
npm run db:studio      # Open Prisma Studio
```

## 📝 Sample Data

The seed script creates:

- **Admin user**: `admin@ballarattoolibrary.org.au` / `admin123!`
- **Volunteer user**: `volunteer@ballarattoolibrary.org.au` / `volunteer123!`
- **Sample members**: `john.doe@example.com` / `member123!`
- **Tool categories**: Power Tools, Hand Tools, Garden Tools
- **Sample tools**: Drills, saws, lawn mower with realistic data

## 🚀 Production Deployment

1. **Environment variables**: Set production values for JWT secrets, database URL, Stripe keys
2. **Database**: Run migrations in production
3. **Process management**: Use PM2 or similar for process management
4. **Reverse proxy**: Configure Nginx/Apache for SSL and load balancing
5. **Monitoring**: Set up health checks and error monitoring
6. **Backups**: Configure automated database backups

## 📞 Support & Contact

For questions or support regarding the Ballarat Tool Library backend:

- **Email**: info@ballarattoolibrary.org.au
- **Documentation**: See `/api-docs` endpoint when running
- **Health Check**: `GET /health`

## 📄 License

MIT License - see LICENSE file for details.