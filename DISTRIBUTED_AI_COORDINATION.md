# Distributed AI Development Cluster Coordination System
## ToolLibrary Project

### System Overview
Coordinated AI development cluster across 3 machines:
- **WALNUT** (192.168.1.27): Primary development + deployment
- **IRONWOOD** (192.168.1.113): Feature development + API integration  
- **ACACIA** (192.168.1.72): Testing + security + optimization

### Current Status: ACTIVE
- **Project**: Ballarat Tool Library (community-tool-mgmt)
- **Repository**: https://github.com/anthonyrawlins/community-tool-mgmt
- **Deployment Target**: https://tools.home.deepblack.cloud
- **Priority**: URGENT - Fix deployment, then parallel feature development

## Agent Workload Assignments

### WALNUT (Primary Development Hub)
**Hardware**: AMD Ryzen 7 5800X3D, 64GB RAM, RX 9060 XT
**AI Models Available**: 28 models including qwen2.5-coder, devstral, starcoder2:15b
**Role**: Lead deployment + tool catalog development

**Primary Tasks**:
1. **URGENT**: Fix Docker deployment issues
   - Image build problems in docker-compose.swarm.yml
   - Traefik routing configuration
   - Secret management setup
   - Database initialization
   
2. **Tool Catalog Integration** (qwen2.5-coder)
   - Complete `src/app/catalog/page.tsx` API integration
   - Implement search/filter with backend connection
   - Create tool detail pages with reservation system
   - Add pagination for large inventories

3. **Admin Panel Implementation** (devstral)
   - Build `src/app/admin/page.tsx` interface
   - Tool inventory CRUD operations
   - Member management system
   - Financial reporting with GST compliance

**Communication Protocol**: Primary coordinator, status updates every 30 minutes

### IRONWOOD (Feature Development)
**Hardware**: AMD Threadripper 2920X, 128GB RAM, RTX 3070
**AI Models Available**: 12 models including deepseek-coder-v2, deepseek-r1
**Role**: Member dashboard + payment integration specialist

**Primary Tasks**:
1. **Member Dashboard** (deepseek-coder-v2)
   - Build `src/app/member/page.tsx` main dashboard
   - Active loans management interface
   - Reservation management system
   - Payment history with GST breakdowns
   - Profile management functionality

2. **Payment Integration** (deepseek-r1)
   - Complete Stripe integration with Australian GST
   - Invoice generation with ABN compliance
   - Subscription management for memberships
   - Webhook handling for payment events
   - Financial reporting features

**Communication Protocol**: Report to WALNUT coordinator, sync every 45 minutes

### ACACIA (Quality Assurance + Security)
**Hardware**: 2x Xeon E5-2680 v4, 128GB RAM, GTX 1070
**AI Models Available**: 6+ models including starcoder2:15b, deepseek-r1
**Role**: Testing, security auditing, and advanced search implementation

**Primary Tasks**:
1. **Enhanced Search & Filtering** (starcoder2:15b)
   - Implement advanced search algorithms
   - Category hierarchy and tagging system
   - Availability calendar integration
   - Personalized tool recommendations

2. **Security & Testing** (deepseek-r1)
   - Security audit of payment flows
   - Authentication and authorization testing
   - API endpoint validation
   - Integration testing for all features
   - Performance optimization

3. **Code Review & Quality Assurance**
   - Review all commits from WALNUT and IRONWOOD
   - Automated testing pipeline setup
   - Code quality enforcement
   - Documentation generation

**Communication Protocol**: Review and validate work from other agents, sync every 60 minutes

## Shared Context & Communication Protocols

### Shared Resources
1. **Repository**: `/Users/arawlins/Code/deepblackcloud/community-tool-mgmt`
2. **Docker Swarm**: WALNUT hosts the deployment environment
3. **Documentation**: This file and task assignments in `DEVELOPMENT_TASKS.md`
4. **Secrets**: Shared via NFS at `/rust/containers/ballarat-tools/secrets/`

### Communication Channels
1. **Status Updates**: Via commit messages and file updates
2. **Coordination File**: `CLUSTER_STATUS.md` (auto-generated)
3. **Task Tracking**: Individual `AGENT_STATUS_[MACHINE].md` files
4. **Issue Reporting**: `CLUSTER_ISSUES.md` for blockers

### Synchronization Protocol
1. **Code Sync**: Git-based with feature branches per agent
2. **Context Sharing**: Markdown status files updated regularly
3. **Dependency Management**: Clear task dependencies defined
4. **Integration Points**: Regular merge points for feature integration

## Development Workflow

### Phase 1: URGENT - Deployment Fix (WALNUT Only)
**Timeline**: Immediate (0-2 hours)
**Objective**: Get tools.home.deepblack.cloud live and functional

Tasks:
- [ ] Fix Docker image build issues
- [ ] Configure Traefik routing properly
- [ ] Setup database and secrets correctly
- [ ] Verify deployment health
- [ ] Test basic functionality

### Phase 2: Parallel Feature Development (All Agents)
**Timeline**: 2-8 hours
**Objective**: Implement core features simultaneously

**WALNUT**: Tool catalog + admin panel
**IRONWOOD**: Member dashboard + payments  
**ACACIA**: Search enhancement + security testing

### Phase 3: Integration & Testing (Coordinated)
**Timeline**: 8-12 hours
**Objective**: Merge features and comprehensive testing

### Phase 4: Production Deployment (WALNUT + ACACIA)
**Timeline**: 12-14 hours
**Objective**: Deploy fully featured application

## Monitoring & Coordination

### Health Checks
- **WALNUT**: Deployment status, primary feature progress
- **IRONWOOD**: Feature development progress, API integration status
- **ACACIA**: Code quality metrics, security audit results

### Coordination Dashboard
Status tracked in:
- `CLUSTER_STATUS.md` - Overall project status
- `AGENT_STATUS_WALNUT.md` - WALNUT specific status
- `AGENT_STATUS_IRONWOOD.md` - IRONWOOD specific status  
- `AGENT_STATUS_ACACIA.md` - ACACIA specific status

### Escalation Protocol
1. **Blocker Identified**: Document in `CLUSTER_ISSUES.md`
2. **Cross-Agent Dependency**: Update in coordination file
3. **Urgent Issue**: Immediate status file update + coordinate via primary agent

## Success Metrics
- [ ] Deployment live at tools.home.deepblack.cloud
- [ ] All core features implemented and tested
- [ ] Security audit passed
- [ ] Performance benchmarks met
- [ ] Code quality standards maintained
- [ ] Full integration testing completed

## Next Steps
1. **IMMEDIATE**: WALNUT begins deployment fix
2. **PARALLEL**: IRONWOOD and ACACIA prepare development environments
3. **COORDINATE**: Begin parallel development once deployment is stable
4. **MONITOR**: Regular status updates and issue tracking

---
**System Status**: INITIALIZING -> Ready for deployment fix phase
**Last Updated**: 2025-06-20
**Coordinator**: WALNUT (Primary)