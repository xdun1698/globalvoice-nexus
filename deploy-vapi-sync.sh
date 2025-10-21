#!/bin/bash

# Deploy Vapi Sync System to Production
# This script deploys the bidirectional sync system to Fly.io and Netlify

set -e  # Exit on error

echo "🚀 Deploying Vapi Sync System..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Must run from project root${NC}"
    exit 1
fi

# Step 1: Run database migration
echo -e "${BLUE}📊 Step 1: Running database migration...${NC}"
cd backend
if npm run migrate; then
    echo -e "${GREEN}✅ Database migration completed${NC}"
else
    echo -e "${RED}❌ Database migration failed${NC}"
    exit 1
fi
cd ..

# Step 2: Deploy backend to Fly.io
echo ""
echo -e "${BLUE}🚀 Step 2: Deploying backend to Fly.io...${NC}"
cd backend
if /Users/dduncan/.fly/bin/flyctl deploy --remote-only -a globalvoice-backend; then
    echo -e "${GREEN}✅ Backend deployed successfully${NC}"
else
    echo -e "${RED}❌ Backend deployment failed${NC}"
    exit 1
fi
cd ..

# Step 3: Build frontend
echo ""
echo -e "${BLUE}🔨 Step 3: Building frontend...${NC}"
cd frontend
if npm run build; then
    echo -e "${GREEN}✅ Frontend built successfully${NC}"
else
    echo -e "${RED}❌ Frontend build failed${NC}"
    exit 1
fi
cd ..

# Step 4: Deploy frontend to Netlify
echo ""
echo -e "${BLUE}🌐 Step 4: Deploying frontend to Netlify...${NC}"
echo -e "${YELLOW}⚠️  Please deploy frontend manually to Netlify:${NC}"
echo "   1. Go to https://app.netlify.com"
echo "   2. Select globalvoice-nexus site"
echo "   3. Click 'Trigger deploy' → 'Deploy site'"
echo "   OR push to GitHub and Netlify will auto-deploy"
echo ""

# Step 5: Verify deployment
echo -e "${BLUE}🔍 Step 5: Verifying deployment...${NC}"
echo ""
echo "Testing backend health..."
if curl -s https://globalvoice-backend.fly.dev/health | grep -q "healthy"; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
else
    echo -e "${RED}❌ Backend health check failed${NC}"
fi

echo ""
echo "Testing Vapi sync endpoint..."
if curl -s https://globalvoice-backend.fly.dev/api/vapi-sync/health | grep -q "healthy"; then
    echo -e "${GREEN}✅ Vapi sync endpoint is healthy${NC}"
else
    echo -e "${RED}❌ Vapi sync endpoint check failed${NC}"
fi

# Step 6: Instructions
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Vapi Sync System Deployment Complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo ""
echo "1. Login to application:"
echo "   https://globalvoice-nexus.netlify.app"
echo ""
echo "2. Navigate to Vapi Sync page:"
echo "   Click 'Vapi Sync' in sidebar"
echo ""
echo "3. Run Full Sync:"
echo "   Click 'Full Synchronization' button"
echo ""
echo "4. Verify your Vapi data:"
echo "   - Phone Numbers: 682-626-9224, 972-474-1424"
echo "   - Assistants: Should now appear in Agents page"
echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo "   - VAPI_SYNC_SYSTEM.md - Complete sync system guide"
echo "   - backend/src/services/vapiSync.js - Sync service code"
echo "   - frontend/src/pages/VapiSync.jsx - Sync UI"
echo ""
echo -e "${BLUE}🔧 API Endpoints:${NC}"
echo "   - GET  /api/vapi-sync/status"
echo "   - POST /api/vapi-sync/full"
echo "   - POST /api/vapi-sync/phone-numbers/from-vapi"
echo "   - POST /api/vapi-sync/assistants/from-vapi"
echo ""
echo -e "${YELLOW}⚠️  Important:${NC}"
echo "   Make sure VAPI_PRIVATE_KEY and VAPI_PUBLIC_KEY are set in Fly.io secrets"
echo ""
echo -e "${GREEN}🎉 Your Vapi data can now be synced with a single click!${NC}"
echo ""
