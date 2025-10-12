# 🔑 API Keys - Complete How-To Guide

## Overview

GlobalVoice Nexus requires API keys from external services to function. This guide shows you exactly how to get each key.

---

## 1. OpenAI API Key ⭐ **REQUIRED**

**What it's for:** Powers the AI conversations and natural language understanding

**Cost:** ~$0.01-0.03 per call (pay-as-you-go)

### Step-by-Step:

1. **Create Account**
   - Go to: https://platform.openai.com/signup
   - Sign up with email or Google/Microsoft account
   - Verify your email

2. **Add Payment Method**
   - Go to: https://platform.openai.com/account/billing
   - Click "Add payment method"
   - Add credit card (required even for free tier)
   - Add $5-10 to start

3. **Create API Key**
   - Go to: https://platform.openai.com/api-keys
   - Click "Create new secret key"
   - Give it a name: "GlobalVoice Nexus"
   - Click "Create secret key"
   - **COPY THE KEY NOW** (starts with `sk-proj-...`)
   - You won't be able to see it again!

4. **Add to .env**
   ```env
   OPENAI_API_KEY=sk-proj-your-actual-key-here
   OPENAI_MODEL=gpt-4o
   ```

### Testing:
```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"
```

If it works, you'll see a list of models.

---

## 2. Twilio Credentials 📞 **OPTIONAL** (for phone calls)

**What it's for:** Enables actual phone calls (inbound/outbound)

**Cost:** $15 free trial credit, then ~$0.01/minute

### Step-by-Step:

1. **Create Account**
   - Go to: https://www.twilio.com/try-twilio
   - Sign up (email verification required)
   - Complete phone verification

2. **Get Account Credentials**
   - Go to: https://console.twilio.com/
   - On the main dashboard, you'll see:
     - **Account SID** (starts with `AC...`)
     - **Auth Token** (click to reveal)
   - Copy both

3. **Get a Phone Number**
   - In Twilio Console, go to: Phone Numbers → Manage → Buy a number
   - Search for a number in your country
   - Click "Buy" (uses trial credit)
   - Copy the phone number (format: +1234567890)

4. **Add to .env**
   ```env
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_32_character_auth_token
   TWILIO_PHONE_NUMBER=+1234567890
   ```

5. **Configure Webhooks** (after app is running)
   - Go to: Phone Numbers → Manage → Active numbers
   - Click your number
   - Under "Voice Configuration":
     - **A CALL COMES IN**: Webhook
     - **URL**: `http://your-server.com/api/webhooks/twilio/voice`
     - **HTTP**: POST
   - Click "Save"

### Testing:
```bash
curl -X GET "https://api.twilio.com/2010-04-01/Accounts/$TWILIO_ACCOUNT_SID/IncomingPhoneNumbers.json" \
  -u "$TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN"
```

---

## 3. ElevenLabs API Key 🎙️ **OPTIONAL** (for better voices)

**What it's for:** High-quality, natural-sounding text-to-speech

**Cost:** Free tier: 10,000 characters/month

### Step-by-Step:

1. **Create Account**
   - Go to: https://elevenlabs.io/
   - Click "Get Started Free"
   - Sign up with email or Google

2. **Get API Key**
   - Go to: https://elevenlabs.io/app/settings
   - Click "API Keys" tab
   - Click "Create API Key"
   - Copy the key

3. **Add to .env**
   ```env
   ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
   ```

**Note:** If you don't add this, the system will use Twilio's built-in voices (which work fine!)

---

## 4. Anthropic Claude API Key 🤖 **OPTIONAL** (for advanced sentiment)

**What it's for:** Enhanced sentiment analysis and empathetic responses

**Cost:** Pay-as-you-go

### Step-by-Step:

1. **Request Access**
   - Go to: https://www.anthropic.com/
   - Click "Get API Access"
   - Fill out the form
   - Wait for approval (usually 1-2 days)

2. **Get API Key**
   - Once approved, go to: https://console.anthropic.com/
   - Navigate to API Keys
   - Create new key
   - Copy the key (starts with `sk-ant-...`)

3. **Add to .env**
   ```env
   ANTHROPIC_API_KEY=sk-ant-your-key-here
   ```

**Note:** If not provided, system falls back to OpenAI for all tasks.

---

## 5. Pinecone API Key 🗄️ **OPTIONAL** (for vector search)

**What it's for:** Advanced semantic search and knowledge base

**Cost:** Free tier available

### Step-by-Step:

1. **Create Account**
   - Go to: https://www.pinecone.io/
   - Click "Sign Up Free"
   - Create account

