#!/bin/bash

# deploy-local.sh - Deployment to local server via SSH
# Usage: ./deploy-local.sh [user@ip]
# Example: ./deploy-local.sh root@192.168.0.11

set -e

# Configuration
TARGET=${1:-root@192.168.0.11}
REMOTE_PATH="/opt/tag"

echo "🚀 Starting deployment to $TARGET..."

# Ensure remote path exists
echo "📂 Creating remote directory..."
ssh $TARGET "mkdir -p $REMOTE_PATH"

# Sync files (excluding dev files and large directories)
echo "📦 Syncing files..."
rsync -avz --delete \
    --exclude '.git' \
    --exclude '.github' \
    --exclude '.vscode' \
    --exclude 'node_modules' \
    --exclude '__pycache__' \
    --exclude 'venv' \
    --exclude '.env' \
    --exclude 'staticfiles' \
    --exclude 'media' \
    ./ $TARGET:$REMOTE_PATH/

# Check for .env.prod on remote
echo "📋 Checking environment file..."
if ! ssh $TARGET "[ -f $REMOTE_PATH/backend/.env.prod ]"; then
    echo "⚠️  backend/.env.prod not found on server!"
    echo "Copying local backend/.env as a template..."
    if [ -f backend/.env ]; then
        scp backend/.env $TARGET:$REMOTE_PATH/backend/.env.prod
        echo "✅ Created template .env.prod from .env"
        echo "🔴 IMPORTANT: Edit $REMOTE_PATH/backend/.env.prod and set DEBUG=False and proper URLs!"
    else
        echo "❌ No .env file found to use as template. Please create one on the server."
    fi
fi

# Build and start on remote
echo "🔨 Building and starting services on server..."
ssh $TARGET "cd $REMOTE_PATH && \
    docker-compose -f docker-compose-local-prod.yml down && \
    (docker volume rm tag_frontend_dist_local 2>/dev/null || true) && \
    docker-compose -f docker-compose-local-prod.yml up -d --build"

echo ""
echo "✅ Deployment requested!"
echo "Check status with: ssh $TARGET 'cd $REMOTE_PATH && docker-compose -f docker-compose-local-prod.yml ps'"
echo "View logs with: ssh $TARGET 'cd $REMOTE_PATH && docker-compose -f docker-compose-local-prod.yml logs -f'"
