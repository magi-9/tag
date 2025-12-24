#!/bin/bash

# rebuild-dev.sh - Development build script
# Usage: ./rebuild-dev.sh

set -e

echo "🚀 Starting development rebuild..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker."
    exit 1
fi

echo -e "${BLUE}📦 Pulling latest images...${NC}"
docker-compose pull

echo -e "${BLUE}🔨 Building services...${NC}"
docker-compose build --no-cache

echo -e "${BLUE}🛑 Stopping existing services...${NC}"
docker-compose down || true

echo -e "${BLUE}🚀 Starting services...${NC}"
docker-compose up -d

echo -e "${BLUE}⏳ Waiting for backend to be ready...${NC}"
sleep 5

echo -e "${BLUE}🗄️  Running migrations...${NC}"
docker-compose exec -T backend python manage.py migrate

echo -e "${BLUE}📊 Creating superuser (if needed)...${NC}"
docker-compose exec -T backend python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print('Superuser created: admin / admin123')
else:
    print('Superuser already exists')
"

echo -e "${BLUE}🔑 Generating VAPID keys (if needed)...${NC}"
docker-compose exec -T backend python manage.py shell -c "
import os
from pywebpush import webpush
if not os.getenv('VAPID_PUBLIC_KEY'):
    vapid_keys = webpush.generate_vapid_keys()
    print('VAPID_PUBLIC_KEY=' + vapid_keys['public_key'])
    print('VAPID_PRIVATE_KEY=' + vapid_keys['private_key'])
    print('Add these to your .env file!')
"

echo -e "${BLUE}📊 Checking service health...${NC}"
docker-compose ps

echo -e "${GREEN}✅ Development environment ready!${NC}"
echo ""
echo "URLs:"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:8000"
echo "  Admin:    http://localhost:8000/admin"
echo ""
echo "Default credentials:"
echo "  Username: admin"
echo "  Password: admin123"
echo ""
echo "To view logs:"
echo "  docker-compose logs -f backend"
echo "  docker-compose logs -f frontend"