2. **Get API Key**
   - Go to: https://app.pinecone.io/
   - Click "API Keys" in sidebar
   - Copy your API key
   - Note your environment (e.g., `us-west1-gcp`)

3. **Add to .env**
   ```env
   PINECONE_API_KEY=your-pinecone-api-key
   PINECONE_ENVIRONMENT=us-west1-gcp
   ```

**Note:** Not required for basic functionality.

---

## Security Configuration 🔒

Generate secure random strings for these:

### JWT Secret
```bash
# Generate a random 32-character string
openssl rand -base64 32
```

Add to .env:
```env
JWT_SECRET=your-generated-random-string-here
```

### Encryption Key
```bash
# Generate another random string
openssl rand -base64 32
```

Add to .env:
```env
ENCRYPTION_KEY=your-generated-encryption-key-here
```

---

## Complete .env Template

Here's what your `.env` should look like with all keys:

```env
# ===== REQUIRED =====

# OpenAI (MUST HAVE)
OPENAI_API_KEY=sk-proj-your-key-here
OPENAI_MODEL=gpt-4o

# Security (generate with: openssl rand -base64 32)
JWT_SECRET=your-random-32-char-string
ENCRYPTION_KEY=your-random-32-char-string

# Database (default for local development)
DATABASE_URL=postgresql://postgres:password@localhost:5432/globalvoice
REDIS_URL=redis://localhost:6379

# Application
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:3001
NLP_ENGINE_URL=http://localhost:8001

# ===== OPTIONAL (for phone calls) =====

# Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# ===== OPTIONAL (enhanced features) =====

# ElevenLabs (better voices)
ELEVENLABS_API_KEY=your_elevenlabs_key

# Anthropic Claude (better sentiment)
ANTHROPIC_API_KEY=sk-ant-your-key

# Pinecone (vector search)
PINECONE_API_KEY=your_pinecone_key
PINECONE_ENVIRONMENT=us-west1-gcp
```

---

## Testing Your Keys

### Test OpenAI
```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### Test Twilio
```bash
curl -X GET "https://api.twilio.com/2010-04-01/Accounts/$TWILIO_ACCOUNT_SID.json" \
  -u "$TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN"
```

### Test in Application
1. Start the app: `./start-dev.sh`
2. Go to: http://localhost:3001/health
3. Should return: `{"status":"healthy"}`

---

## Cost Breakdown

### Free Tier (Testing)
- **OpenAI**: $5 free credit = ~250 test calls
- **Twilio**: $15 free credit = ~1,500 minutes
- **ElevenLabs**: 10,000 characters/month free
- **Total**: Enough for extensive testing

### Production (per 1,000 calls)
- **OpenAI GPT-4o**: ~$20
- **Twilio**: ~$10 (10 min avg)
- **ElevenLabs**: ~$3
- **Total**: ~$33 per 1,000 calls

---

## Security Best Practices

1. **Never commit .env** - Already in .gitignore
2. **Rotate keys every 90 days**
3. **Use separate keys for dev/prod**
4. **Set spending limits** in each provider's dashboard
5. **Enable 2FA** on all accounts
6. **Monitor usage** regularly

---

## Troubleshooting

### "Invalid API key"
- Check for extra spaces in .env
- Make sure key is complete (not truncated)
- Verify key is active in provider dashboard

### "Insufficient credits"
- Check billing: https://platform.openai.com/account/billing
- Add payment method
- Add credits

### "Rate limit exceeded"
- You're making too many requests
- Upgrade your plan
- Add delays between requests

---

## Getting Help

### OpenAI Support
- Docs: https://platform.openai.com/docs
- Community: https://community.openai.com/

### Twilio Support
- Docs: https://www.twilio.com/docs
- Support: https://support.twilio.com/

### Application Issues
- Check logs: `tail -f logs/*.log`
- See SETUP_GUIDE.md for troubleshooting
- GitHub Issues: [your-repo]/issues

---

## Quick Reference

| Service | Required? | Free Tier | Signup Link |
|---------|-----------|-----------|-------------|
| OpenAI | ✅ Yes | $5 credit | https://platform.openai.com/signup |
| Twilio | ⚠️ For calls | $15 credit | https://www.twilio.com/try-twilio |
| ElevenLabs | ❌ Optional | 10k chars | https://elevenlabs.io/ |
| Anthropic | ❌ Optional | No | https://www.anthropic.com/ |
| Pinecone | ❌ Optional | Yes | https://www.pinecone.io/ |

---

**Ready to get your keys? Start with OpenAI - it's the only one you need to begin! 🚀**
