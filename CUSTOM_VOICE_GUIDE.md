# Custom Voice Creation Guide for Collections Agents

## ✅ Will Voice Now Active

**Current Setup:**
- ✅ Agent updated to "Will - Collections Agent"
- ✅ Voice: `will` (conversational male voice)
- ✅ More expressive settings (stability: 0.35, style: 0.3)
- ✅ Conversational greeting
- ✅ Development mode (50% cost savings)

**Test:** Call +1 (817) 541-7385

---

## Recommended Custom Voices for Testing

### Option 1: Professional Male (Collections)
**Best for:** Bill collection, professional services, authoritative tone

**Voice Characteristics:**
- Age: 35-45
- Tone: Professional, firm but empathetic
- Pace: Measured, clear
- Accent: American (neutral)
- Style: Business professional

**ElevenLabs Voice Design Prompt:**
```
Create a professional male voice for a bill collector. Age 35-45, American accent. 
The voice should be firm yet empathetic, authoritative but not aggressive. 
Clear articulation, measured pace, business professional tone. 
Sounds like someone who is experienced, trustworthy, and solution-focused.
```

**Use Case:** Collections, debt recovery, payment negotiations

---

### Option 2: Friendly Female (Customer Service)
**Best for:** Customer support, general inquiries, friendly interactions

**Voice Characteristics:**
- Age: 28-35
- Tone: Warm, friendly, helpful
- Pace: Natural, conversational
- Accent: American (slight Southern warmth)
- Style: Approachable professional

**ElevenLabs Voice Design Prompt:**
```
Create a warm, friendly female voice for customer service. Age 28-35, American accent 
with slight Southern warmth. The voice should be approachable, helpful, and empathetic. 
Natural conversational pace, professional but not stiff. Sounds like someone who 
genuinely cares and wants to help solve problems.
```

**Use Case:** Customer support, appointment reminders, general inquiries

---

## How to Create Custom Voices in ElevenLabs

### Method 1: Voice Design (Recommended)
**Cost:** Free with Creator plan ($22/month)

1. Go to https://elevenlabs.io/voice-lab
2. Click "Voice Design"
3. Enter the prompt above
4. Adjust settings:
   - **Gender**: Male or Female
   - **Age**: 35-45 (male) or 28-35 (female)
   - **Accent**: American
   - **Accent Strength**: Medium
5. Click "Generate"
6. Listen to samples
7. Regenerate if needed
8. Save voice with name (e.g., "Collections-Male-Pro" or "Support-Female-Warm")
9. Copy the Voice ID

### Method 2: Instant Voice Cloning
**Cost:** Free with Creator plan
**Requirements:** 1-2 minutes of clean audio

1. Record or find sample audio:
   - Professional male: Business podcast, professional speaker
   - Friendly female: Customer service training, warm presenter
2. Upload to ElevenLabs Voice Lab
3. Name the voice
4. Test with sample text
5. Copy the Voice ID

### Method 3: Professional Voice Cloning
**Cost:** $99/month (Pro plan)
**Requirements:** 30+ minutes of high-quality audio

Best for production use with specific voice requirements.

---

## Adding Custom Voices to Your App

### Step 1: Add Voice to Backend

Edit `backend/src/services/elevenlabs.js`:

```javascript
this.voices = {
  // ... existing voices ...
  
  // Custom voices
  'collections_male': 'YOUR_VOICE_ID_HERE', // Professional male for collections
  'support_female': 'YOUR_VOICE_ID_HERE',   // Friendly female for support
};
```

### Step 2: Update Agent in Database

```javascript
// Run this script
const { Client } = require('./backend/node_modules/pg');

async function updateAgent() {
  const client = new Client({ 
    connectionString: 'postgresql://postgres:U1rw29AqFQPvJLse@db.hzxubnyehbrsqmzciixf.supabase.co:5432/postgres' 
  });
  
  await client.connect();
  
  // Update to custom voice
  await client.query(`
    UPDATE agents 
    SET elevenlabs_voice = $1
    WHERE name = $2
  `, ['collections_male', 'Will - Collections Agent']);
  
  await client.end();
}

updateAgent();
```

