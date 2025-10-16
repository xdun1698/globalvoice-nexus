# 📞 POC Calling Features Setup - US Only (Economical)

**Goal**: Set up cost-effective calling features for testing in the US  
**Budget**: Minimal cost (~$2-5/month for testing)  
**Timeline**: 15-20 minutes

---

## 💰 Cost Breakdown (US Only POC)

### Twilio Costs
- **Phone Number**: $1.15/month (US local number)
- **Outbound Calls**: $0.013/minute
- **Inbound Calls**: $0.0085/minute
- **SMS** (optional): $0.0079/message
- **Recording Storage**: Free for 30 days

**Estimated Monthly Cost**: $2-5 for light testing (100-200 minutes)

### OpenAI Costs (for AI responses)
- **GPT-4 Turbo**: $0.01/1K input tokens, $0.03/1K output tokens
- **Estimated**: $0.50-2/month for testing

**Total POC Cost**: ~$3-7/month

---

## 🚀 Step-by-Step Setup

### Step 1: Create Twilio Account (5 minutes)

1. **Sign up**: https://www.twilio.com/try-twilio
   - Get $15 free trial credit
   - No credit card required initially

2. **Verify your phone number**
   - You'll need this to test calls

3. **Get your credentials**:
   - Go to Console: https://console.twilio.com/
   - Copy **Account SID**
   - Copy **Auth Token**

---

### Step 2: Purchase a US Phone Number (2 minutes)

1. **Go to Phone Numbers**: https://console.twilio.com/us1/develop/phone-numbers/manage/search
2. **Select**:
   - Country: United States
   - Capabilities: Voice ✅
   - Click "Search"
3. **Choose a number** (preferably local to your area)
4. **Purchase** ($1.15/month)
5. **Copy the phone number** (format: +1XXXXXXXXXX)

---

### Step 3: Configure Twilio Webhooks (3 minutes)

1. **Go to your purchased number**:
   - Console → Phone Numbers → Manage → Active Numbers
   - Click on your number

2. **Configure Voice & Fax**:
   ```
   A CALL COMES IN:
   - Webhook: https://globalvoice-backend.fly.dev/api/webhooks/twilio/voice
   - HTTP POST
   
   PRIMARY HANDLER FAILS:
   - Leave default
   
   CALL STATUS CHANGES:
   - Webhook: https://globalvoice-backend.fly.dev/api/webhooks/twilio/status
   - HTTP POST
   ```

3. **Save**

---

### Step 4: Set Environment Variables in Fly.io (3 minutes)

```bash
# Set Twilio credentials
flyctl secrets set TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" -a globalvoice-backend

flyctl secrets set TWILIO_AUTH_TOKEN="your_auth_token_here" -a globalvoice-backend

flyctl secrets set TWILIO_PHONE_NUMBER="+1XXXXXXXXXX" -a globalvoice-backend

# Set backend URL (for webhooks)
flyctl secrets set BACKEND_URL="https://globalvoice-backend.fly.dev" -a globalvoice-backend

# Optional: Set OpenAI for AI responses
flyctl secrets set OPENAI_API_KEY="sk-..." -a globalvoice-backend
```

**Note**: App will automatically restart after setting secrets

---

### Step 5: Verify Deployment (2 minutes)

```bash
# Check logs to confirm Twilio is initialized
flyctl logs -a globalvoice-backend

# Look for:
# "Twilio client initialized" ✅
# NOT "Twilio credentials not provided" ❌
```

---

### Step 6: Create Your First Agent (5 minutes)

1. **Go to your app**: https://globalvoice-nexus.netlify.app

2. **Login** and go to **Agents** page

3. **Create New Agent**:
   ```
   Name: Test Support Agent
   Language: English (en)
   Voice: Polly.Joanna (US English female)
   
   Greeting: "Hello! Thank you for calling. How can I help you today?"
   
   System Prompt:
   "You are a helpful customer support agent. Be friendly, professional, 
   and concise. Ask clarifying questions when needed. If you can't help, 
   politely offer to transfer to a human agent."
   
   Knowledge Base: (leave empty for now)
   ```

4. **Save Agent**

5. **Assign Phone Number**:
   - Click "Assign Number"
   - Select your Twilio number
   - Save

---

## 🧪 Testing Your Setup

### Test 1: Inbound Call (Recommended First)

1. **Call your Twilio number** from your phone
2. **Expected flow**:
   - Call connects
   - Agent greets you
   - You can speak naturally
   - Agent responds with AI-generated answers
   - Call is recorded

3. **Check the dashboard**:
   - Go to Calls page
   - See your call record
   - View transcript
   - Listen to recording

### Test 2: Outbound Call (After inbound works)

1. **In the app**, go to **Calls** → **Make Call**
2. **Enter**:
   - Select your agent
   - Enter your verified phone number
   - Click "Call"
3. **Answer your phone**
4. **Test the conversation**

---

## 🔧 Troubleshooting

