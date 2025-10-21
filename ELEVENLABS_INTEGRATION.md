# ElevenLabs Voice Integration Guide

## Overview
GlobalVoice Nexus now supports **ElevenLabs** premium text-to-speech voices for ultra-realistic, natural-sounding AI agents. ElevenLabs provides the highest quality voice synthesis available, with support for 29 languages and emotional expression.

## Features
- ✅ **Premium Voice Quality**: Most natural-sounding AI voices on the market
- ✅ **29 Languages**: Multilingual support with native-sounding voices
- ✅ **Emotion & Intonation**: Realistic breathing, pauses, and emotional expression
- ✅ **30+ Pre-configured Voices**: American, British, Australian accents
- ✅ **Automatic Fallback**: Falls back to Amazon Polly if ElevenLabs unavailable
- ✅ **Per-Agent Voice Selection**: Each agent can have a unique voice

## Setup

### 1. Get ElevenLabs API Key
1. Sign up at https://elevenlabs.io
2. Go to Profile → API Keys
3. Create a new API key
4. Copy the key (starts with `sk_...`)

### 2. Set Environment Variable

#### For Fly.io (Production)
```bash
flyctl secrets set ELEVENLABS_API_KEY="your_api_key_here" -a globalvoice-backend
```

#### For Local Development
```bash
# Add to backend/.env
ELEVENLABS_API_KEY=your_api_key_here
```

### 3. Restart Backend
```bash
# Fly.io (automatic after setting secret)
flyctl deploy -a globalvoice-backend

# Local
cd backend
npm run dev
```

## Usage

### Available Voices

#### American Female
- **rachel** - Calm, professional (recommended default)
- **domi** - Strong, confident
- **bella** - Soft, gentle
- **elli** - Emotional, expressive
- **matilda** - Clear, articulate
- **gigi** - Youthful, energetic
- **freya** - Warm, friendly
- **grace** - Southern accent, pleasant
- **serena** - Pleasant, conversational
- **nicole** - Whisper-capable, intimate
- **emily** - Calm, soothing

#### American Male
- **antoni** - Well-rounded, versatile (recommended default)
- **josh** - Deep, authoritative
- **arnold** - Crisp, clear
- **adam** - Deep, resonant
- **sam** - Raspy, character voice
- **jeremy** - Irish-American accent
- **michael** - Professional, clear
- **ethan** - Young, energetic
- **thomas** - Calm, measured
- **callum** - Hoarse, distinctive

#### British
- **lily** - Female, confident
- **daniel** - Male, raspy
- **joseph** - Male, professional
- **alice** - Female, confident
- **george** - Male, raspy character

#### Australian
- **james** - Male, casual
- **charlie** - Male, laid-back

#### Multilingual (29 Languages)
- **adam_multilingual** - Male, supports all languages
- **charlotte** - Female, English/Swedish

### Configure Agent Voice

#### Option 1: In Agent Builder UI
1. Go to Agents → Create/Edit Agent
2. In the "Voice Settings" section
3. Select voice from dropdown
4. Save agent

#### Option 2: Via API
```javascript
// Create agent with ElevenLabs voice
POST /api/agents
{
  "name": "Customer Support Agent",
  "personality": "friendly and helpful",
  "elevenlabs_voice": "rachel",  // Voice ID
  "language": "en",
  "greeting": "Hi! How can I help you today?"
}

// Update existing agent
PUT /api/agents/:id
{
  "elevenlabs_voice": "antoni"
}
```

#### Option 3: Database Direct
```sql
UPDATE agents 
SET elevenlabs_voice = 'rachel' 
WHERE id = 'your-agent-id';
```

### Get Available Voices
```bash
# Get voice categories (fast, no API call)
GET /api/agents/voices/elevenlabs

# Get live voices from ElevenLabs API (slower, requires API key)
GET /api/agents/voices/elevenlabs?fetch=true
```

## Voice Selection Strategy

### By Language
The system automatically selects appropriate voices based on detected language:
- **English (US)**: rachel (female) or antoni (male)
- **English (UK)**: lily (female) or daniel (male)
- **English (AU)**: james (male)
- **Spanish**: domi or adam_multilingual
- **French**: charlotte or adam_multilingual
- **Other languages**: adam_multilingual (supports 29 languages)

### By Use Case
- **Customer Support**: rachel, antoni, emily
- **Sales**: domi, josh, grace
- **Technical Support**: arnold, thomas, matilda
- **Casual/Friendly**: bella, freya, charlie
- **Professional/Corporate**: daniel, joseph, alice
- **Character/Unique**: sam, callum, george, gigi

## Voice Settings

You can customize voice characteristics in `backend/src/services/elevenlabs.js`:

