#!/bin/bash

# Simple development rebuild script
set -e

echo "🚀 Rebuilding development environment..."

# Stop and clean
docker-compose down

# Build and start
docker-compose up -d --build

echo "✅ Environment is up!"
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:5173"
