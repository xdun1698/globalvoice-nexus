# Vapi.ai Testing Guide

## ✅ Setup Complete

Your app is now ready to test with Vapi.ai!

---

## 🔧 Backend Configuration

### What Was Added
1. **Vapi Webhook Handler** (`backend/src/routes/vapi.js`)
   - Receives call events from Vapi
   - Logs calls to your database
   - Tracks transcripts in real-time
   - Records call duration and status

2. **API Endpoints**
   - `POST /api/vapi/webhook` - Receives Vapi events
   - `GET /api/vapi/stats` - View Vapi call statistics

---

## 📞 Configure Vapi.ai Webhook

### Step 1: Deploy Backend
```bash
cd /Users/dduncan/CascadeProjects/windsurf-project/backend
/Users/dduncan/.fly/bin/flyctl deploy --remote-only -a globalvoice-backend
```

### Step 2: Set Webhook in Vapi
1. Go to Vapi Dashboard → Your Assistant → Settings
2. Find **"Server URL"** or **"Webhook URL"**
3. Enter: `https://globalvoice-backend.fly.dev/api/vapi/webhook`
4. Save

### Step 3: Configure Events
Enable these events in Vapi:
- ✅ `call-start` - When call begins
- ✅ `transcript` - Real-time transcription
- ✅ `call-end` - When call completes

---

## 🧪 Testing Checklist

### 1. Test the Call
- [ ] Call your Vapi number
- [ ] Will answers with greeting
- [ ] Say: "I can't pay it all today"
- [ ] Will offers payment plan with 25% down
- [ ] Continue conversation naturally
- [ ] Will negotiates following priority order

### 2. Verify Backend Logging
```bash
# Check backend logs
/Users/dduncan/.fly/bin/flyctl logs -a globalvoice-backend

# Look for:
# "Vapi webhook received"
# "Vapi call started"
# "Transcript logged"
# "Vapi call ended"
```

### 3. Check Dashboard
1. Go to: https://globalvoice-nexus.netlify.app
2. Login: admin@test.com / Admin123!
3. Navigate to **Calls** page
4. You should see your Vapi call listed
5. Click to view transcript

### 4. View Statistics
```bash
curl https://globalvoice-backend.fly.dev/api/vapi/stats
```

Expected response:
```json
{
  "total_calls": 1,
  "avg_duration": 120,
  "completed_calls": 1
}
```

---

## 🎯 Test Scenarios

### Scenario 1: Full Payment
**You say:** "How much do I owe?"
**Will says:** "Your balance is $1,200. Can we get this taken care of in full today?"
**You say:** "Yes, I can pay it all"
**Will:** Collects payment information

### Scenario 2: Payment Plan
**You say:** "I can't pay it all today"
**Will:** "Let's set up a payment plan. I can break this into 4 payments of $300 each. Can you handle the first $300 today?"
**You say:** "Yes, I can do that"
**Will:** Collects $300 and schedules 3 future payments

### Scenario 3: Negotiation
**You say:** "I can only pay $100 today"
**Will:** "I appreciate you working with me. Can you do $150 today? That would really help."
**You say:** "Okay, $150"
**Will:** Collects $150 and schedules remainder

### Scenario 4: Objection Handling
**You say:** "I'll call you back later"
**Will:** "I appreciate that, but I'm here now and can help you right now. Let's just take care of it while we're talking."

---

## 📊 What Gets Logged

### In Your Database

**Calls Table:**
- Call ID (from Vapi)
- Agent: Will - Collections Agent
- Phone number
- Direction (inbound/outbound)
- Status (in-progress → completed)
- Duration
- Recording URL (if available)

**Call Transcripts Table:**
- Speaker (agent/caller)
- Text (what was said)
- Timestamp
- Confidence: 1.0

---

## 🔍 Troubleshooting

### Webhook Not Receiving Events
**Check:**
1. Backend is deployed and healthy: `curl https://globalvoice-backend.fly.dev/health`
2. Webhook URL is correct in Vapi dashboard
3. Events are enabled in Vapi settings
4. Check backend logs for errors

### Calls Not Showing in Dashboard
**Check:**
1. Webhook is receiving events (check logs)
2. Database connection is working
3. Agent "Will - Collections Agent" exists in database
4. Frontend is pointing to correct backend URL

### Transcripts Not Logging
**Check:**
1. Vapi has `transcript` event enabled
2. Backend logs show "Transcript logged" messages
3. Database has `call_transcripts` table

---

## 🚀 Next Steps

Once testing is successful:

1. **Fine-tune Will's Prompt**
   - Adjust aggressiveness
   - Add specific objection handlers
   - Customize for your exact use case

2. **Add Payment Processing**
   - Integrate Stripe/Square
   - Process payments in real-time
   - Send confirmation emails

3. **Enhanced Analytics**
   - Track collection rates
   - Monitor conversation quality
   - Identify successful strategies

4. **Scale Up**
   - Add more agents
   - Handle multiple concurrent calls
   - Implement call routing

---

## 📱 Your Vapi Number

**Phone Number:** [Your Vapi number here]
**Agent:** Will - Collections Agent
**Voice:** ElevenLabs Antoni
**Backend:** https://globalvoice-backend.fly.dev
**Dashboard:** https://globalvoice-nexus.netlify.app

---

## 🎉 Success Criteria

✅ Call connects immediately
✅ Will sounds natural (ElevenLabs voice)
✅ Conversation flows smoothly (no loops!)
✅ Will follows collections strategy
✅ Backend logs all events
✅ Dashboard shows call history
✅ Transcripts are accurate

**If all these work, you're ready for production!**
