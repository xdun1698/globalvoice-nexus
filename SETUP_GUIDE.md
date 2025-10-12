# Complete Setup Guide - GlobalVoice Nexus

## 📋 Prerequisites

Before starting, ensure you have:

- **Node.js** 18+ installed ([Download](https://nodejs.org/))
- **Python** 3.11+ installed ([Download](https://www.python.org/))
- **Docker Desktop** installed ([Download](https://www.docker.com/products/docker-desktop/))
- **Git** installed
- A code editor (VS Code recommended)

## 🔑 Required API Keys

You'll need to sign up for these services and obtain API keys:

### 1. OpenAI (Required for AI conversations)
- **Website**: https://platform.openai.com/
- **Sign up**: Create an account
- **Get API Key**: 
  1. Go to https://platform.openai.com/api-keys
  2. Click "Create new secret key"
  3. Copy the key (starts with `sk-`)
  4. **Cost**: Pay-as-you-go, ~$0.01-0.03 per call
- **Free Alternative**: Use GPT-3.5-turbo (cheaper) or mock responses for testing

### 2. Twilio (Required for phone calls)
- **Website**: https://www.twilio.com/
- **Sign up**: Create a free trial account
- **Get Credentials**:
  1. Go to https://console.twilio.com/
  2. Find your **Account SID** and **Auth Token** on dashboard
  3. Get a phone number: Phone Numbers → Buy a Number
  4. **Free Trial**: $15 credit, enough for testing
- **Alternative**: Skip for now, test without phone features

### 3. ElevenLabs (Optional - for voice synthesis)
- **Website**: https://elevenlabs.io/
- **Sign up**: Create account
- **Get API Key**: Settings → API Keys
- **Free Tier**: 10,000 characters/month
- **Alternative**: Use Twilio's built-in voices (no key needed)

### 4. Anthropic Claude (Optional - for advanced sentiment)
- **Website**: https://www.anthropic.com/
- **Sign up**: Request API access
- **Get API Key**: Console → API Keys
- **Alternative**: System will fallback to OpenAI

### 5. Pinecone (Optional - for vector search)
- **Website**: https://www.pinecone.io/
- **Sign up**: Create free account
- **Get API Key**: API Keys section
- **Free Tier**: Available
- **Alternative**: Not required for basic functionality

## 🚀 Quick Start (5 Minutes)

### Step 1: Clone and Setup Environment

```bash
# Navigate to project
cd /Users/dduncan/CascadeProjects/windsurf-project

# Copy environment file
cp .env.example .env

# Open .env in your editor
code .env  # or nano .env
```

### Step 2: Configure .env File

Edit `.env` and add your API keys:

```env
# === REQUIRED FOR BASIC FUNCTIONALITY ===

# OpenAI API Key (REQUIRED)
OPENAI_API_KEY=sk-proj-your-actual-key-here
OPENAI_MODEL=gpt-4o

# Database (uses Docker, no setup needed)
DATABASE_URL=postgresql://postgres:password@localhost:5432/globalvoice
REDIS_URL=redis://localhost:6379

# Security (generate random strings)
JWT_SECRET=your-random-secret-minimum-32-characters-long
ENCRYPTION_KEY=another-random-32-byte-key-for-encryption

# Application URLs (keep as-is for local development)
NODE_ENV=development
PORT=3000
BACKEND_PORT=3001
NLP_ENGINE_PORT=8001
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:3001
NLP_ENGINE_URL=http://localhost:8001

# === REQUIRED FOR PHONE CALLS ===

# Twilio Credentials (get from https://console.twilio.com/)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890

# === OPTIONAL (can skip for initial testing) ===

# Anthropic Claude (optional, falls back to OpenAI)
ANTHROPIC_API_KEY=sk-ant-your-key-here

# ElevenLabs Voice (optional, uses Twilio voices if not set)
ELEVENLABS_API_KEY=your_elevenlabs_key_here

# Pinecone Vector DB (optional, not required for basic features)
PINECONE_API_KEY=your_pinecone_key_here
PINECONE_ENVIRONMENT=us-west1-gcp

# CRM Integrations (optional, for future use)
SALESFORCE_CLIENT_ID=
SALESFORCE_CLIENT_SECRET=
HUBSPOT_API_KEY=
```

### Step 3: Start with Docker (Easiest Method)

```bash
# Start all services
docker-compose up -d

# Wait 30 seconds for services to start, then check status
docker-compose ps

# View logs if needed
docker-compose logs -f
```

**Expected Output:**
```
NAME                    STATUS          PORTS
globalvoice-postgres    Up             0.0.0.0:5432->5432/tcp
globalvoice-redis       Up             0.0.0.0:6379->6379/tcp
globalvoice-nlp         Up             0.0.0.0:8001->8001/tcp
globalvoice-backend     Up             0.0.0.0:3001->3001/tcp
globalvoice-frontend    Up             0.0.0.0:3000->3000/tcp
```

### Step 4: Access the Application

Open your browser and go to:

**🌐 http://localhost:3000**

You should see the login page!

## 📱 Testing Without API Keys

If you want to test the UI without API keys:

1. **Skip Twilio**: You can explore the dashboard, create agents, view analytics
2. **Use Mock Data**: The frontend has sample data for demonstration
3. **Add Keys Later**: Add API keys when you're ready to test calls

## 🔧 Manual Setup (Alternative to Docker)

If Docker doesn't work, run services manually:

### Terminal 1 - Database & Cache
```bash
# Start PostgreSQL and Redis only
docker-compose up -d postgres redis

# Or install locally:
# PostgreSQL: brew install postgresql (Mac)
# Redis: brew install redis (Mac)
```

### Terminal 2 - Backend API
```bash
cd backend
npm install

# Run database migrations
npm run migrate

# Start backend
npm run dev
```

Expected output: `🚀 GlobalVoice Nexus Backend running on port 3001`

### Terminal 3 - NLP Engine
```bash
cd nlp-engine
pip install -r requirements.txt

# Start NLP engine
python -m uvicorn main:app --reload --port 8001
```

Expected output: `Uvicorn running on http://0.0.0.0:8001`

### Terminal 4 - Frontend
```bash
cd frontend
npm install

# Copy frontend env
cp .env.example .env

# Start frontend
npm run dev
```

Expected output: `Local: http://localhost:3000`

## ✅ Verification Checklist

Test each service:

### 1. Backend Health Check
```bash
curl http://localhost:3001/health
```
Expected: `{"status":"healthy",...}`

### 2. NLP Engine Health Check
```bash
curl http://localhost:8001/health
```
Expected: `{"status":"healthy",...}`

### 3. Frontend
Open browser: http://localhost:3000
Expected: Login page loads

### 4. Create Test Account
1. Go to http://localhost:3000
2. Click "Sign up"
3. Enter: Name, Email, Password
4. Click "Create Account"
5. You should be redirected to dashboard

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Find what's using the port
lsof -i :3000  # Frontend
lsof -i :3001  # Backend
lsof -i :8001  # NLP Engine

# Kill the process
kill -9 <PID>
```

### Docker Issues

```bash
# Stop all containers
docker-compose down

# Remove volumes and restart fresh
docker-compose down -v
docker-compose up -d --build

# View logs for specific service
docker-compose logs backend
docker-compose logs nlp-engine
```

### Database Connection Failed

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Restart PostgreSQL
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

### Python Dependencies Error

```bash
# Create virtual environment
cd nlp-engine
python -m venv venv
source venv/bin/activate  # Mac/Linux
# or
venv\Scripts\activate  # Windows

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

### Frontend Won't Start

```bash
cd frontend

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Try again
npm run dev
```

### API Key Errors

If you see errors about missing API keys:

1. **OpenAI Error**: Check `OPENAI_API_KEY` in `.env`
2. **Twilio Error**: Add `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN`
3. **Restart Services**: After adding keys, restart:
   ```bash
   docker-compose restart
   ```

## 🎯 Next Steps

Once running:

1. **Create Your First Agent**
   - Go to "Agents" → "Create Agent"
   - Name it "Test Agent"
   - Set language and personality
   - Click "Create"

2. **Test Without Phone Calls**
   - Explore the dashboard
   - View analytics (sample data)
   - Create contacts
   - Build agent workflows

3. **Enable Phone Calls** (when ready)
   - Add Twilio credentials to `.env`
   - Restart services
   - Configure webhook URLs in Twilio console
   - Make test call

## 📞 Getting Help

### Check Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f nlp-engine
```

### Common Error Messages

**"Database connection failed"**
- Solution: Make sure PostgreSQL is running: `docker-compose up -d postgres`

**"Redis connection error"**
- Solution: Start Redis: `docker-compose up -d redis`

**"OpenAI API error"**
- Solution: Check your API key is valid and has credits

**"Port 3000 already in use"**
- Solution: Stop other services using that port or change port in `.env`

## 💰 Cost Estimation

### Free Tier (Testing)
- **OpenAI**: $5 free credit (100-500 test calls)
- **Twilio**: $15 free credit (~150 minutes)
- **Total**: Can test extensively for free

### Production (Monthly)
- **OpenAI GPT-4o**: ~$0.02 per call = $200 for 10,000 calls
- **Twilio**: ~$0.01/min = $100 for 10,000 minutes
- **Hosting**: $50-200 (AWS/GCP)
- **Total**: ~$350-500/month for 10,000 calls

## 🔒 Security Notes

1. **Never commit .env file** - Already in .gitignore
2. **Rotate API keys regularly** - Every 90 days
3. **Use environment variables** - Never hardcode keys
4. **Enable 2FA** - On all API provider accounts
5. **Monitor usage** - Set billing alerts

## 📚 Additional Resources

- **OpenAI Docs**: https://platform.openai.com/docs
- **Twilio Docs**: https://www.twilio.com/docs
- **Project README**: See README.md for architecture
- **API Docs**: See API_DOCUMENTATION.md
- **Deployment**: See DEPLOYMENT.md for production

---

**Need Help?** Open an issue or contact support@globalvoice-nexus.com
