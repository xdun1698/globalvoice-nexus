# ⚡ Quick Start - Get Running in 2 Minutes

## Step 1: Get Your API Keys (1 minute)

### OpenAI API Key (Required)
1. Go to: https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key (starts with `sk-`)

**Don't have an account?** Sign up at https://platform.openai.com/signup

### Twilio (Optional - for phone calls)
1. Go to: https://console.twilio.com/
2. Copy your Account SID and Auth Token from the dashboard
3. Get a phone number from: Phone Numbers → Buy a Number

**For testing without phone calls:** You can skip Twilio and still use the dashboard!

## Step 2: Configure Environment (30 seconds)

```bash
cd /Users/dduncan/CascadeProjects/windsurf-project

# Edit the .env file
nano .env
```

**Minimum required:** Add your OpenAI key:
```env
OPENAI_API_KEY=sk-your-actual-key-here
```

**Optional:** Add Twilio for phone features:
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

Save and exit (Ctrl+X, then Y, then Enter)

## Step 3: Start the Application (30 seconds)

```bash
# Run the startup script
./start-dev.sh
```

The script will:
- ✅ Install all dependencies automatically
- ✅ Start Backend API (port 3001)
- ✅ Start NLP Engine (port 8001)
- ✅ Start Frontend (port 3000)

## Step 4: Access the Application

Open your browser: **http://localhost:3000**

### First Time Setup:
1. Click "Sign up"
2. Enter your name, email, and password
3. Click "Create Account"
4. You're in! 🎉

## 🎯 What You Can Do Now

### Without Phone Calls (No Twilio needed):
- ✅ Create AI agents with custom personalities
- ✅ Build conversation workflows
- ✅ View analytics dashboard
- ✅ Manage contacts
- ✅ Test the agent builder interface

### With Phone Calls (Twilio configured):
- ✅ Make outbound calls
- ✅ Receive inbound calls
- ✅ Real-time transcription
- ✅ Multi-language support
- ✅ Call recording and analytics

## 🛑 Stop the Application

Press `Ctrl+C` in the terminal where you ran `./start-dev.sh`

Or run:
```bash
./stop-dev.sh
```

## 🐛 Troubleshooting

### "Port already in use"
```bash
# Find and kill the process
lsof -i :3000  # or :3001 or :8001
kill -9 <PID>
```

### "OpenAI API error"
- Check your API key is correct in `.env`
- Make sure you have credits: https://platform.openai.com/account/billing

### Services won't start
```bash
# View logs
tail -f logs/backend.log
tail -f logs/nlp.log
tail -f logs/frontend.log
```

### Need to reinstall?
```bash
# Clean and reinstall
rm -rf backend/node_modules frontend/node_modules nlp-engine/venv
./start-dev.sh
```

## 📚 Next Steps

- **Full Setup Guide**: See `SETUP_GUIDE.md` for detailed instructions
- **API Documentation**: See `API_DOCUMENTATION.md` for API reference
- **Architecture**: See `ARCHITECTURE.md` for system design

## 💡 Tips

1. **Testing without costs**: Use GPT-3.5-turbo (cheaper) by changing `OPENAI_MODEL=gpt-3.5-turbo` in `.env`
2. **Mock data**: The dashboard shows sample data even without making real calls
3. **Development mode**: All services auto-reload when you edit code

## 🆘 Need Help?

Check the logs first:
```bash
# All logs
tail -f logs/*.log

# Specific service
tail -f logs/backend.log
```

Common issues and solutions in `SETUP_GUIDE.md`

---

**Ready to build AI call agents? Let's go! 🚀**
