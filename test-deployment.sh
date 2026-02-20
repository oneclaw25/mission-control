#!/bin/bash
# Quick deployment test script

echo "🚀 Mission Control Deployment Test"
echo "===================================="

cd "$(dirname "$0")"

# Check if build exists
if [ ! -d "dist" ]; then
    echo "❌ No build found. Run 'npm run build' first."
    exit 1
fi

echo "✅ Build exists"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "❌ No node_modules. Run 'npm install' first."
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Check if port 3000 is available
if lsof -i :3000 > /dev/null 2>&1; then
    echo "⚠️  Port 3000 is already in use"
    echo "   Kill existing process or use different port"
else
    echo "✅ Port 3000 is available"
fi

echo ""
echo "📋 Deployment Options:"
echo ""
echo "1. Development:"
echo "   npm run dev"
echo ""
echo "2. Production (local):"
echo "   npm run build"
echo "   npm start"
echo ""
echo "3. Docker:"
echo "   ./deploy.sh staging"
echo "   ./deploy.sh production"
echo ""
echo "4. Docker Compose:"
echo "   docker-compose up -d"
echo ""
