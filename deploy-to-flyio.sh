#!/bin/bash

# GlobalVoice Nexus - Fly.io Deployment Script
# World-class infrastructure deployment

set -e

echo "🚀 GlobalVoice Nexus - Fly.io Deployment"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Fly CLI path
FLYCTL="/Users/dduncan/.fly/bin/flyctl"

# Check if flyctl is installed
if [ ! -f "$FLYCTL" ]; then
    echo -e "${RED}❌ Fly.io CLI not found${NC}"
    echo "Installing Fly.io CLI..."
    curl -L https://fly.io/install.sh | sh
    echo -e "${GREEN}✅ Fly.io CLI installed${NC}"
fi

# Check if logged in
echo -e "${BLUE}🔐 Checking Fly.io authentication...${NC}"
if ! $FLYCTL auth whoami > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Not logged in to Fly.io${NC}"
    echo "Opening browser for authentication..."
    $FLYCTL auth login
else
    echo -e "${GREEN}✅ Already authenticated${NC}"
fi

# Navigate to backend directory
cd "$(dirname "$0")/backend"

# Check if app exists
echo -e "${BLUE}📦 Checking if app exists...${NC}"
if ! $FLYCTL apps list | grep -q "globalvoice-backend"; then
    echo -e "${YELLOW}⚠️  App doesn't exist, creating...${NC}"
    $FLYCTL apps create globalvoice-backend --org personal
    echo -e "${GREEN}✅ App created${NC}"
else
    echo -e "${GREEN}✅ App already exists${NC}"
fi

# Set secrets
echo -e "${BLUE}🔑 Setting environment secrets...${NC}"
echo "This will set up all required environment variables."
echo ""

# Check if secrets are already set
if $FLYCTL secrets list -a globalvoice-backend | grep -q "DATABASE_URL"; then
    echo -e "${GREEN}✅ Secrets already configured${NC}"
else
    echo -e "${YELLOW}⚠️  Setting up secrets...${NC}"
    
    # Set database URL
    $FLYCTL secrets set \
      DATABASE_URL="postgresql://postgres:U1rw29AqFQPvJLse@db.hzxubnyehbrsqmzciixf.supabase.co:5432/postgres" \
      -a globalvoice-backend
    
    # Set JWT and encryption keys
    $FLYCTL secrets set \
      JWT_SECRET="globalvoice-jwt-secret-xdun1698-production-key" \
      ENCRYPTION_KEY="globalvoice-encryption-xdun1698-prod-key" \
      -a globalvoice-backend
    
    # Set frontend URL
    $FLYCTL secrets set \
      FRONTEND_URL="https://globalvoice-nexus.netlify.app" \
      -a globalvoice-backend
    
    echo -e "${GREEN}✅ Secrets configured${NC}"
fi

# Deploy
echo -e "${BLUE}🚀 Deploying to Fly.io...${NC}"
echo "This may take a few minutes..."
echo ""

$FLYCTL deploy --remote-only -a globalvoice-backend

# Check deployment status
echo ""
echo -e "${BLUE}📊 Checking deployment status...${NC}"
$FLYCTL status -a globalvoice-backend

# Health check
echo ""
echo -e "${BLUE}🏥 Running health check...${NC}"
sleep 5

if curl -f https://globalvoice-backend.fly.dev/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Health check passed!${NC}"
    echo ""
    echo -e "${GREEN}🎉 Deployment successful!${NC}"
    echo ""
    echo "Backend URL: https://globalvoice-backend.fly.dev"
    echo "Health Check: https://globalvoice-backend.fly.dev/health"
    echo ""
    echo "Next steps:"
    echo "1. Update Netlify environment variables:"
    echo "   VITE_BACKEND_URL=https://globalvoice-backend.fly.dev"
    echo "   VITE_WS_URL=wss://globalvoice-backend.fly.dev"
    echo ""
    echo "2. Test login at: https://globalvoice-nexus.netlify.app/login"
    echo "   Email: test@globalvoice.com"
    echo "   Password: TestPass123!"
    echo ""
else
    echo -e "${RED}❌ Health check failed${NC}"
    echo "Checking logs..."
    $FLYCTL logs -a globalvoice-backend
    exit 1
fi

# View logs
echo -e "${BLUE}📋 Recent logs:${NC}"
$FLYCTL logs -a globalvoice-backend --lines 20

echo ""
echo -e "${GREEN}✅ All done!${NC}"
echo ""
echo "Useful commands:"
echo "  View logs:    $FLYCTL logs -a globalvoice-backend"
echo "  View status:  $FLYCTL status -a globalvoice-backend"
echo "  SSH into app: $FLYCTL ssh console -a globalvoice-backend"
echo "  Scale app:    $FLYCTL scale count 2 -a globalvoice-backend"
echo ""
