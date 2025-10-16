#!/bin/bash

# Create Agent and Assign Phone Number Script
# This script creates a test agent and assigns your Twilio phone number to it

echo "🤖 Creating Test Agent..."

# Get your auth token (you need to login first)
echo "Please login to get your token:"
echo "Go to: https://globalvoice-nexus.netlify.app"
echo ""
read -p "Enter your JWT token (from browser localStorage): " TOKEN

# Create the agent
AGENT_RESPONSE=$(curl -s -X POST https://globalvoice-backend.fly.dev/api/agents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Test Support Agent",
    "description": "AI-powered customer support agent for testing",
    "greeting": "Hello! Thank you for calling. How can I help you today?",
    "language": "en",
    "voice": "Polly.Joanna",
    "personality": "friendly and professional",
    "intents": [],
    "workflows": [],
    "enableVoiceCloning": false
  }')

echo "Agent Response: $AGENT_RESPONSE"

# Extract agent ID
AGENT_ID=$(echo $AGENT_RESPONSE | grep -o '"id":[0-9]*' | grep -o '[0-9]*')

if [ -z "$AGENT_ID" ]; then
  echo "❌ Failed to create agent"
  echo "Response: $AGENT_RESPONSE"
  exit 1
fi

echo "✅ Agent created with ID: $AGENT_ID"

# Assign phone number
echo "📞 Assigning phone number +18175417385 to agent..."

PHONE_RESPONSE=$(curl -s -X POST "https://globalvoice-backend.fly.dev/api/agents/$AGENT_ID/phone-number" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "phoneNumber": "+18175417385"
  }')

echo "Phone Assignment Response: $PHONE_RESPONSE"

echo ""
echo "✅ Setup complete!"
echo "📞 You can now call: +1 (817) 541-7385"
echo "🎯 Agent ID: $AGENT_ID"
