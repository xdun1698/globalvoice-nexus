# 🏢 GlobalVoice Nexus - Enterprise Setup Guide

## Overview

GlobalVoice Nexus is an **enterprise-grade AI-powered multilingual call center platform** designed for scalability, reliability, and intelligent customer interactions.

---

## ✅ Current Status

### Infrastructure
- ✅ **Backend**: Deployed on Fly.io (https://globalvoice-backend.fly.dev)
- ✅ **Frontend**: Deployed on Netlify (https://globalvoice-nexus.netlify.app)
- ✅ **Database**: PostgreSQL on Supabase
- ✅ **Telephony**: Twilio integration configured
- ✅ **AI**: OpenAI GPT-4o integration with fallback
- ✅ **Trust Proxy**: Configured for Fly.io
- ✅ **Rate Limiting**: Enterprise-grade protection

### Features Implemented
- ✅ Multi-language support (100+ languages)
- ✅ Real-time call handling
- ✅ AI-powered responses with personality customization
- ✅ Call recording and transcription
- ✅ Agent management API
- ✅ Phone number assignment
- ✅ WebSocket for real-time updates
- ✅ Comprehensive error handling
- ✅ Health monitoring

---

## 🚀 Quick Start - Create Your First Agent

### Option 1: Interactive CLI (Recommended)

```bash
cd /Users/dduncan/CascadeProjects/windsurf-project
node admin-cli.js setup
```

This will guide you through:
1. Creating your account
2. Setting up your first agent
3. Assigning your Twilio phone number
4. Testing the system

### Option 2: Manual Setup via Dashboard

1. **Go to**: https://globalvoice-nexus.netlify.app
2. **Register** your account
3. **Create Agent**:
   - Navigate to Agents page
   - Click "Create New Agent"
   - Fill in details
4. **Assign Phone Number**:
   - Use the API or wait for UI implementation

---

## 🏗️ Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     CUSTOMER CALLS                           │
│                   +1 (817) 541-7385                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    TWILIO (Telephony)                        │
│  - Speech Recognition                                        │
│  - Text-to-Speech                                           │
│  - Call Recording                                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              BACKEND API (Fly.io)                           │
│  - Express.js + Node.js                                     │
│  - Multi-region deployment                                  │
│  - Auto-scaling                                             │
│  - Health checks                                            │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
        ┌──────────────────┐  ┌──────────────────┐
        │   AI ENGINE      │  │   DATABASE       │
        │   (OpenAI)       │  │   (Supabase)     │
        │                  │  │                  │
        │ - GPT-4o-mini    │  │ - PostgreSQL     │
        │ - Personality    │  │ - Agents         │
        │ - Context        │  │ - Calls          │
        │ - Fallback       │  │ - Transcripts    │
        └──────────────────┘  └──────────────────┘
                    │
                    ▼
        ┌──────────────────┐
        │   FRONTEND       │
        │   (Netlify)      │
        │                  │
        │ - React SPA      │
        │ - Dashboard      │
        │ - Analytics      │
        └──────────────────┘
```

### Key Components

#### 1. **Telephony Layer** (Twilio)
- Handles inbound/outbound calls
- Speech-to-text conversion
- Text-to-speech synthesis
- Call recording
- Multi-language support

#### 2. **API Layer** (Express.js)
- RESTful API endpoints
- WebSocket for real-time updates
- Authentication & authorization
- Rate limiting
- Error handling

#### 3. **AI Layer** (OpenAI + NLP Engine)
- **Primary**: Custom NLP engine (optional)
- **Fallback**: OpenAI GPT-4o-mini
- Conversation context management
- Intent recognition
- Sentiment analysis

#### 4. **Data Layer** (PostgreSQL)
- User management
- Agent configurations
- Call logs & transcripts
- Analytics data
- Contact management

---

## 🔧 Configuration

### Required Environment Variables

```bash
# Database
DATABASE_URL=postgresql://...

# Authentication
JWT_SECRET=your-secret-key
ENCRYPTION_KEY=your-encryption-key

# Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+18175417385

# OpenAI (Required for AI responses)
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini  # or gpt-4o for better quality

# URLs
BACKEND_URL=https://globalvoice-backend.fly.dev
FRONTEND_URL=https://globalvoice-nexus.netlify.app

# Optional
REDIS_URL=redis://...  # For caching
ANTHROPIC_API_KEY=...  # For Claude integration
NLP_ENGINE_URL=...     # For custom NLP engine
```

### Setting Secrets in Fly.io

```bash
flyctl secrets set OPENAI_API_KEY="sk-..." -a globalvoice-backend
flyctl secrets set TWILIO_ACCOUNT_SID="ACxxx..." -a globalvoice-backend
flyctl secrets set TWILIO_AUTH_TOKEN="..." -a globalvoice-backend
```

---

## 📞 Agent Configuration

### Agent Properties

```javascript
{
  "name": "Customer Support Agent",
  "description": "AI-powered support for customer inquiries",
  "greeting": "Hello! Thank you for calling. How can I help you today?",
  "language": "en",
  "voice": "Polly.Joanna",
  "personality": "You are a professional and friendly customer support agent...",
  "intents": [
    {
      "name": "greeting",
      "examples": ["hello", "hi", "hey"],
      "response": "Hello! How can I assist you?"
    }
  ],
  "workflows": [],
  "enableVoiceCloning": false
}
```

### Supported Voices

**US English:**
- `Polly.Joanna` (Female)
- `Polly.Matthew` (Male)

**British English:**
- `Polly.Amy` (Female)
- `Polly.Brian` (Male)

**Spanish:**
- `Polly.Conchita` (Female, Spain)
- `Polly.Miguel` (Male, Spain)

**French:**
- `Polly.Celine` (Female)
- `Polly.Mathieu` (Male)

[See full list in code]

---

## 🔌 API Endpoints

### Authentication
```
POST /api/auth/register
POST /api/auth/login
```

### Agents
```
GET    /api/agents              # List all agents
POST   /api/agents              # Create agent
GET    /api/agents/:id          # Get agent details
PUT    /api/agents/:id          # Update agent
DELETE /api/agents/:id          # Delete agent
GET    /api/agents/:id/stats    # Get agent statistics
POST   /api/agents/:id/phone-number  # Assign phone number
GET    /api/agents/:id/phone-numbers # List phone numbers
```

### Calls
```
GET    /api/calls               # List calls
POST   /api/calls               # Make outbound call
GET    /api/calls/:id           # Get call details
GET    /api/calls/:id/transcript # Get call transcript
```

### Webhooks (Twilio)
```
POST /api/webhooks/twilio/voice     # Incoming call
POST /api/webhooks/twilio/speech    # Speech input
POST /api/webhooks/twilio/status    # Call status
POST /api/webhooks/twilio/recording # Recording callback
```

---

## 🧪 Testing Your Setup

### 1. Test Call Flow

```bash
# Call your Twilio number
+1 (817) 541-7385

# Expected flow:
# 1. Agent greets you
# 2. You speak naturally
# 3. AI responds intelligently
# 4. Conversation continues
# 5. Say "goodbye" to end
```

### 2. Check Logs

```bash
flyctl logs -a globalvoice-backend

# Look for:
# ✅ "Twilio client initialized"
# ✅ "OpenAI client initialized"
# ✅ "Incoming call from..."
# ✅ "Speech input: ..."
```

### 3. View Dashboard

```
https://globalvoice-nexus.netlify.app

# Features:
# - Call history
# - Transcripts
# - Analytics
# - Agent management
```

---

## 🎯 Enterprise Features

### 1. **Intelligent Fallback**
- Primary: Custom NLP engine
- Fallback: OpenAI GPT-4o-mini
- Graceful degradation
- No single point of failure

### 2. **Conversation Context**
- Maintains last 10 message history
- Personality-driven responses
- Intent recognition
- Sentiment analysis

### 3. **Multi-Language Support**
- Automatic language detection
- Real-time translation
- Language-specific voices
- Cultural adaptation

### 4. **Scalability**
- Auto-scaling on Fly.io
- Multi-region deployment
- Load balancing
- Health monitoring

### 5. **Security**
- JWT authentication
- Rate limiting
- CORS protection
- Encrypted secrets
- Trust proxy for Fly.io

### 6. **Monitoring**
- Health checks every 30s
- Structured logging
- Error tracking
- Performance metrics

---

## 💰 Cost Estimates (US Only POC)

### Monthly Costs

**Twilio:**
- Phone number: $1.15/month
- Inbound calls: $0.0085/minute
- Outbound calls: $0.013/minute
- **Estimate**: $5-10/month for 500 minutes

**OpenAI:**
- GPT-4o-mini: $0.150 per 1M input tokens, $0.600 per 1M output tokens
- Average call: ~1000 tokens
- **Estimate**: $2-5/month for 1000 calls

**Infrastructure:**
- Fly.io: Free tier (2 shared CPUs, 256MB RAM)
- Supabase: Free tier (500MB database)
- Netlify: Free tier
- **Estimate**: $0/month for POC

**Total POC Cost**: **$7-15/month**

### Production Costs (1000 calls/day)

- Twilio: ~$200/month
- OpenAI: ~$50/month
- Fly.io: ~$50/month (dedicated resources)
- Supabase: ~$25/month
- **Total**: **~$325/month**

---

## 🔍 Troubleshooting

### Call Fails with "Application Error"

**Check:**
1. Agent exists and is active
2. Phone number is assigned to agent
3. OpenAI API key is set
4. Backend logs for errors

```bash
flyctl logs -a globalvoice-backend | grep -i error
```

### No AI Response

**Check:**
1. OPENAI_API_KEY is set
2. API key has credits
3. Model name is correct (gpt-4o-mini)

```bash
flyctl secrets list -a globalvoice-backend
```

### Rate Limiting Errors

**Fixed!** Trust proxy is now configured for Fly.io.

### Agent Creation Fails

**Check:**
1. User is authenticated
2. All required fields provided
3. Database connection is healthy

---

## 📚 Additional Resources

### Documentation Files
- `POC_CALLING_SETUP.md` - Initial setup guide
- `WORLD_CLASS_MIGRATION.md` - Infrastructure overview
- `FLY_IO_SETUP.md` - Deployment guide
- `DEPLOYMENT_FIX.md` - Common issues and fixes

### Admin Tools
- `admin-cli.js` - Interactive agent setup
- `setup-agent.js` - Automated agent creation
- `deploy-to-flyio.sh` - Deployment automation

### Code Structure
```
backend/
├── src/
│   ├── routes/          # API endpoints
│   ├── services/        # Business logic
│   │   ├── telephony.js # Twilio integration
│   │   ├── nlp.js       # AI/NLP processing
│   │   ├── voice.js     # Voice synthesis
│   │   └── websocket.js # Real-time updates
│   ├── middleware/      # Auth, error handling
│   ├── config/          # Database, Redis
│   └── utils/           # Logger, helpers
├── migrations/          # Database schema
└── package.json         # Dependencies
```

---

## 🚀 Next Steps

### Immediate (Today)
1. ✅ Run `node admin-cli.js setup`
2. ✅ Create your first agent
3. ✅ Test by calling your number
4. ✅ Review call logs in dashboard

### Short-term (This Week)
1. Add OpenAI API key for intelligent responses
2. Customize agent personality
3. Add more intents and workflows
4. Test with different scenarios

### Medium-term (This Month)
1. Add more phone numbers
2. Create specialized agents
3. Implement call routing
4. Add analytics and reporting
5. Integrate with CRM

### Long-term (Next Quarter)
1. Multi-language expansion
2. Voice cloning for brand consistency
3. Advanced workflows and automation
4. Custom NLP engine deployment
5. Enterprise integrations

---

## 🎉 Success Criteria

Your setup is successful when:

- ✅ Backend is healthy and responding
- ✅ Twilio is initialized
- ✅ OpenAI is configured
- ✅ Agent is created
- ✅ Phone number is assigned
- ✅ Calls are answered
- ✅ AI responds intelligently
- ✅ Transcripts are saved
- ✅ Dashboard shows data

---

## 💡 Pro Tips

1. **Start Simple**: Begin with one agent, test thoroughly
2. **Monitor Costs**: Check Twilio and OpenAI usage daily
3. **Iterate Fast**: Adjust personality based on real calls
4. **Use Logs**: They're your best debugging tool
5. **Test Edge Cases**: Try different accents, languages, scenarios

---

## 📞 Support

If you encounter issues:

1. Check logs: `flyctl logs -a globalvoice-backend`
2. Verify secrets: `flyctl secrets list -a globalvoice-backend`
3. Test health: `curl https://globalvoice-backend.fly.dev/health`
4. Review documentation in this repo

---

**Built with ❤️ for enterprise-grade AI calling**
