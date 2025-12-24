#!/bin/bash

echo "🎮 Tag Game - Quick Start Script"
echo "================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose found"
echo ""

# Create .env files if they don't exist
if [ ! -f backend/.env ]; then
    echo "📝 Creating backend/.env from example..."
    cp backend/.env.example backend/.env
    echo "⚠️  Please edit backend/.env and set your admin credentials!"
fi

if [ ! -f frontend/.env ]; then
    echo "📝 Creating frontend/.env from example..."
    cp frontend/.env.example frontend/.env
fi

echo ""
echo "🐳 Building and starting Docker containers..."
docker-compose up -d --build

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

echo ""
echo "🔑 Generating VAPID keys for push notifications..."
docker-compose exec -T backend python -c "
from pywebpush import webpush
import base64

vapid_keys = webpush.generate_vapid_keys()
print('\\n=== Add these to backend/.env and frontend/.env ===')
print(f'VAPID_PUBLIC_KEY={vapid_keys[\"public_key\"]}')
print(f'VAPID_PRIVATE_KEY={vapid_keys[\"private_key\"]}')
print('\\n=== In frontend/.env use only PUBLIC key ===')
print(f'VITE_VAPID_PUBLIC_KEY={vapid_keys[\"public_key\"]}')
print('====================================================\\n')
"

echo ""
echo "✅ Setup complete!"
echo ""
echo "📍 Access points:"
echo "   Frontend: http://localhost:5173"
echo "   Backend API: http://localhost:8000/api"
echo "   Django Admin: http://localhost:8000/admin"
echo ""
echo "📝 Next steps:"
echo "   1. Add VAPID keys to .env files (shown above)"
echo "   2. Restart: docker-compose restart"
echo "   3. Login with admin credentials from backend/.env"
echo ""
echo "📖 View logs: docker-compose logs -f"
echo "🛑 Stop all: docker-compose down"
echo ""
echo "🎮 Happy gaming!"
