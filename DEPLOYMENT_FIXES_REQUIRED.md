# URGENT: Deployment Fixes Required for WALNUT

**Status**: 🚨 CRITICAL - Multiple blocking issues identified
**Priority**: URGENT - Must fix before parallel development can begin
**Assigned To**: WALNUT Agent (Primary Coordinator)

## Critical Issues Identified

### 1. 🚨 Port Mismatch in Docker Configuration
**Problem**: Backend Dockerfile exposes port 8000, but docker-compose.swarm.yml expects port 3001
**Impact**: Backend service will fail to start
**Location**: 
- `Dockerfile.backend:40` - ENV PORT=8000
- `docker-compose.swarm.yml:66` - PORT: 3001
- `docker-compose.swarm.yml:94` - healthcheck curl localhost:3001

**Fix Required**:
```yaml
# In docker-compose.swarm.yml, change:
PORT: 3001
# To:
PORT: 8000

# And update healthcheck:
test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
```

### 2. 🚨 Next.js Standalone Output Configuration Missing
**Problem**: Frontend Dockerfile expects standalone output but Next.js config doesn't enable it
**Impact**: Frontend build will fail
**Location**: 
- `Dockerfile.frontend:54` - expects /app/.next/standalone
- `next.config.ts` - missing output: 'standalone'

**Fix Required**:
```typescript
// In next.config.ts, add:
const nextConfig: NextConfig = {
  output: 'standalone',
  // ... other config
};
```

### 3. 🚨 Missing Health Endpoints
**Problem**: Healthchecks reference `/health` and `/api/health` endpoints that don't exist
**Impact**: Docker health checks will fail, services marked unhealthy
**Location**: 
- Backend: `http://localhost:8000/api/health`
- Frontend: `http://localhost:3000/api/health`

**Fix Required**: Create health check endpoints in both services

### 4. 🚨 Environment Variable Secret Handling
**Problem**: Backend tries to read secrets as environment variables instead of files
**Impact**: Database and Redis connections will fail
**Location**: `docker-compose.swarm.yml:62-63`

**Fix Required**:
```yaml
# Change from:
DATABASE_URL: postgresql://ballarat_user:${DB_PASSWORD}@db:5432/ballarat_tools
REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379

# To use secret files or modify backend code to read from files
```

### 5. ⚠️ Traefik Routing Configuration
**Problem**: Complex routing configuration may have conflicts
**Impact**: External access to tools.home.deepblack.cloud may fail
**Location**: `docker-compose.swarm.yml:130-162`

**Fix Required**: Simplify and test routing configuration

## Immediate Action Plan (WALNUT)

### Step 1: Fix Port Configuration (5 minutes)
1. Update `docker-compose.swarm.yml` backend port from 3001 to 8000
2. Update healthcheck URL to use port 8000
3. Verify all port references are consistent

### Step 2: Fix Next.js Configuration (5 minutes)
1. Add `output: 'standalone'` to `next.config.ts`
2. Verify build configuration works locally

### Step 3: Create Health Endpoints (15 minutes)
1. Add `/health` endpoint to backend (`backend/src/server.ts`)
2. Add `/api/health` endpoint to frontend (API route)
3. Test endpoints respond correctly

### Step 4: Fix Secret Handling (10 minutes)
1. Update backend code to read secrets from files
2. Or modify environment variables to use secret values correctly
3. Test database connection with secrets

### Step 5: Test Docker Build (10 minutes)
1. Run `./build-and-push.sh` to build images
2. Fix any build errors
3. Push images to Docker Hub

### Step 6: Deploy and Test (15 minutes)
1. Deploy to WALNUT Docker Swarm
2. Check service status
3. Test https://tools.home.deepblack.cloud access
4. Verify all services healthy

## Estimated Time: 60-90 minutes

## Required Files to Modify

1. **docker-compose.swarm.yml** - Port and health check fixes
2. **next.config.ts** - Add standalone output
3. **backend/src/server.ts** - Add health endpoint
4. **src/app/api/health/route.ts** - Add frontend health endpoint (create)
5. **backend/src/config/database.ts** - Fix secret file reading

## Testing Checklist

- [ ] Docker images build successfully
- [ ] All services start without errors
- [ ] Health checks pass for all services
- [ ] Database connection established
- [ ] Redis connection established
- [ ] External access via tools.home.deepblack.cloud works
- [ ] SSL certificate obtained by Traefik
- [ ] Basic frontend loads without errors
- [ ] Backend API responds to health check

## Success Criteria

- ✅ All Docker services running and healthy
- ✅ tools.home.deepblack.cloud accessible with SSL
- ✅ Basic functionality test passes
- ✅ Ready for parallel development by IRONWOOD and ACACIA

## Next Steps After Deployment Fix

1. **Notify IRONWOOD and ACACIA**: Deployment stable, begin parallel development
2. **Update CLUSTER_STATUS.md**: Move to Phase 2 (Parallel Development)
3. **Begin Tool Catalog Development**: Start assigned feature work
4. **Coordinate with other agents**: Regular status updates and integration points

---

**URGENT**: This deployment fix is blocking the entire development cluster. All agents are waiting on WALNUT to complete this critical path work.