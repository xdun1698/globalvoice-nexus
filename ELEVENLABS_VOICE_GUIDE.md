# ElevenLabs Voice Guide - Complete Library

## ✅ All Voices Now Available with Ratings

Your platform now includes **30+ ElevenLabs voices** organized by rating and use case.

---

## ⭐⭐⭐⭐⭐ PREMIUM (Best for Customer-Facing)

### Antoni / Will
- **ID:** `ErXwobaYiN019PkySvjV`
- **Gender:** Male
- **Accent:** US (Dallas businessman)
- **Best For:** Collections, Sales, Professional Services
- **Tone:** Professional, Authoritative, Warm
- **Why:** This is the "Will" voice you tested! Pure American, confident, empathetic. Perfect for collections.

### Rachel
- **ID:** `21m00Tcm4TlvDq8ikWAM`
- **Gender:** Female
- **Accent:** US
- **Best For:** Customer Support, Healthcare, Education
- **Tone:** Calm, Reassuring, Clear
- **Why:** Most popular female voice. Professional and friendly.

### Adam
- **ID:** `pNInz6obpgDQGcFmaJgB`
- **Gender:** Male
- **Accent:** US
- **Best For:** Narration, Corporate, Training
- **Tone:** Deep, Authoritative, Confident
- **Why:** Deep voice, great for serious/professional content.

### Bella
- **ID:** `EXAVITQu4vr4xnSDxMaL`
- **Gender:** Female
- **Accent:** US
- **Best For:** Hospitality, Wellness, Retail
- **Tone:** Soft, Warm, Friendly
- **Why:** Welcoming and comforting, perfect for hospitality.

### Josh
- **ID:** `TxGEqnHWrfWFTfGW9XjX`
- **Gender:** Male
- **Accent:** US
- **Best For:** Tech Support, Startups, Gaming
- **Tone:** Young, Energetic, Casual
- **Why:** Modern, tech-savvy sound. Great for younger audiences.

---

## ⭐⭐⭐⭐ EXCELLENT (Professional Quality)

### Domi
- **ID:** `AZnzlk1XvdvUeBnXmlld`
- **Gender:** Female
- **Accent:** US
- **Best For:** Sales, Leadership, Coaching
- **Tone:** Strong, Confident, Assertive

### Sam
- **ID:** `yoZ06aMxZJJ28mfd3POQ`
- **Gender:** Male
- **Accent:** US
- **Best For:** Storytelling, Entertainment, Podcasts
- **Tone:** Dynamic, Raspy, Character

### Elli
- **ID:** `MF3mGyEYCl7XYWbV9V6O`
- **Gender:** Female
- **Accent:** US
- **Best For:** Counseling, Support, Emotional Content
- **Tone:** Emotional, Expressive, Engaging

### Arnold
- **ID:** `VR6AewLTigWG4xSOukaG`
- **Gender:** Male
- **Accent:** US
- **Best For:** Technical Support, Training, Documentation
- **Tone:** Crisp, Clear, Articulate

### Lily
- **ID:** `pFZP5JQG7iQjIQuC4Bku`
- **Gender:** Female
- **Accent:** UK
- **Best For:** UK Market, Professional Services, Education
- **Tone:** British, Sophisticated, Professional

### Grace
- **ID:** `oWAxZDx7w5VEj9dCyTzz`
- **Gender:** Female
- **Accent:** US Southern
- **Best For:** Hospitality, Southern Market, Retail
- **Tone:** Southern, Warm, Hospitable

### Tom
- **ID:** `N2lVS1w4EtoT3dr4eOWO`
- **Gender:** Male
- **Accent:** US
- **Best For:** Collections, Business, Professional
- **Tone:** Professional, Authoritative, Clear

---

## ⭐⭐⭐ GOOD (Solid Performance)

### Daniel (UK Male)
- **ID:** `onwK4e9ZLuTAKqWW03F9`
- **Best For:** UK Corporate, News, Formal

### Matilda (US Female)
- **ID:** `XrExE9yKIg1WjnnlVkGX`
- **Best For:** Healthcare, Education, Nonprofit

