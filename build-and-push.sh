#!/bin/bash

# Build and push ToolLibrary images to Docker Hub
# Run this script before deploying to swarm

set -e

# Configuration
DOCKER_USER=${DOCKER_USER:-"anthonyrawlins"}  # Replace with your Docker Hub username
PROJECT_NAME="ballarat-tools"
VERSION=${VERSION:-"latest"}

echo "🔨 Building and pushing ToolLibrary images to Docker Hub"
echo "========================================================="
echo "Docker Hub user: $DOCKER_USER"
echo "Project: $PROJECT_NAME"
echo "Version: $VERSION"
echo ""

# Check if logged in to Docker Hub
if ! docker info | grep -q "Username:"; then
    echo "🔐 Please login to Docker Hub first:"
    echo "   docker login"
    exit 1
fi

# Build frontend image
echo "🏗️  Building frontend image..."
docker build -f Dockerfile.frontend -t $DOCKER_USER/$PROJECT_NAME-frontend:$VERSION .
docker tag $DOCKER_USER/$PROJECT_NAME-frontend:$VERSION $DOCKER_USER/$PROJECT_NAME-frontend:latest

# Build backend image
echo "🏗️  Building backend image..."
docker build -f Dockerfile.backend -t $DOCKER_USER/$PROJECT_NAME-backend:$VERSION .
docker tag $DOCKER_USER/$PROJECT_NAME-backend:$VERSION $DOCKER_USER/$PROJECT_NAME-backend:latest

# Push frontend image
echo "📤 Pushing frontend image..."
docker push $DOCKER_USER/$PROJECT_NAME-frontend:$VERSION
docker push $DOCKER_USER/$PROJECT_NAME-frontend:latest

# Push backend image
echo "📤 Pushing backend image..."
docker push $DOCKER_USER/$PROJECT_NAME-backend:$VERSION
docker push $DOCKER_USER/$PROJECT_NAME-backend:latest

echo ""
echo "✅ Images successfully pushed to Docker Hub!"
echo ""
echo "Frontend: $DOCKER_USER/$PROJECT_NAME-frontend:$VERSION"
echo "Backend:  $DOCKER_USER/$PROJECT_NAME-backend:$VERSION"
echo ""
echo "🔄 Next steps:"
echo "1. Update docker-compose.swarm.yml with your Docker Hub username"
echo "2. Deploy to swarm with: docker stack deploy -c docker-compose.swarm.yml ballarat-tools"
echo ""
echo "🌐 After deployment, service will be available at:"
echo "   https://tools.home.deepblack.cloud"