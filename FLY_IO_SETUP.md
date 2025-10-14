# 🚀 Fly.io World-Class Infrastructure Setup

## Overview

This guide will help you deploy GlobalVoice Nexus to a world-class, multi-region infrastructure using Fly.io and best-in-class services.

---

## 📋 Prerequisites

1. **Fly.io Account** - Sign up at https://fly.io
2. **Fly.io CLI** - Already installed ✅
3. **GitHub Account** - For CI/CD
4. **Payment Method** - For production services

---

## 🔧 Step 1: Fly.io Setup

### 1.1 Login to Fly.io

```bash
/Users/dduncan/.fly/bin/flyctl auth login
```

This will open a browser for authentication.

### 1.2 Create Fly.io App

```bash
cd /Users/dduncan/CascadeProjects/windsurf-project/backend
/Users/dduncan/.fly/bin/flyctl apps create globalvoice-backend
```

### 1.3 Set Environment Secrets

```bash
# Database
/Users/dduncan/.fly/bin/flyctl secrets set \
  DATABASE_URL="postgresql://postgres:U1rw29AqFQPvJLse@db.hzxubnyehbrsqmzciixf.supabase.co:5432/postgres"

# JWT & Encryption
/Users/dduncan/.fly/bin/flyctl secrets set \
  JWT_SECRET="globalvoice-jwt-secret-xdun1698-production-key" \
  ENCRYPTION_KEY="globalvoice-encryption-xdun1698-prod-key"

# Frontend URL
/Users/dduncan/.fly/bin/flyctl secrets set \
  FRONTEND_URL="https://globalvoice-nexus.netlify.app"

# Twilio (when ready)
/Users/dduncan/.fly/bin/flyctl secrets set \
  TWILIO_ACCOUNT_SID="your_twilio_sid" \
  TWILIO_AUTH_TOKEN="your_twilio_token" \
  TWILIO_PHONE_NUMBER="your_twilio_number"

# OpenAI (when ready)
/Users/dduncan/.fly/bin/flyctl secrets set \
  OPENAI_API_KEY="your_openai_key"
```

---

## 🌍 Step 2: Multi-Region Deployment

### 2.1 Deploy to Primary Region (US East)

```bash
cd /Users/dduncan/CascadeProjects/windsurf-project/backend
/Users/dduncan/.fly/bin/flyctl deploy
```

### 2.2 Add Secondary Regions (After Initial Deploy)

```bash
# Europe (London)
/Users/dduncan/.fly/bin/flyctl scale count 1 --region lhr

# Asia (Singapore)
/Users/dduncan/.fly/bin/flyctl scale count 1 --region sin

# US West (San Jose)
/Users/dduncan/.fly/bin/flyctl scale count 1 --region sjc
```

### 2.3 Verify Deployment

```bash
/Users/dduncan/.fly/bin/flyctl status
/Users/dduncan/.fly/bin/flyctl logs
```

---

## 🔴 Step 3: Upstash Redis Setup

### 3.1 Create Upstash Account
- Go to https://upstash.com
- Sign up (free tier available)
- Create a new Redis database
- Select "Global" for multi-region replication

### 3.2 Get Redis URL
- Copy the connection URL from Upstash dashboard
- Format: `redis://default:password@endpoint.upstash.io:port`

### 3.3 Add to Fly.io

```bash
/Users/dduncan/.fly/bin/flyctl secrets set \
  REDIS_URL="your_upstash_redis_url"
```

---

## 🎤 Step 4: Deepgram Setup (Speech-to-Text)

### 4.1 Create Deepgram Account
- Go to https://deepgram.com
- Sign up for account
- Get API key from dashboard

### 4.2 Add to Fly.io

```bash
/Users/dduncan/.fly/bin/flyctl secrets set \
  DEEPGRAM_API_KEY="your_deepgram_key"
```

### 4.3 Update Backend Code
The Deepgram integration is already in the codebase at:
- `backend/src/services/stt.js`

---

## 🗣️ Step 5: ElevenLabs + Play.ht Setup (Text-to-Speech)

### 5.1 ElevenLabs Setup
- Go to https://elevenlabs.io
- Sign up for account
- Get API key

```bash
/Users/dduncan/.fly/bin/flyctl secrets set \
  ELEVENLABS_API_KEY="your_elevenlabs_key"
```

### 5.2 Play.ht Setup
- Go to https://play.ht
- Sign up for account
- Get API key and User ID

```bash
/Users/dduncan/.fly/bin/flyctl secrets set \
  PLAYHT_API_KEY="your_playht_key" \
  PLAYHT_USER_ID="your_playht_user_id"
```

---

## 🐛 Step 6: Sentry Setup (Error Tracking)

### 6.1 Create Sentry Account
- Go to https://sentry.io
- Sign up (free tier available)
- Create new project (Node.js)

### 6.2 Get DSN
- Copy the DSN from project settings

### 6.3 Add to Fly.io

```bash
/Users/dduncan/.fly/bin/flyctl secrets set \
  SENTRY_DSN="your_sentry_dsn"
```

### 6.4 Install Sentry in Backend

```bash
cd /Users/dduncan/CascadeProjects/windsurf-project/backend
npm install @sentry/node @sentry/tracing
```

---

## 📊 Step 7: Axiom Setup (Logging)

### 7.1 Create Axiom Account
- Go to https://axiom.co
- Sign up (free tier: 500MB/month)
- Create new dataset: "globalvoice-logs"

