# WALNUT Deployment Instructions for ToolLibrary

## Overview
Deploy Ballarat Tool Library to Docker Swarm on WALNUT (192.168.1.27)
- **Domain**: tools.home.deepblack.cloud
- **Network**: tengig (Traefik ingress)
- **Repository**: This directory contains all deployment files

## Prerequisites on WALNUT

1. **Docker Swarm Manager**: ✅ Already configured
2. **Traefik Network**: Ensure `tengig` network exists
3. **Docker Hub Access**: Login to pull images

## Step 1: Prepare Environment

```bash
# SSH to WALNUT
ssh tony@192.168.1.27

# Navigate to shared container directory
cd /rust/containers/

# Clone or sync the project
git clone /Users/arawlins/Code/deepblackcloud/community-tool-mgmt ballarat-tools
cd ballarat-tools

# Or if already exists, pull latest changes
git pull origin main
```

## Step 2: Configure Docker Hub Username

```bash
# Set your Docker Hub username
export DOCKER_USER="anthonyrawlins"

# Verify tengig network exists
docker network ls | grep tengig

# If tengig doesn't exist, create it:
# docker network create --driver overlay --attachable tengig
```

## Step 3: Configure Secrets

```bash
# Navigate to secrets directory
cd secrets/

# Update all secret files with secure values (CRITICAL!)
# Generate secure passwords:
openssl rand -base64 32 > db_password.txt
openssl rand -base64 32 > redis_password.txt  
openssl rand -base64 64 > jwt_secret.txt

# Update Stripe keys (get from https://dashboard.stripe.com/apikeys)
echo "sk_test_your_stripe_secret_key" > stripe_secret_key.txt
echo "pk_test_your_stripe_publishable_key" > stripe_publishable_key.txt

cd ..
```

## Step 4: Deploy to Swarm

```bash
# Deploy the stack
DOCKER_USER=anthonyrawlins docker stack deploy -c docker-compose.swarm.yml ballarat-tools

# Monitor deployment
docker stack ps ballarat-tools
docker stack services ballarat-tools
```

## Step 5: Verify Deployment

```bash
# Check service status
docker service ls | grep ballarat-tools

# View logs if needed
docker service logs ballarat-tools_frontend
docker service logs ballarat-tools_backend
docker service logs ballarat-tools_db

# Test health endpoints
curl -k https://tools.home.deepblack.cloud/api/health
```

## Expected Services

After deployment, you should see:
- `ballarat-tools_db` (PostgreSQL database)
- `ballarat-tools_redis` (Redis cache)
- `ballarat-tools_backend` (Node.js API - 2 replicas)
- `ballarat-tools_frontend` (Next.js app - 2 replicas)
- `ballarat-tools_nginx` (Internal routing)

## Troubleshooting

### If services fail to start:
```bash
# Check service status
docker service ps ballarat-tools_frontend --no-trunc
docker service ps ballarat-tools_backend --no-trunc

# Check logs
docker service logs ballarat-tools_frontend
docker service logs ballarat-tools_backend
```

### Common issues:
1. **Images not found**: Ensure Docker Hub username is correct and images are pushed
2. **Database connection**: Check if PostgreSQL service is healthy
3. **Network issues**: Verify `tengig` network exists and is external
4. **Secrets**: Ensure all secret files exist and contain valid values

## Post-Deployment

1. **Test the application**: Visit https://tools.home.deepblack.cloud
2. **Database setup**: The database should auto-migrate on first run
3. **Admin account**: Create first admin user through API or seed script
4. **SSL Certificate**: Traefik should automatically obtain Let's Encrypt certificate

## Management Commands

```bash
# Scale services
docker service scale ballarat-tools_frontend=3
docker service scale ballarat-tools_backend=3

# Update service (after new image push)
docker service update --image anthonyrawlins/ballarat-tools-frontend:latest ballarat-tools_frontend

# Remove stack (if needed)
docker stack rm ballarat-tools

# View stack info
docker stack ls
docker stack services ballarat-tools
```

## Security Notes

- All passwords in `secrets/` directory are shared via Docker secrets
- Database and Redis are on internal network only
- Frontend/backend exposed only through Traefik with SSL
- Rate limiting configured in Nginx
- Security headers enabled

## Next Steps

After successful deployment:
1. Test basic functionality (registration, tool browsing)
2. Configure admin user
3. Start development tasks for additional features
4. Monitor performance and logs

The application will be available at: **https://tools.home.deepblack.cloud**