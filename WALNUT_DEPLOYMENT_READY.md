# WALNUT Deployment Ready - Fixed Critical Issues

**Status**: ✅ READY FOR DEPLOYMENT
**Priority**: URGENT - Deploy immediately to unblock cluster
**Assigned To**: WALNUT Agent

## 🔧 Issues Fixed

### ✅ 1. Docker Port Configuration
- **Fixed**: Backend port mismatch (3001 vs 8000)
- **Updated**: docker-compose.swarm.yml to use port 8000 consistently
- **Updated**: Health check endpoints to use correct ports
- **Updated**: Traefik routing to use port 8000 for backend

### ✅ 2. Next.js Standalone Configuration
- **Added**: `output: 'standalone'` to next.config.ts
- **Added**: Proper environment variable configuration
- **Fixed**: Docker build process for frontend

### ✅ 3. Health Endpoints
- **Backend**: Already exists at `/health` (port 8000)
- **Frontend**: Created new endpoint at `/api/health` (port 3000)
- **Docker**: Health checks configured correctly

### ✅ 4. Secret Management
- **Created**: docker-entrypoint.sh for proper secret handling
- **Updated**: Backend Dockerfile to use entrypoint script
- **Fixed**: Database and Redis connection with secrets
- **Ready**: Secrets directory with proper files

### ✅ 5. Environment Configuration
- **Simplified**: Docker Compose environment variables
- **Fixed**: Database URL and Redis URL construction
- **Added**: Proper Prisma migration handling

## 🚀 Deployment Instructions for WALNUT

### Step 1: SSH to WALNUT and Setup
```bash
# SSH to WALNUT
ssh tony@192.168.1.27

# Navigate to containers directory
cd /rust/containers/

# Clone/sync the repository
git clone https://github.com/anthonyrawlins/community-tool-mgmt.git ballarat-tools
cd ballarat-tools

# Or if already exists:
git pull origin main
```

### Step 2: Configure Docker Hub Username
```bash
# Set your Docker Hub username
export DOCKER_USER="anthonyrawlins"  # Replace with actual username

# Login to Docker Hub
docker login
```

### Step 3: Generate Secure Secrets
```bash
# Navigate to secrets directory
cd secrets/

# Generate secure passwords (IMPORTANT!)
openssl rand -base64 32 > db_password.txt
openssl rand -base64 32 > redis_password.txt  
openssl rand -base64 64 > jwt_secret.txt

# Add Stripe keys (use test keys for now)
echo "sk_test_your_stripe_secret_key_here" > stripe_secret_key.txt
echo "pk_test_your_stripe_publishable_key_here" > stripe_publishable_key.txt

cd ..
```

### Step 4: Build and Push Docker Images
```bash
# Build and push images to Docker Hub
./build-and-push.sh

# This will:
# 1. Build frontend and backend images
# 2. Tag them with your Docker Hub username
# 3. Push to Docker Hub
```

### Step 5: Deploy to Docker Swarm
```bash
# Verify tengig network exists
docker network ls | grep tengig

# If tengig doesn't exist, create it:
# docker network create --driver overlay --attachable tengig

# Deploy the stack
DOCKER_USER=anthonyrawlins docker stack deploy -c docker-compose.swarm.yml ballarat-tools

# Monitor deployment
docker stack ps ballarat-tools
docker stack services ballarat-tools
```

### Step 6: Verify Deployment
```bash
# Check service status (wait for all services to be running)
docker service ls | grep ballarat-tools

# Check individual service health
docker service ps ballarat-tools_frontend
docker service ps ballarat-tools_backend
docker service ps ballarat-tools_db

# View logs if any issues
docker service logs ballarat-tools_frontend
docker service logs ballarat-tools_backend

# Test health endpoints
curl -k https://tools.home.deepblack.cloud/api/health
curl -k https://tools.home.deepblack.cloud/api/v1/health
```

## 🎯 Expected Results

After successful deployment:
- **Frontend**: https://tools.home.deepblack.cloud (Next.js app)
- **Backend API**: https://tools.home.deepblack.cloud/api/v1/* (Express API)
- **Health Checks**: Both endpoints should return success JSON
- **SSL**: Traefik should automatically obtain Let's Encrypt certificate
- **Services**: All 5 services (db, redis, backend, frontend, nginx) running

## 🔍 Troubleshooting

### If services fail to start:
```bash
# Check specific service status
docker service ps ballarat-tools_[service-name] --no-trunc

# Check logs for errors
docker service logs ballarat-tools_[service-name] --tail 50

# Common issues:
# 1. Images not found - check DOCKER_USER is correct
# 2. Secrets not found - verify secrets/ files exist
# 3. Network issues - verify tengig network exists
# 4. Port conflicts - check no other services on same ports
```

### Service Recovery:
```bash
# Restart a specific service
docker service update --force ballarat-tools_[service-name]

# Scale service to 0 and back up
docker service scale ballarat-tools_[service-name]=0
docker service scale ballarat-tools_[service-name]=2

# Remove and redeploy stack
docker stack rm ballarat-tools
# Wait 30 seconds, then redeploy
DOCKER_USER=anthonyrawlins docker stack deploy -c docker-compose.swarm.yml ballarat-tools
```

## 📊 Success Metrics

- [ ] ✅ tools.home.deepblack.cloud loads successfully
- [ ] ✅ Frontend health check: `/api/health` returns 200
- [ ] ✅ Backend health check: `/api/v1/health` returns 200  
- [ ] ✅ Database connected (check backend logs)
- [ ] ✅ All 5 services running and healthy
- [ ] ✅ SSL certificate obtained automatically
- [ ] ✅ Basic registration/login functionality works

## 🔄 Post-Deployment Actions

### 1. Notify Cluster (Immediate)
Update `CLUSTER_STATUS.md`:
```
Phase 1: ✅ COMPLETED - Deployment successful
Phase 2: 🚀 STARTING - Parallel development begins
```

### 2. Signal Other Agents
- **IRONWOOD**: Begin member dashboard development
- **ACACIA**: Begin security audit and testing setup
- **All**: Update individual agent status files

### 3. Begin Tool Catalog Development
- Start assigned feature work (Tool Catalog Integration)
- Use qwen2.5-coder model for development
- Coordinate with other agents every 30 minutes

## 🎉 Expected Timeline

**Total Time**: 15-30 minutes for full deployment
- **Setup**: 5 minutes
- **Build & Push**: 10-15 minutes  
- **Deploy & Test**: 5-10 minutes

**Next Phase**: Parallel development starts immediately after deployment verified

---

**🚨 CRITICAL**: This deployment must succeed before any other development work can begin. The entire cluster is waiting on this deployment to be stable and accessible.