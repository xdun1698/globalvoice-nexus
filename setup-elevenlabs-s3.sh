#!/bin/bash

# ElevenLabs + S3 Setup Script
# Professional deployment for GlobalVoice Nexus

set -e

echo "🎙️  ElevenLabs + S3 Production Setup"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if flyctl exists
if [ ! -f "/Users/dduncan/.fly/bin/flyctl" ]; then
    echo -e "${RED}❌ Fly.io CLI not found${NC}"
    exit 1
fi

FLYCTL="/Users/dduncan/.fly/bin/flyctl"

echo -e "${YELLOW}📋 This script will configure:${NC}"
echo "  1. AWS S3 bucket for audio storage"
echo "  2. ElevenLabs premium voice synthesis"
echo "  3. Production-grade error handling"
echo ""

# Check if ElevenLabs key is already set
echo -e "${YELLOW}🔍 Checking existing configuration...${NC}"
$FLYCTL secrets list -a globalvoice-backend | grep -q "ELEVENLABS_API_KEY" && \
    echo -e "${GREEN}✅ ElevenLabs API key already set${NC}" || \
    echo -e "${RED}❌ ElevenLabs API key not set${NC}"

# Prompt for AWS credentials
echo ""
echo -e "${YELLOW}📝 AWS S3 Configuration${NC}"
echo "You need:"
echo "  1. S3 bucket name (e.g., globalvoice-audio)"
echo "  2. AWS region (e.g., us-east-1)"
echo "  3. AWS Access Key ID"
echo "  4. AWS Secret Access Key"
echo ""
echo "See ELEVENLABS_S3_SETUP.md for detailed setup instructions"
echo ""

read -p "Enter S3 bucket name: " S3_BUCKET
read -p "Enter AWS region [us-east-1]: " AWS_REGION
AWS_REGION=${AWS_REGION:-us-east-1}
read -p "Enter AWS Access Key ID: " AWS_ACCESS_KEY
read -sp "Enter AWS Secret Access Key: " AWS_SECRET_KEY
echo ""

# Validate inputs
if [ -z "$S3_BUCKET" ] || [ -z "$AWS_ACCESS_KEY" ] || [ -z "$AWS_SECRET_KEY" ]; then
    echo -e "${RED}❌ Missing required AWS credentials${NC}"
    exit 1
fi

# Set secrets
echo ""
echo -e "${YELLOW}🔐 Setting Fly.io secrets...${NC}"

$FLYCTL secrets set \
    AWS_S3_BUCKET="$S3_BUCKET" \
    AWS_REGION="$AWS_REGION" \
    AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY" \
    AWS_SECRET_ACCESS_KEY="$AWS_SECRET_KEY" \
    -a globalvoice-backend

echo -e "${GREEN}✅ Secrets configured${NC}"

# Deploy
echo ""
echo -e "${YELLOW}🚀 Deploying backend...${NC}"
cd /Users/dduncan/CascadeProjects/windsurf-project/backend
$FLYCTL deploy --remote-only -a globalvoice-backend

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""

# Verify
echo -e "${YELLOW}🔍 Verifying configuration...${NC}"
sleep 5

echo ""
echo "Checking logs for confirmation..."
$FLYCTL logs -a globalvoice-backend -n | grep -E "(Voice engine|S3 Storage|ElevenLabs)" || true

echo ""
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo "📞 Test your setup:"
echo "   Call: +1 (817) 541-7385"
echo "   Expected: Natural, premium voice quality"
echo ""
echo "📊 Monitor:"
echo "   Logs: $FLYCTL logs -a globalvoice-backend"
echo "   Health: curl https://globalvoice-backend.fly.dev/health"
echo ""
echo "📚 Documentation:"
echo "   ELEVENLABS_S3_SETUP.md - Complete setup guide"
echo "   ELEVENLABS_INTEGRATION.md - Voice configuration"
echo ""
