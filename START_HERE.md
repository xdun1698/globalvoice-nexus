# 🚀 START HERE - GlobalVoice Nexus

## What You Have

A complete, production-ready **AI Call Agent Platform** with:

- ✅ **Multilingual NLP** - 100+ languages with auto-detection
- ✅ **Voice AI** - Real-time speech-to-text and text-to-speech
- ✅ **Telephony** - Inbound/outbound calls via Twilio
- ✅ **Modern Dashboard** - React frontend with analytics
- ✅ **No-Code Agent Builder** - Visual workflow designer
- ✅ **CRM Integration** - Contact management and sync
- ✅ **Analytics** - Call metrics, CSAT, sentiment analysis

## 📋 Before You Start

### Required:
1. **OpenAI API Key** - For AI conversations
   - Get it: https://platform.openai.com/api-keys
   - Cost: ~$0.02 per call

### Optional (for phone calls):
2. **Twilio Account** - For actual phone calls
   - Get it: https://www.twilio.com/try-twilio
   - Free: $15 trial credit

## 🎯 Three Ways to Start

### Option 1: Quick Demo (No API Keys) - 2 minutes
Just want to see the UI?

```bash
cd /Users/dduncan/CascadeProjects/windsurf-project

# Install dependencies
cd frontend && npm install && cd ..

# Start frontend only
cd frontend && npm run dev
```

Open http://localhost:3000 - You'll see the UI with sample data!

### Option 2: Full Local Setup (With API Keys) - 5 minutes
Want to test AI features?

```bash
cd /Users/dduncan/CascadeProjects/windsurf-project

# 1. Add your OpenAI key
nano .env
# Add: OPENAI_API_KEY=sk-your-key-here
# Save: Ctrl+X, Y, Enter

# 2. Run the startup script
./start-dev.sh
```

Open http://localhost:3000 and create an account!

### Option 3: Docker (Easiest) - 3 minutes
Have Docker installed?

```bash
cd /Users/dduncan/CascadeProjects/windsurf-project

# Add API key to .env
nano .env

# Start everything
docker-compose up -d
```

## 📚 Documentation Guide

**Start with these (in order):**

1. **QUICKSTART.md** ⚡
   - Get running in 2 minutes
   - Minimal setup required

2. **API_KEYS_HOWTO.md** 🔑
   - Step-by-step guide to get each API key
   - Screenshots and testing instructions

3. **SETUP_GUIDE.md** 📖
   - Complete installation guide
   - Troubleshooting section
   - Manual setup instructions

**Reference docs:**

4. **API_DOCUMENTATION.md** 📡
   - Complete API reference
   - All endpoints documented
   - Example requests/responses

5. **ARCHITECTURE.md** 🏗️
   - System architecture
   - Data flow diagrams
   - Technology stack details

6. **DEPLOYMENT.md** 🚀
   - Production deployment
   - Kubernetes configs
   - Scaling strategies

## 🎬 Quick Start Commands

```bash
# Navigate to project
cd /Users/dduncan/CascadeProjects/windsurf-project

# Start everything (installs dependencies automatically)
./start-dev.sh

# Stop everything
./stop-dev.sh

# View logs
tail -f logs/backend.log
tail -f logs/nlp.log
tail -f logs/frontend.log

# Check if running
curl http://localhost:3001/health  # Backend
curl http://localhost:8001/health  # NLP Engine
open http://localhost:3000         # Frontend
```

## 🔧 Current Status

The application is **ready to run** but needs:

1. ✅ Dependencies installed (run `./start-dev.sh` to auto-install)
2. ⚠️ API keys configured (see API_KEYS_HOWTO.md)
3. ⚠️ Services started (run `./start-dev.sh`)

## 🎯 What to Do First

### Step 1: Get OpenAI API Key (2 minutes)
1. Go to https://platform.openai.com/api-keys
2. Create new key
3. Copy it