### 7.2 Get API Token
- Go to Settings → API Tokens
- Create new token

### 7.3 Add to Fly.io

```bash
/Users/dduncan/.fly/bin/flyctl secrets set \
  AXIOM_TOKEN="your_axiom_token" \
  AXIOM_DATASET="globalvoice-logs"
```

---

## 🔍 Step 8: Pinecone Setup (Vector Database)

### 8.1 Create Pinecone Account
- Go to https://pinecone.io
- Sign up
- Create new index: "globalvoice-conversations"
- Dimensions: 1536 (for OpenAI embeddings)
- Metric: cosine

### 8.2 Get API Key

```bash
/Users/dduncan/.fly/bin/flyctl secrets set \
  PINECONE_API_KEY="your_pinecone_key" \
  PINECONE_ENVIRONMENT="your_pinecone_env" \
  PINECONE_INDEX="globalvoice-conversations"
```

---

## ☁️ Step 9: Cloudflare R2 Setup (Storage)

### 9.1 Create Cloudflare Account
- Go to https://cloudflare.com
- Sign up
- Go to R2 section
- Create bucket: "globalvoice-recordings"

### 9.2 Get API Credentials

```bash
/Users/dduncan/.fly/bin/flyctl secrets set \
  R2_ACCOUNT_ID="your_account_id" \
  R2_ACCESS_KEY_ID="your_access_key" \
  R2_SECRET_ACCESS_KEY="your_secret_key" \
  R2_BUCKET_NAME="globalvoice-recordings"
```

---

## 🔄 Step 10: Update Frontend

### 10.1 Update Netlify Environment Variables

Go to Netlify dashboard and add:

```
VITE_BACKEND_URL=https://globalvoice-backend.fly.dev
VITE_WS_URL=wss://globalvoice-backend.fly.dev
```

### 10.2 Redeploy Frontend

```bash
cd /Users/dduncan/CascadeProjects/windsurf-project
git add .
git commit -m "Update backend URL to Fly.io"
git push
```

Netlify will auto-deploy.

---

## 🧪 Step 11: Test Deployment

### 11.1 Check Health Endpoint

```bash
curl https://globalvoice-backend.fly.dev/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-14T...",
  "uptime": 123.45,
  "environment": "production"
}
```

### 11.2 Test Login

```bash
curl -X POST https://globalvoice-backend.fly.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@globalvoice.com","password":"TestPass123!"}'
```

### 11.3 Test from Frontend

Go to https://globalvoice-nexus.netlify.app/login and login with:
- Email: `test@globalvoice.com`
- Password: `TestPass123!`

---

## 📊 Step 12: Monitoring Setup

### 12.1 View Fly.io Metrics

```bash
/Users/dduncan/.fly/bin/flyctl dashboard
```

### 12.2 View Logs

```bash
# Real-time logs
/Users/dduncan/.fly/bin/flyctl logs

# Specific app logs
/Users/dduncan/.fly/bin/flyctl logs -a globalvoice-backend
```

### 12.3 Check Sentry Dashboard
- Go to https://sentry.io
- View errors and performance

### 12.4 Check Axiom Dashboard
- Go to https://axiom.co
- View logs and analytics

---

## 🚀 Step 13: CI/CD Setup (GitHub Actions)

This will be set up automatically with the GitHub Actions workflow file.

---

## 💰 Cost Breakdown

### Monthly Costs (Estimated):

**Fly.io:**
- 2 shared CPUs, 2GB RAM: $20-40/month
- Multi-region (3 regions): $60-120/month

**Upstash Redis:**
- Starter: $10/month (10GB)

**Deepgram:**
- Pay as you go: ~$0.0125/min
- 1000 mins/month: $12.50

**ElevenLabs:**
- Creator: $22/month (30k characters)
- Pro: $99/month (100k characters)

**Play.ht:**
- Basic: $31/month (12.5k words)
- Pro: $99/month (50k words)

**Sentry:**
- Free tier: $0 (5k errors/month)
- Team: $26/month (50k errors)

**Axiom:**
- Free tier: $0 (500MB/month)
- Pro: $25/month (10GB)

**Pinecone:**
- Starter: $70/month (1 pod)

**Cloudflare R2:**
- Storage: $0.015/GB/month
- Operations: $0.36/million requests

**Total (Startup):** ~$250-350/month
**Total (Growth):** ~$500-800/month

---

## 🎯 Next Steps

After completing this setup:

1. ✅ Test all endpoints
2. ✅ Verify multi-region deployment
3. ✅ Set up monitoring dashboards
4. ✅ Configure alerts
5. ✅ Run load tests
6. ✅ Document API
7. ✅ Set up staging environment

---

## 🆘 Troubleshooting

### Deployment Fails

```bash
# Check logs
/Users/dduncan/.fly/bin/flyctl logs

# Check status
/Users/dduncan/.fly/bin/flyctl status

# Restart app
/Users/dduncan/.fly/bin/flyctl apps restart globalvoice-backend
```

### Health Check Fails

- Verify PORT environment variable is set to 8080
- Check database connection
- Verify all secrets are set

### CORS Issues

- Verify FRONTEND_URL is set correctly
- Check CORS configuration in backend/src/index.js

---

## 📞 Support

- Fly.io Docs: https://fly.io/docs
- Fly.io Community: https://community.fly.io
- GitHub Issues: Create issue in repository

---

**Ready to deploy world-class infrastructure! 🚀**