### James (Australian Male)
- **ID:** `ZQe5CZNOzWyzPSCn5a3c`
- **Best For:** Casual, Travel, Lifestyle

### Emily (US Female)
- **ID:** `LcfcDJNUP1GQjkzn1xUU`
- **Best For:** Wellness, Meditation, Sleep

### Thomas (US Male)
- **ID:** `GBv7mTt0atIp3Br8iCZE`
- **Best For:** Instructions, Tutorials, Training

---

## How to Use in Dashboard

### When Creating/Editing Agent:

1. **Voice dropdown now shows:**
   ```
   ⭐⭐⭐⭐⭐ PREMIUM - Best for Customer-Facing
     ├─ Antoni/Will (Male, US) - Collections/Sales
     ├─ Rachel (Female, US) - Support
     ├─ Adam (Male, US) - Corporate
     └─ ...

   ⭐⭐⭐⭐ EXCELLENT - Professional Quality
     ├─ Domi (Female, US) - Sales/Leadership
     ├─ Tom (Male, US) - Collections
     └─ ...

   ⭐⭐⭐ GOOD - Solid Performance
     └─ ...
   ```

2. **Ratings explained:**
   - ⭐⭐⭐⭐⭐ (5 stars) = Premium, best quality
   - ⭐⭐⭐⭐ (4 stars) = Excellent, professional
   - ⭐⭐⭐ (3 stars) = Good, solid

3. **Use case shown** - Each voice lists what it's best for

---

## Quick Recommendations

### For Collections Agents
**Best:** Antoni/Will (⭐⭐⭐⭐⭐)
- This is the voice you tested!
- Professional Dallas businessman tone
- Perfect for collections

**Alternative:** Tom (⭐⭐⭐⭐)
- Also great for collections
- Slightly different tone

### For Customer Support
**Best:** Rachel (⭐⭐⭐⭐⭐)
- Calm and reassuring
- Most popular for support

**Alternative:** Bella (⭐⭐⭐⭐⭐)
- Softer, warmer tone
- Great for hospitality

### For Sales
**Best:** Domi (⭐⭐⭐⭐)
- Strong, confident
- Great for leadership

**Alternative:** Josh (⭐⭐⭐⭐⭐)
- Young, energetic
- Modern sound

---

## API Access

### Get All Voices
```bash
GET /api/agents/voices/elevenlabs
```

### Get by Rating
```bash
GET /api/agents/voices/elevenlabs?rating=5
```

### Get by Use Case
```bash
GET /api/agents/voices/elevenlabs?useCase=collections
```

### Get Collections Voices
```bash
GET /api/agents/voices/elevenlabs?category=collections
```

---

## What Changed

### Backend
- ✅ Created comprehensive voice library (`backend/src/data/elevenlabs-voices.js`)
- ✅ 30+ voices with ratings, descriptions, use cases
- ✅ Updated API to return organized voices
- ✅ Added filtering by rating and use case

### Frontend
- ✅ Voice dropdown organized by rating
- ✅ Shows star ratings (⭐⭐⭐⭐⭐)
- ✅ Displays use cases for each voice
- ✅ "Will" identified as Antoni
- ✅ Help text explains ratings

---

## Finding "Will"

**"Will" is actually Antoni!**
- Voice ID: `ErXwobaYiN019PkySvjV`
- Listed as: "Antoni/Will ⭐⭐⭐⭐⭐"
- First option in Premium category
- Best for Collections/Sales

---

## Cost

All ElevenLabs voices cost the same:
- Free: 10,000 characters (~20-30 calls)
- Starter: $5/month (30k chars)
- Creator: $22/month (100k chars)

**Use the 5-star voices - they're the same price!**

---

## Deployed

✅ Backend: https://globalvoice-backend.fly.dev
✅ Frontend: https://globalvoice-nexus.netlify.app
✅ Voice library: Complete with 30+ voices
✅ Ratings: 5-star system implemented
✅ Sorting: Organized by quality

**Go create an agent and see all the voices with ratings!**