### Step 2: Configure .env (30 seconds)
```bash
nano .env
```

Add:
```env
OPENAI_API_KEY=sk-your-actual-key-here
```

### Step 3: Start Application (1 minute)
```bash
./start-dev.sh
```

Wait for "🎉 GlobalVoice Nexus is starting up!"

### Step 4: Open Browser
Go to: http://localhost:3000

### Step 5: Create Account
1. Click "Sign up"
2. Enter name, email, password
3. Click "Create Account"

### Step 6: Create Your First Agent
1. Go to "Agents" → "Create Agent"
2. Name it "Test Agent"
3. Choose language and personality
4. Click "Create"

## 🎨 Features You Can Use Right Now

### Without Phone Calls (No Twilio):
- ✅ Dashboard with analytics
- ✅ Create AI agents
- ✅ Build conversation workflows
- ✅ Manage contacts
- ✅ View sample data

### With Phone Calls (Twilio configured):
- ✅ Make outbound calls
- ✅ Receive inbound calls
- ✅ Real-time transcription
- ✅ Multi-language detection
- ✅ Call recording
- ✅ CSAT scoring

## 🐛 Troubleshooting

### "Command not found: ./start-dev.sh"
```bash
chmod +x start-dev.sh
./start-dev.sh
```

### "Port already in use"
```bash
# Find what's using the port
lsof -i :3000

# Kill it
kill -9 <PID>
```

### "OpenAI API error"
- Check your key in .env
- Verify you have credits: https://platform.openai.com/account/billing

### Services won't start
```bash
# Check logs
tail -f logs/*.log

# Try manual start
cd backend && npm run dev
```

## 💡 Pro Tips

1. **Test without costs**: The UI works without API keys (sample data)
2. **Use GPT-3.5**: Cheaper, set `OPENAI_MODEL=gpt-3.5-turbo` in .env
3. **Development mode**: All services auto-reload on code changes
4. **View real-time logs**: `tail -f logs/*.log`

## 📞 Need Help?

1. **Check logs first**: `tail -f logs/*.log`
2. **Read SETUP_GUIDE.md**: Detailed troubleshooting
3. **Check API_KEYS_HOWTO.md**: Key configuration issues

## 🎯 Next Steps

Once running:

1. **Explore Dashboard** - See analytics and metrics
2. **Create Agents** - Build your first AI agent
3. **Test Workflows** - Create conversation flows
4. **Add Contacts** - Import contact list
5. **Configure Twilio** - Enable phone calls
6. **Make Test Call** - Try it out!

## 📊 Project Structure

```
globalvoice-nexus/
├── backend/              # Node.js API (port 3001)
├── frontend/             # React UI (port 3000)
├── nlp-engine/          # Python NLP (port 8001)
├── logs/                # Application logs
├── .env                 # Your API keys (create from .env.example)
├── start-dev.sh         # Start everything
├── stop-dev.sh          # Stop everything
└── Documentation/
    ├── START_HERE.md         ← You are here
    ├── QUICKSTART.md         ← Read this next
    ├── API_KEYS_HOWTO.md     ← Then this
    ├── SETUP_GUIDE.md        ← Full guide
    ├── API_DOCUMENTATION.md  ← API reference
    ├── ARCHITECTURE.md       ← System design
    └── DEPLOYMENT.md         ← Production deploy
```

## ✅ Checklist

- [ ] Read this file (START_HERE.md)
- [ ] Get OpenAI API key
- [ ] Configure .env file
- [ ] Run `./start-dev.sh`
- [ ] Open http://localhost:3000
- [ ] Create account
- [ ] Create first agent
- [ ] Explore dashboard

## 🚀 Ready to Start?

```bash
# One command to rule them all:
./start-dev.sh
```

Then open: **http://localhost:3000**

---

**Questions?** Read QUICKSTART.md or SETUP_GUIDE.md

**Let's build amazing AI call agents! 🎉**
