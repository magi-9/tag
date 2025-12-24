#!/bin/bash

# rebuild-prod.sh - Production deployment script
# Usage: ./rebuild-prod.sh [ssh-user@host]
# Example: ./rebuild-prod.sh ubuntu@tag.tommag.xyz

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check arguments
if [ -z "$1" ]; then
    echo -e "${YELLOW}Usage: ./rebuild-prod.sh [ssh-user@host]${NC}"
    echo -e "${YELLOW}Example: ./rebuild-prod.sh ubuntu@tag.tommag.xyz${NC}"
    exit 1
fi

SSH_TARGET=$1
DOCKER_USERNAME=${DOCKER_USERNAME:-tommagula}

echo -e "${BLUE}🚀 Production deployment script${NC}"
echo "Target: $SSH_TARGET"
echo ""

# Step 1: Test SSH connection
echo -e "${BLUE}🔐 Testing SSH connection...${NC}"
if ! ssh -o ConnectTimeout=5 "$SSH_TARGET" "echo OK" > /dev/null 2>&1; then
    echo -e "${RED}❌ Cannot connect to $SSH_TARGET${NC}"
    exit 1
fi
echo -e "${GREEN}✅ SSH connection successful${NC}"

# Step 2: Build and push Docker images
echo ""
echo -e "${BLUE}📦 Building Docker images...${NC}"
docker-compose build --no-cache

echo -e "${BLUE}📤 Pushing images to registry...${NC}"
if [ -z "$DOCKER_PASSWORD" ]; then
    echo -e "${YELLOW}⚠️  DOCKER_PASSWORD not set. Skipping Docker push.${NC}"
    echo -e "${YELLOW}To push images, run:${NC}"
    echo -e "  docker login"
    echo -e "  docker push $DOCKER_USERNAME/tag-game-backend:latest"
    echo -e "  docker push $DOCKER_USERNAME/tag-game-frontend:latest"
else
    echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
    docker push "$DOCKER_USERNAME/tag-game-backend:latest"
    docker push "$DOCKER_USERNAME/tag-game-frontend:latest"
    echo -e "${GREEN}✅ Images pushed successfully${NC}"
fi

# Step 3: Deploy on remote server
echo ""
echo -e "${BLUE}🚀 Deploying to production...${NC}"

# Create deployment script
DEPLOY_SCRIPT=$(cat <<'EOF'
#!/bin/bash
set -e

cd /opt/tag-game

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# Copy production environment
echo "⚙️  Setting up environment..."
if [ ! -f backend/.env.prod ]; then
    echo "❌ backend/.env.prod not found!"
    exit 1
fi

# Load environment variables
export $(cat backend/.env.prod | grep -v '^#' | xargs)

# Pull latest Docker images
echo "📦 Pulling Docker images..."
docker-compose -f docker-compose-prod.yml pull

# Stop old containers
echo "🛑 Stopping old containers..."
docker-compose -f docker-compose-prod.yml down || true

# Start new containers
echo "🚀 Starting new containers..."
docker-compose -f docker-compose-prod.yml up -d

# Wait for services
echo "⏳ Waiting for services..."
sleep 10

# Run migrations
echo "🗄️  Running migrations..."
docker-compose -f docker-compose-prod.yml exec -T backend python manage.py migrate

# Collect static files
echo "📊 Collecting static files..."
docker-compose -f docker-compose-prod.yml exec -T backend python manage.py collectstatic --noinput

# Generate achievements
echo "🏅 Calculating achievements..."
docker-compose -f docker-compose-prod.yml exec -T backend python manage.py shell -c "
from game.game_engine import GameEngine
GameEngine.calculate_achievements()
print('Achievements calculated!')
"

# Health check
echo "💚 Checking health..."
docker-compose -f docker-compose-prod.yml ps

echo "✅ Deployment complete!"
EOF
)

# Execute deployment script on remote
echo "$DEPLOY_SCRIPT" | ssh "$SSH_TARGET" 'bash -s'

# Step 4: Verify deployment
echo ""
echo -e "${BLUE}🔍 Verifying deployment...${NC}"

# Check backend
if curl -sf https://tag.tommag.xyz/api/game/settings/rules/ > /dev/null; then
    echo -e "${GREEN}✅ Backend is responding${NC}"
else
    echo -e "${RED}❌ Backend health check failed${NC}"
    exit 1
fi

# Check frontend
if curl -sf https://tag.tommag.xyz/ > /dev/null; then
    echo -e "${GREEN}✅ Frontend is responding${NC}"
else
    echo -e "${RED}❌ Frontend health check failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Production deployment successful!${NC}"
echo ""
echo "Access your application:"
echo "  URL: https://tag.tommag.xyz"
echo "  Admin: https://tag.tommag.xyz/admin"
echo ""
echo "To view logs on the server:"
echo "  ssh $SSH_TARGET"
echo "  cd /opt/tag-game"
echo "  docker-compose -f docker-compose-prod.yml logs -f"
