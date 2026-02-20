#!/bin/bash

# Mission Control - Production Deployment Script
# Usage: ./deploy.sh [environment]
# Environment: local (default), staging, production

set -e

ENV=${1:-local}
IMAGE_NAME="mission-control"
CONTAINER_NAME="mission-control"

echo "🚀 Mission Control Deployment"
echo "================================"
echo "Environment: $ENV"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

case $ENV in
  local)
    echo -e "${BLUE}Building for local development...${NC}"
    npm run build
    echo -e "${GREEN}✅ Build complete${NC}"
    echo ""
    echo "Starting production server..."
    npm start
    ;;

  staging)
    echo -e "${BLUE}Building Docker image for staging...${NC}"
    docker build -t $IMAGE_NAME:staging .
    echo -e "${GREEN}✅ Docker image built${NC}"
    echo ""
    echo -e "${YELLOW}Starting staging deployment...${NC}"
    docker-compose -f docker-compose.yml down 2>/dev/null || true
    docker-compose -f docker-compose.yml up -d
    echo -e "${GREEN}✅ Staging deployment complete${NC}"
    echo ""
    echo "Mission Control is running at: http://localhost:3000"
    ;;

  production)
    echo -e "${BLUE}Building Docker image for production...${NC}"
    docker build -t $IMAGE_NAME:latest .
    echo -e "${GREEN}✅ Docker image built${NC}"
    echo ""
    echo -e "${YELLOW}Starting production deployment with nginx...${NC}"
    docker-compose --profile with-nginx down 2>/dev/null || true
    docker-compose --profile with-nginx up -d
    echo -e "${GREEN}✅ Production deployment complete${NC}"
    echo ""
    echo "Mission Control is running at:"
    echo "  - HTTP:  http://localhost"
    echo "  - HTTPS: https://localhost (if SSL configured)"
    ;;

  *)
    echo "Usage: ./deploy.sh [local|staging|production]"
    echo ""
    echo "Environments:"
    echo "  local       - Build and run locally (development)"
    echo "  staging     - Deploy to staging with Docker"
    echo "  production  - Deploy to production with Docker + Nginx"
    exit 1
    ;;
esac

echo ""
echo -e "${GREEN}🎉 Deployment complete!${NC}"
