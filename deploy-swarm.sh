#!/bin/bash

# Deploy Ballarat Tool Library to Docker Swarm
# Domain: tools.home.deepblack.cloud
# Network: tengig (Traefik ingress)

set -e

echo "🚀 Deploying Ballarat Tool Library to Docker Swarm"
echo "=================================================="

# Check if we're in a swarm
if ! docker info --format '{{.Swarm.LocalNodeState}}' | grep -q active; then
    echo "❌ Error: Not in a Docker Swarm. Please initialize or join a swarm first."
    exit 1
fi

# Check if tengig network exists
if ! docker network ls --format "{{.Name}}" | grep -q "^tengig$"; then
    echo "❌ Error: 'tengig' network not found. Please create the Traefik ingress network first."
    echo "   Run: docker network create --driver overlay --attachable tengig"
    exit 1
fi

# Build images
echo "🔨 Building Docker images..."
docker build -f Dockerfile.frontend -t ballarat-tool-library-frontend:latest .
docker build -f Dockerfile.backend -t ballarat-tool-library-backend:latest .

# Check secrets exist and warn about defaults
echo "🔐 Checking secrets configuration..."
SECRETS_DIR="./secrets"
if [ ! -d "$SECRETS_DIR" ]; then
    echo "❌ Error: Secrets directory not found at $SECRETS_DIR"
    exit 1
fi

NEED_UPDATE=false
for secret_file in db_password.txt redis_password.txt jwt_secret.txt stripe_secret_key.txt stripe_publishable_key.txt; do
    if [ ! -f "$SECRETS_DIR/$secret_file" ]; then
        echo "❌ Error: Secret file $secret_file not found"
        exit 1
    fi
    
    if grep -q "CHANGEME" "$SECRETS_DIR/$secret_file"; then
        echo "⚠️  Warning: $secret_file contains default 'CHANGEME' values"
        NEED_UPDATE=true
    fi
done

if [ "$NEED_UPDATE" = true ]; then
    echo "⚠️  Please update secret files before production deployment!"
    echo "   See secrets/README.md for instructions"
    echo ""
    read -p "Continue with deployment? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Deployment cancelled"
        exit 1
    fi
fi

# Deploy stack
echo "📦 Deploying stack to swarm..."
docker stack deploy -c docker-compose.swarm.yml ballarat-tool-library

echo ""
echo "✅ Deployment initiated successfully!"
echo ""
echo "📊 Monitor deployment status:"
echo "   docker stack services ballarat-tool-library"
echo "   docker stack ps ballarat-tool-library"
echo ""
echo "🌐 Service will be available at:"
echo "   https://ballarat-tool-library.home.deepblack.cloud"
echo ""
echo "🔍 View logs:"
echo "   docker service logs ballarat-tool-library_frontend"
echo "   docker service logs ballarat-tool-library_backend"
echo "   docker service logs ballarat-tool-library_db"
echo ""
echo "🗑️  To remove stack:"
echo "   docker stack rm ballarat-tool-library"
echo ""
echo "⏱️  Note: Services may take a few moments to become healthy and available."