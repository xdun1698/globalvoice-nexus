# Voice Providers Guide

## Voice Options in GlobalVoice Nexus

Your platform supports two voice providers, clearly labeled in the Agent Builder.

---

## 🎙️ ElevenLabs (Premium - Recommended)

### What It Is
ElevenLabs provides the most natural-sounding AI voices available. These voices are indistinguishable from real humans in most cases.

### Available Voices

**Male Voices:**
- **Antoni** (US) - Professional, Dallas businessman tone
- **Adam** (US) - Deep, authoritative
- **Sam** (US) - Dynamic, energetic
- **Josh** (US) - Young, friendly
- **Arnold** (US) - Crisp, clear

**Female Voices:**
- **Rachel** (US) - Calm, professional
- **Bella** (US) - Soft, warm
- **Domi** (US) - Strong, confident
- **Elli** (US) - Emotional, expressive
- **Lily** (UK) - British accent

### When to Use
- **Customer-facing calls** - Sounds professional and natural
- **Sales calls** - Builds trust and rapport
- **Collections** - Maintains authority while being empathetic
- **Any important calls** - Best first impression

### Cost
- Free: 10,000 characters (~20-30 calls)
- Starter: $5/month (30k chars)
- Creator: $22/month (100k chars)

### How It Works
1. Select an ElevenLabs voice in Agent Builder
2. Voice ID stored in database
3. Synced to Vapi automatically
4. Vapi uses ElevenLabs for all calls
5. Premium quality every time

---

## 🔊 AWS Polly (Standard - Fallback)

### What It Is
Amazon Polly provides basic text-to-speech voices. These sound more robotic and less natural than ElevenLabs.

### Available Voices

**US English:**
- **Joanna** (Female) - Most popular
- **Matthew** (Male) - Professional
- **Kendra** (Female) - Younger
- **Joey** (Male) - Standard

**UK English:**
- **Amy** (Female)
- **Brian** (Male)

### When to Use
- **Internal testing** - Save costs during development
- **High-volume low-value calls** - When cost matters more than quality
- **Fallback** - If ElevenLabs quota exceeded
- **Simple notifications** - When natural voice isn't critical

### Cost
- Very cheap: ~$0.004 per 1000 characters
- Essentially free for most use cases

### How It Works
1. Select a Polly voice in Agent Builder
2. Voice name stored in database
3. Backend uses Polly for TTS
4. Basic quality, reliable

---

## How to Choose

### Use ElevenLabs If:
✅ Customer-facing calls
✅ Sales or collections
✅ Building trust is important
✅ Professional image matters
✅ Budget allows $20-100/month

### Use AWS Polly If:
✅ Internal testing only
✅ Very high call volume (1000s/day)
✅ Cost is primary concern
✅ Voice quality doesn't matter
✅ Simple notifications

---

## In the Dashboard

When you create or edit an agent, you'll see:

```
Voice Provider & Type
┌─────────────────────────────────────────────┐
│ 🎙️ ELEVENLABS (Premium - Natural AI Voices) │
│   Antoni (Male, US) - Professional          │
│   Rachel (Female, US) - Calm                │
│   Bella (Female, US) - Soft                 │
│   ... more voices ...                       │
│                                             │
│ 🔊 AWS POLLY (Standard - Basic Voices)      │
│   Joanna (Female, US)                       │
│   Matthew (Male, US)                        │
│   ... basic voices ...                      │
└─────────────────────────────────────────────┘

ElevenLabs = Premium natural voices (recommended)
AWS Polly = Basic voices (fallback)
```

---

## Technical Details

### ElevenLabs Integration
- **API Key:** Already configured in backend
- **Endpoint:** `/api/agents/voices/elevenlabs`
- **Storage:** Voice ID in `agents.elevenlabs_voice` field
- **Sync:** Automatically synced to Vapi
- **Quality:** 44.1kHz, natural prosody

### AWS Polly Integration
- **Service:** Amazon Polly via AWS SDK
- **Storage:** Voice name in `agents.voice` field
- **Fallback:** Used if ElevenLabs fails
- **Quality:** 16kHz, synthetic

### Vapi Integration
When you select an ElevenLabs voice:
1. Voice ID saved to database
2. Agent synced to Vapi
3. Vapi configured with ElevenLabs voice
4. All calls use that voice automatically

---

## Recommendations

### For Collections Agents
**Best:** Antoni (ElevenLabs)
- Professional Dallas businessman tone
- Authoritative but empathetic
- Builds trust while maintaining firmness

**Alternative:** Matthew (Polly)
- Basic but professional
- Use for testing only

### For Customer Support
**Best:** Rachel (ElevenLabs)
- Calm, reassuring tone
- Professional and friendly
- Great for problem-solving

**Alternative:** Joanna (Polly)
- Most popular Polly voice
- Acceptable for basic support

### For Sales
**Best:** Domi or Josh (ElevenLabs)
- Energetic and engaging
- Builds rapport quickly
- Sounds confident

**Alternative:** Joey (Polly)
- Basic male voice
- Testing only

---

## Cost Comparison

### 1000 Calls/Month (avg 2 min each)

**ElevenLabs:**
- Characters: ~240,000 (2 min × 80 chars/min × 1000 calls)
- Cost: $22/month (Creator plan)
- Per call: $0.022

**AWS Polly:**
- Characters: ~240,000
- Cost: ~$1/month
- Per call: $0.001

**Recommendation:** Use ElevenLabs. The extra $21/month is worth it for professional quality.

---

## How to Switch Voices

### For Existing Agent
1. Go to Agents page
2. Click "Edit" on agent
3. Change voice in dropdown
4. Save
5. Voice automatically synced to Vapi

### For New Agent
1. Go to Agents page
2. Click "Create Agent"
3. Select voice from dropdown
4. Complete form
5. Save
6. Voice configured automatically

---

## Testing Voices

### Option 1: Test in Vapi Dashboard
1. Login to vapi.ai
2. Go to your assistant
3. Click "Test"
4. Speak to hear the voice

### Option 2: Make a Real Call
1. Buy a phone number
2. Assign to agent
3. Call the number
4. Hear the voice live

### Option 3: Preview (Coming Soon)
Voice preview feature will be added to dashboard.

---

## Troubleshooting

### Voice Sounds Robotic
**Problem:** Using AWS Polly
**Solution:** Switch to ElevenLabs voice

### Voice Not Changing
**Problem:** Agent not synced to Vapi
**Solution:** Edit and save agent again

### ElevenLabs Not Working
**Problem:** API key or quota issue
**Solution:** Check backend logs, verify API key

---

## Summary

- **🎙️ ElevenLabs** = Premium, natural, recommended
- **🔊 AWS Polly** = Basic, cheap, fallback
- **Clear labels** in dashboard show which is which
- **Easy switching** - just select and save
- **Auto-sync** to Vapi for seamless integration

**Use ElevenLabs for any customer-facing calls. It's worth it.**