```javascript
this.defaultSettings = {
  stability: 0.5,        // 0-1: Lower = more expressive, Higher = more stable
  similarity_boost: 0.75, // 0-1: How closely to match original voice
  style: 0.0,            // 0-1: Style exaggeration (v2 models only)
  use_speaker_boost: true // Boost clarity and similarity
};
```

### Adjusting for Different Scenarios
```javascript
// More expressive (emotional, varied)
{ stability: 0.3, similarity_boost: 0.75 }

// More stable (consistent, professional)
{ stability: 0.7, similarity_boost: 0.85 }

// Maximum clarity (customer service)
{ stability: 0.5, similarity_boost: 0.75, use_speaker_boost: true }
```

## Pricing

### ElevenLabs Pricing Tiers
- **Free**: 10,000 characters/month (~$0)
- **Starter**: 30,000 characters/month (~$5)
- **Creator**: 100,000 characters/month (~$22)
- **Pro**: 500,000 characters/month (~$99)
- **Scale**: 2,000,000 characters/month (~$330)

### Cost Estimation
- Average call: 500-1000 characters (~2-4 minutes of speech)
- 100 calls/month: ~50,000-100,000 characters = **$5-22/month**
- 500 calls/month: ~250,000-500,000 characters = **$22-99/month**
- 1000 calls/month: ~500,000-1,000,000 characters = **$99-330/month**

### Cost vs Polly
- **Amazon Polly**: ~$4 per 1M characters
- **ElevenLabs**: ~$99 per 500K characters
- **Quality difference**: Significant - ElevenLabs sounds much more natural

## Fallback Behavior

The system automatically falls back to Amazon Polly if:
1. `ELEVENLABS_API_KEY` is not set
2. ElevenLabs API is unavailable
3. ElevenLabs request fails
4. Character limit exceeded

Fallback is seamless and logged for monitoring.

## Monitoring Usage

### Check Usage via API
```bash
# Get current usage stats
GET /api/agents/voices/elevenlabs/usage
```

### Response
```json
{
  "character_count": 45230,
  "character_limit": 100000,
  "can_use_instant_voice_cloning": false,
  "tier": "creator"
}
```

### Logs
```bash
# Check which voice engine is being used
flyctl logs -a globalvoice-backend | grep "Voice engine"

# Check ElevenLabs TTS calls
flyctl logs -a globalvoice-backend | grep "ElevenLabs TTS"
```

## Advanced Features

### Custom Voice Cloning (Pro/Scale plans)
1. Record 1-2 minutes of voice samples
2. Upload to ElevenLabs dashboard
3. Get custom voice ID
4. Use in agent configuration

### Streaming (Future Enhancement)
For ultra-low latency, implement streaming:
```javascript
const stream = await elevenLabsService.textToSpeechStream(message, voiceId);
// Stream directly to Twilio
```

## Troubleshooting

### Voice Sounds Robotic
- Increase `stability` to 0.6-0.7
- Enable `use_speaker_boost`
- Try different voice (rachel, antoni recommended)

### Voice Too Monotone
- Decrease `stability` to 0.3-0.4
- Increase `style` to 0.3-0.5

### API Errors
```bash
# Check if API key is set
flyctl secrets list -a globalvoice-backend | grep ELEVENLABS

# Check logs for errors
flyctl logs -a globalvoice-backend | grep "ElevenLabs"
```

### Character Limit Exceeded
- Upgrade ElevenLabs plan
- System will auto-fallback to Polly
- Monitor usage via API

## Migration from Polly

### Existing Agents
Existing agents will continue using Polly until you:
1. Edit the agent
2. Select an ElevenLabs voice
3. Save

### Gradual Rollout
1. Test with 1-2 agents first
2. Monitor quality and usage
3. Migrate high-priority agents
4. Keep low-volume agents on Polly to save costs

## Best Practices

1. **Use ElevenLabs for customer-facing agents** - Quality matters most here
2. **Use Polly for internal/testing** - Save costs on non-critical use cases
3. **Monitor usage monthly** - Avoid surprise bills
4. **Test voices before deploying** - Each voice has unique characteristics
5. **Set appropriate stability** - Balance expressiveness vs consistency
6. **Use multilingual voices** - For agents serving multiple languages

## Support

- **ElevenLabs Docs**: https://docs.elevenlabs.io
- **Voice Library**: https://elevenlabs.io/voice-library
- **API Reference**: https://docs.elevenlabs.io/api-reference

## Next Steps

1. ✅ Get ElevenLabs API key
2. ✅ Set `ELEVENLABS_API_KEY` in Fly.io
3. ✅ Deploy backend
4. ✅ Test with one agent
5. ✅ Monitor usage and quality
6. ✅ Roll out to all agents

---

**Status**: ✅ Fully integrated and ready to use
**Quality**: ⭐⭐⭐⭐⭐ Premium, natural-sounding voices
**Cost**: 💰 $5-330/month depending on usage