### Step 3: Deploy

```bash
cd /Users/dduncan/CascadeProjects/windsurf-project/backend
/Users/dduncan/.fly/bin/flyctl deploy --remote-only -a globalvoice-backend
```

---

## Voice Settings for Different Use Cases

### Collections Agent (Firm but Fair)
```javascript
{
  stability: 0.4,        // Slightly more expressive
  similarity_boost: 0.8, // High voice matching
  style: 0.2,           // Subtle style
  use_speaker_boost: true
}
```

### Customer Service (Warm and Friendly)
```javascript
{
  stability: 0.3,        // Very expressive
  similarity_boost: 0.75,
  style: 0.4,           // More natural style
  use_speaker_boost: true
}
```

### Professional/Technical (Clear and Precise)
```javascript
{
  stability: 0.6,        // More stable
  similarity_boost: 0.7,
  style: 0.1,           // Minimal style
  use_speaker_boost: true
}
```

---

## Testing Your Custom Voices

### Quick Test Script

```javascript
const ElevenLabsService = require('./backend/src/services/elevenlabs');

async function testVoice() {
  const service = new ElevenLabsService();
  
  const testText = "Hello, this is a test of the custom voice. How does it sound?";
  
  // Test your custom voice
  const audio = await service.textToSpeech(testText, 'YOUR_VOICE_ID');
  
  // Save to file
  const fs = require('fs');
  fs.writeFileSync('test-voice.mp3', audio);
  
  console.log('Test audio saved to test-voice.mp3');
}

testVoice();
```

---

## Recommended Voice Combinations

### Setup 1: Professional Collections
- **Male (Primary)**: Will or custom professional male
- **Female (Backup)**: Rachel or custom professional female
- **Use Case**: Collections, payment reminders

### Setup 2: Customer Service
- **Female (Primary)**: Custom warm female or Bella
- **Male (Backup)**: Antoni or custom friendly male
- **Use Case**: Support, general inquiries

### Setup 3: Mixed Team
- **Collections Male**: Custom professional
- **Collections Female**: Domi (strong, professional)
- **Support Female**: Custom warm
- **Support Male**: Antoni (well-rounded)

---

## Cost Comparison

### Using Pre-built Voices (Current)
- **Free Tier**: 10,000 chars/month (~20-30 calls)
- **Creator**: $22/month (100k chars, ~200-300 calls)
- **Pro**: $99/month (500k chars, ~1000-1500 calls)

### With Custom Voices
- **Same pricing** as pre-built voices
- **Voice Design**: Included in Creator plan
- **Instant Cloning**: Included in Creator plan
- **Professional Cloning**: Requires Pro plan ($99/month)

### Development Mode (Current Setup)
- **50% token cost reduction**
- Uses Turbo v2.5 model
- Excellent quality for testing
- Switch to production model when ready

---

## Next Steps

1. ✅ **Test Will's voice** - Call +1 (817) 541-7385
2. **Create custom male voice** using Voice Design
3. **Create custom female voice** using Voice Design
4. **Add voice IDs** to backend
5. **Create second agent** with female voice
6. **Test both agents** side by side
7. **Choose best voices** for production

---

## Support Resources

- **ElevenLabs Voice Lab**: https://elevenlabs.io/voice-lab
- **Voice Library**: https://elevenlabs.io/voice-library
- **API Docs**: https://elevenlabs.io/docs
- **Pricing**: https://elevenlabs.io/pricing

---

## Current Status

✅ **Will voice active** with conversational settings
✅ **Development mode** enabled (50% cost savings)
✅ **Backend deployed** with updated voice settings
✅ **Ready to test** - Call now!

**Next:** Create 2 custom voices (1 male, 1 female) for A/B testing