### Issue: "Twilio credentials not provided"

**Solution**:
```bash
# Verify secrets are set
flyctl secrets list -a globalvoice-backend

# Should show:
# - TWILIO_ACCOUNT_SID
# - TWILIO_AUTH_TOKEN
# - TWILIO_PHONE_NUMBER

# If missing, set them again
```

### Issue: Call connects but no audio

**Solution**:
1. Check webhook URLs are correct in Twilio console
2. Verify BACKEND_URL is set correctly
3. Check Fly.io logs for errors:
   ```bash
   flyctl logs -a globalvoice-backend
   ```

### Issue: Agent doesn't respond intelligently

**Solution**:
1. Ensure OPENAI_API_KEY is set
2. Check agent's system prompt is clear
3. Review call transcript to see what's being sent/received

### Issue: "Number not verified" error

**Solution**:
- With trial account, you can only call verified numbers
- Verify your test numbers in Twilio console
- Or upgrade to paid account (no trial restrictions)

---

## 💡 Cost-Saving Tips for POC

### 1. Use Trial Credit Wisely
- Twilio gives $15 free credit
- That's ~1,000 minutes of testing
- Don't upgrade until you need to

### 2. Keep Calls Short
- Test with 1-2 minute calls
- Focus on specific features
- Use transcripts instead of re-calling

### 3. Limit Phone Numbers
- Start with 1 number ($1.15/month)
- Add more only when needed

### 4. Use GPT-3.5 for Testing
- Much cheaper than GPT-4
- Good enough for POC
- Upgrade to GPT-4 for production

### 5. Delete Recordings After Testing
- Recordings are free for 30 days
- Delete old ones to save storage

### 6. Monitor Usage
- Check Twilio console daily
- Set up usage alerts
- Stop if costs exceed budget

---

## 📊 What You Can Test

### ✅ Core Features
- [x] Inbound call handling
- [x] Outbound call initiation
- [x] Speech recognition (English)
- [x] AI-powered responses
- [x] Call recording
- [x] Call transcription
- [x] Real-time dashboard updates

### ⏳ Advanced Features (Add Later)
- [ ] Multi-language support (requires more testing)
- [ ] Call transfer
- [ ] IVR menus
- [ ] SMS integration
- [ ] Call queuing
- [ ] Analytics and reporting

---

## 🎯 Success Criteria

After setup, you should be able to:

1. ✅ Call your Twilio number and get greeted by agent
2. ✅ Have a natural conversation with AI agent
3. ✅ See call appear in dashboard in real-time
4. ✅ View call transcript after call ends
5. ✅ Listen to call recording
6. ✅ Make outbound calls from the app
7. ✅ See call duration and status

---

## 🔐 Security Notes

### For POC (Current Setup)
- ✅ HTTPS for all webhooks
- ✅ Twilio validates webhook signatures
- ✅ Environment variables stored securely in Fly.io
- ✅ No credentials in code

### For Production (Later)
- [ ] Add webhook signature verification
- [ ] Implement rate limiting
- [ ] Add call recording encryption
- [ ] Set up monitoring and alerts
- [ ] Add fraud detection

---

## 📝 Quick Reference

### Your Twilio Dashboard
https://console.twilio.com/

### Your App
https://globalvoice-nexus.netlify.app

### Backend API
https://globalvoice-backend.fly.dev

### Check Logs
```bash
flyctl logs -a globalvoice-backend
```

### Set Secret
```bash
flyctl secrets set KEY="value" -a globalvoice-backend
```

### List Secrets
```bash
flyctl secrets list -a globalvoice-backend
```

---

## 🚀 Next Steps After POC

### If POC is Successful:

1. **Upgrade Twilio Account**
   - Remove trial restrictions
   - Add credit card
   - Get more phone numbers

2. **Add More Features**
   - Multi-language support
   - Call transfer
   - SMS notifications
   - Advanced analytics

3. **Optimize Costs**
   - Use GPT-3.5 Turbo for simple queries
   - Implement caching
   - Add call duration limits

4. **Scale Up**
   - Add more agents
   - Support more languages
   - Deploy to multiple regions

---

## 💰 Estimated Costs by Usage

### Light Testing (Current POC)
- **100 minutes/month**: ~$2-3/month
- **Perfect for**: Initial testing, demos

### Medium Usage
- **500 minutes/month**: ~$8-12/month
- **Perfect for**: Beta testing, small team

### Production (Small)
- **2,000 minutes/month**: ~$30-40/month
- **Perfect for**: Small business, 50-100 calls/day

### Production (Medium)
- **10,000 minutes/month**: ~$150-200/month
- **Perfect for**: Growing business, 500+ calls/day

---

## 🎉 You're Ready!

Follow the steps above and you'll have a working AI calling system in ~20 minutes.

**Start with Step 1** and work your way through. Each step builds on the previous one.

**Questions?** Check the troubleshooting section or review the logs.
