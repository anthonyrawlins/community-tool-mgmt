# ToolLibrary Development Tasks for AI Cluster

## Current Status
- ✅ Backend API fully implemented (auth, tools, loans, reservations, payments, admin)
- ✅ Frontend landing page and basic UI components
- ✅ Docker Swarm deployment configuration
- 🔄 Tool catalog integration (UI exists, needs backend connection)
- 🔄 Member dashboard functionality
- 🔄 Admin panel implementation

## High Priority Tasks for AI Development Cluster

### 1. Tool Catalog Integration (WALNUT - qwen2.5-coder)
**Task**: Complete tool catalog functionality
**Files to work on**:
- `src/app/catalog/page.tsx` - Connect search/filter to backend API
- `backend/src/controllers/toolController.ts` - Verify search/filter logic
- Create tool detail page: `src/app/catalog/[id]/page.tsx`

**Requirements**:
- Implement search functionality with real-time API calls
- Add category filtering with backend integration
- Create tool detail pages with reservation/loan functionality
- Add pagination for large tool inventories

### 2. Member Dashboard (IRONWOOD - deepseek-coder-v2)
**Task**: Build comprehensive member dashboard
**Files to create**:
- `src/app/member/page.tsx` - Main dashboard
- `src/app/member/loans/page.tsx` - Active loans management
- `src/app/member/reservations/page.tsx` - Reservation management
- `src/app/member/payments/page.tsx` - Payment history
- `src/components/member/` - Dashboard components

**Requirements**:
- Show current loans with due dates and renewal options
- Display active reservations with pickup reminders
- Payment history with GST breakdowns
- Profile management and membership status
- Quick reservation system from dashboard

### 3. Admin Panel Implementation (WALNUT - devstral)
**Task**: Complete admin management interface
**Files to work on**:
- `src/app/admin/page.tsx` - Needs full implementation
- `src/app/admin/tools/` - Tool inventory management
- `src/app/admin/members/` - Member management
- `src/app/admin/loans/` - Loan processing interface
- `src/app/admin/reports/` - Analytics and reporting

**Requirements**:
- Tool inventory CRUD operations
- Member management (approval, suspension, renewal)
- Loan processing (check-out, check-in, fees)
- Financial reporting with GST compliance
- System configuration management

### 4. Enhanced Search & Filtering (ACACIA - starcoder2:15b)
**Task**: Advanced search capabilities
**Files to enhance**:
- Backend search algorithms with fuzzy matching
- Category hierarchy and tagging system
- Availability calendar integration
- Saved search functionality

**Requirements**:
- Elasticsearch or PostgreSQL full-text search
- Smart categorization and tagging
- Availability prediction based on historical data
- Personalized tool recommendations

### 5. Payment Integration Completion (IRONWOOD - deepseek-r1)
**Task**: Complete Stripe integration with Australian GST
**Files to work on**:
- `backend/src/controllers/paymentController.ts` - Enhance Stripe integration
- `backend/src/services/gstService.ts` - Australian tax calculations
- `src/components/payments/` - Payment UI components

**Requirements**:
- Complete Stripe Checkout integration
- Australian GST compliance (10% on applicable items)
- Invoice generation with ABN
- Subscription management for memberships
- Webhook handling for payment events

### 6. Mobile Responsiveness & PWA (WALNUT - qwen3)
**Task**: Optimize for mobile and create PWA
**Files to enhance**:
- All frontend components for mobile optimization
- PWA configuration files
- Push notification setup

**Requirements**:
- Responsive design for all screen sizes
- Progressive Web App functionality
- Push notifications for due dates and reservations
- Offline mode for basic functionality

## Development Workflow

### 1. Environment Setup
```bash
# Clone and setup
git clone <repo>
cd community-tool-mgmt

# Backend setup
cd backend
npm install
npm run db:generate
npm run db:push
npm run dev

# Frontend setup (new terminal)
cd ..
npm install  
npm run dev
```

### 2. Task Assignment Strategy
- **WALNUT (28 models)**: Primary development, complex features
- **IRONWOOD (12 models)**: Secondary development, API integration
- **ACACIA (6+ models)**: Code review, optimization, testing

### 3. Testing Requirements
- Unit tests for new backend endpoints
- Integration tests for payment flows
- E2E tests for critical user journeys
- Performance testing with large tool inventories

### 4. Code Quality Standards
- TypeScript strict mode
- ESLint + Prettier formatting
- Prisma schema validation
- Security audit for payment flows

## Deployment Notes

After development completion:
1. Update secrets in `secrets/` directory
2. Run `./deploy-swarm.sh` to deploy to Docker Swarm
3. Access at `https://tools.home.deepblack.cloud`
4. Monitor with `docker stack ps ballarat-tools`

## Priority Order
1. Tool Catalog Integration (immediate user value)
2. Member Dashboard (user engagement)
3. Admin Panel (operational efficiency)  
4. Enhanced Search (advanced features)
5. Payment Integration (monetization)
6. Mobile/PWA (accessibility)

Each task can be worked on independently by different agents in the cluster.