#!/bin/bash

# Quick frontend deployment script
# Usage: ./deploy-frontend.sh

echo "🚀 Deploying GlobalVoice Nexus Frontend to Netlify..."
echo ""

cd frontend

echo "📦 Building frontend..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "🌐 Deploying to Netlify..."
    netlify deploy --prod --dir=dist --site=c383006e-9a13-4aba-a9d6-7c71fc1b1740
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Deployment successful!"
        echo "🔗 URL: https://globalvoice-nexus.netlify.app"
    else
        echo ""
        echo "❌ Deployment failed!"
        exit 1
    fi
else
    echo ""
    echo "❌ Build failed!"
    exit 1
fi
