#!/bin/bash
# Deploy Clipper Pro Backend to VPS
# Usage: ./deploy-vps.sh

set -e

VPS_USER="ubuntu"
VPS_HOST="89.168.58.158"
VPS_KEY="$HOME/Desktop/ORACLE CLIPPER/SCRIPT VM/ssh-key-2025-11-14.key"
REMOTE_DIR="/home/ubuntu/clipper-backend"

echo "🚀 Deploying Clipper Pro Backend..."

# Build locally first to catch errors
echo "📦 Building TypeScript..."
npm run build

# Create remote directory
echo "📁 Creating remote directory..."
ssh -i "$VPS_KEY" "$VPS_USER@$VPS_HOST" "mkdir -p $REMOTE_DIR"

# Sync files (excluding node_modules, .env, logs)
echo "📤 Syncing files to VPS..."
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.env' \
  --exclude '.env.local' \
  --exclude 'logs' \
  --exclude '*.log' \
  --exclude '.git' \
  -e "ssh -i \"$VPS_KEY\"" \
  ./ "$VPS_USER@$VPS_HOST:$REMOTE_DIR/"

# Build and restart on VPS
echo "🐳 Building Docker image on VPS..."
ssh -i "$VPS_KEY" "$VPS_USER@$VPS_HOST" "cd $REMOTE_DIR && sudo docker build -t clipper-backend:latest ."

echo "🔄 Restarting container..."
ssh -i "$VPS_KEY" "$VPS_USER@$VPS_HOST" "cd /home/ubuntu/proxy && sudo docker-compose up -d backend"

echo "✅ Deployment complete!"
echo "🔍 Check logs: ssh -i \"$VPS_KEY\" $VPS_USER@$VPS_HOST 'sudo docker logs -f clipper-backend'"