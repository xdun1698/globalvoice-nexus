#!/bin/bash

echo "🚀 GlobalVoice Nexus - GitHub Setup"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if git is initialized
if [ ! -d .git ]; then
    echo -e "${YELLOW}Initializing Git repository...${NC}"
    git init
    git branch -m main
    git add .
    git commit -m "Initial commit: GlobalVoice Nexus"
fi

echo -e "${BLUE}Step 1: Create GitHub Repository${NC}"
echo "=================================="
echo ""
echo "Go to: https://github.com/new"
echo ""
echo "Fill in:"
echo "  - Repository name: globalvoice-nexus"
echo "  - Description: AI Call Agent Platform with Multilingual NLP"
echo "  - Visibility: Private (recommended)"
echo "  - DO NOT initialize with README"
echo ""
echo "Then click 'Create repository'"
echo ""
read -p "Press Enter when you've created the repository..."

echo ""
echo -e "${BLUE}Step 2: Enter Your GitHub Username${NC}"
echo "===================================="
echo ""
read -p "Your GitHub username: " GITHUB_USERNAME

if [ -z "$GITHUB_USERNAME" ]; then
    echo -e "${YELLOW}Username cannot be empty!${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}Step 3: Pushing to GitHub${NC}"
echo "========================="
echo ""

# Remove existing remote if it exists
git remote remove origin 2>/dev/null

# Add new remote
REPO_URL="https://github.com/$GITHUB_USERNAME/globalvoice-nexus.git"
echo "Adding remote: $REPO_URL"
git remote add origin $REPO_URL

# Push to GitHub
echo ""
echo "Pushing code to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Success! Code pushed to GitHub${NC}"
    echo ""
    echo "Your repository: https://github.com/$GITHUB_USERNAME/globalvoice-nexus"
    echo ""
    echo -e "${BLUE}Next Steps:${NC}"
    echo "==========="
    echo ""
    echo "1. Setup Supabase Database"
    echo "   → Go to: https://supabase.com/dashboard"
    echo "   → Create new project: globalvoice-nexus"
    echo "   → Copy connection string"
    echo ""
    echo "2. Deploy Backend to Render"
    echo "   → Go to: https://dashboard.render.com"
    echo "   → Click 'New +' → 'Blueprint'"
    echo "   → Connect your GitHub repository"
    echo "   → Add environment variables"
    echo ""
    echo "3. Deploy Frontend to Netlify"
    echo "   → Go to: https://app.netlify.com"
    echo "   → Click 'Add new site' → 'Import from Git'"
    echo "   → Select your repository"
    echo "   → Netlify will auto-detect settings!"
    echo ""
    echo "📖 Full instructions: Read AUTO_DEPLOY_GUIDE.md"
    echo ""
else
    echo ""
    echo -e "${YELLOW}⚠️  Push failed. This might be because:${NC}"
    echo "  1. Repository doesn't exist yet"
    echo "  2. Wrong username"
    echo "  3. Need to authenticate with GitHub"
    echo ""
    echo "Try running:"
    echo "  git push -u origin main"
    echo ""
    echo "If you need to authenticate, GitHub will prompt you."
fi
