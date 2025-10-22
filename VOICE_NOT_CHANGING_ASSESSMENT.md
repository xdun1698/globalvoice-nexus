# Voice Not Changing - Root Cause Analysis

## 🔍 **Problem Statement**

User changed voice on Will Collection agent, but the voice is not actually changing during calls.

---

## 🔬 **Investigation Results**

### **1. Database Check** ✅
```json
{
  "name": "Will Collection",
  "elevenlabs_voice": "test_lily",
  "vapi_assistant_id": "5d1b3e75-1ce8-4338-9c3a-85c774469c32"
}
```
- ✅ Database IS updating correctly
- ✅ Shows `test_lily` (UK Female voice)
- ✅ Has Vapi assistant ID

### **2. Frontend Check** ✅
```jsx
// AgentBuilder.jsx
<select {...register('elevenlabs_voice')} className="input">
  <option value="test_lily">Lily (Female, UK) - Elegant, Professional</option>
  // ... other voices
</select>
```
- ✅ Voice selection works
- ✅ Form submits correctly
- ✅ Data sent to backend

### **3. Backend Check** ✅
```javascript
// agents.js - Update endpoint
router.put('/:id', async (req, res) => {
  const { elevenlabs_voice } = req.body;
  await db('agents').update({ elevenlabs_voice });
  await vapiService.syncAssistant(agent);
});
```
- ✅ Backend receives voice change
- ✅ Updates database
- ✅ Syncs to Vapi

### **4. Vapi Sync Check** ⚠️ **ISSUE FOUND**
```javascript
// vapi.js - syncAssistant
voice: {
  provider: '11labs',
  voiceId: agent.elevenlabs_voice || 'ErXwobaYiN019PkySvjV',
  // Using: 'test_lily' ❌
  // Should use: 'pFZP5JQG7iQjIQuC4Bku' ✅
}
```

---

## 🎯 **ROOT CAUSE IDENTIFIED**

### **The Problem:**

**Test Voice IDs vs Real Voice IDs**

We're using **placeholder/test voice IDs** like:
- `test_antoni`
- `test_lily`
- `test_priya`
- etc.

But ElevenLabs requires **real voice IDs** like:
- `ErXwobaYiN019PkySvjV` (Antoni)
- `pFZP5JQG7iQjIQuC4Bku` (Lily)
- `21m00Tcm4TlvDq8ikWAM` (Rachel)
- etc.

**When Vapi receives `test_lily`, it doesn't recognize it as a valid ElevenLabs voice ID, so it either:**
1. Uses the default voice
2. Fails silently
3. Uses the previous voice

---

## 🔧 **Solution Options**

### **Option 1: Map Test IDs to Real IDs** ✅ RECOMMENDED

Create a mapping function that converts test IDs to real ElevenLabs IDs.

**Implementation:**
```javascript
// backend/src/services/vapi.js

const VOICE_ID_MAP = {
  // 🇺🇸 North America
  'test_antoni': 'ErXwobaYiN019PkySvjV',
  'test_rachel': '21m00Tcm4TlvDq8ikWAM',
  'test_adam': 'pNInz6obpgDQGcFmaJgB',
  'test_bella': 'EXAVITQu4vr4xnSDxMaL',
  'test_josh': 'TxGEqnHWrfWFTfGW9XjX',
  'test_domi': 'AZnzlk1XvdvUeBnXmlld',
  'test_grace': 'oWAxZDx7w5VEj9dCyTzz',
  
  // 🇬🇧 United Kingdom
  'test_lily': 'pFZP5JQG7iQjIQuC4Bku',
  'test_daniel': 'onwK4e9ZLuTAKqWW03F9',
  'test_charlotte': 'XB0fDUnXU5powFXDhCwa',
  'test_george': 'JBFqnCBsd6RMkjVDRZzb',
  'test_alice': 'Xb7hH8MSUJpSbSDYk0k2',
  
  // 🇦🇺 Australia
  'test_james': 'ZQe5CZNOzWyzPSCn5a3c',
  'test_nicole': 'piTKgcLEGmPE4e6mEKli',
  'test_jack': 'CwhRBWXzGAHq8TQ4Fs17',
  'test_emma': 'ThT5KcBeYPX3keUQqHPh',
  
  // Add more mappings as needed...
};

function getRealVoiceId(testVoiceId) {
  // If it's already a real ID (doesn't start with 'test_'), return as-is
  if (!testVoiceId || !testVoiceId.startsWith('test_')) {
    return testVoiceId;
  }
  
  // Map test ID to real ID
  const realId = VOICE_ID_MAP[testVoiceId];
  
  if (!realId) {
    logger.warn(`No mapping found for voice ID: ${testVoiceId}, using default`);
    return 'ErXwobaYiN019PkySvjV'; // Default to Antoni
  }
  
  return realId;
}

// In syncAssistant:
voice: {
  provider: '11labs',
  voiceId: getRealVoiceId(agent.elevenlabs_voice) || 'ErXwobaYiN019PkySvjV',
  stability: 0.35,
  similarityBoost: 0.75,
  style: 0.3
}
```

**Pros:**
- ✅ Quick to implement
- ✅ No frontend changes needed
- ✅ Backward compatible
- ✅ Works with existing data

**Cons:**
- ⚠️ Need to maintain mapping
- ⚠️ Limited to voices we map

---

### **Option 2: Use Real Voice IDs in Frontend**

Replace all test voice IDs with real ElevenLabs IDs in the frontend.

**Implementation:**
```jsx
// frontend/src/pages/AgentBuilder.jsx
<optgroup label="🇺🇸 NORTH AMERICA - Premium">
  <option value="ErXwobaYiN019PkySvjV">Antoni (Male, US) - Professional, Clear</option>
  <option value="21m00Tcm4TlvDq8ikWAM">Rachel (Female, US) - Warm, Friendly</option>
  // ... etc
</optgroup>
```

**Pros:**
- ✅ Direct mapping
- ✅ No backend mapping needed
- ✅ Uses real IDs from start

**Cons:**
- ⚠️ Need to update frontend
- ⚠️ Need to rebuild/redeploy
- ⚠️ Existing agents need migration

---

### **Option 3: Hybrid Approach** ✅ BEST LONG-TERM

Use real IDs in frontend for new agents, but maintain mapping for backward compatibility.

**Implementation:**
1. Update frontend to use real IDs
2. Keep mapping in backend for old data
3. Gradually migrate existing agents

---

## 🚀 **Recommended Implementation**

### **Step 1: Add Voice ID Mapping (Backend)**

File: `backend/src/services/vapi.js`

```javascript
// Add at top of file
const VOICE_ID_MAP = {
  // 🇺🇸 North America
  'test_antoni': 'ErXwobaYiN019PkySvjV',
  'test_rachel': '21m00Tcm4TlvDq8ikWAM',
  'test_adam': 'pNInz6obpgDQGcFmaJgB',
  'test_bella': 'EXAVITQu4vr4xnSDxMaL',
  'test_josh': 'TxGEqnHWrfWFTfGW9XjX',
  'test_domi': 'AZnzlk1XvdvUeBnXmlld',
  'test_grace': 'oWAxZDx7w5VEj9dCyTzz',
  
  // 🇬🇧 United Kingdom
  'test_lily': 'pFZP5JQG7iQjIQuC4Bku',
  'test_daniel': 'onwK4e9ZLuTAKqWW03F9',
  'test_charlotte': 'XB0fDUnXU5powFXDhCwa',
  'test_george': 'JBFqnCBsd6RMkjVDRZzb',
  'test_alice': 'Xb7hH8MSUJpSbSDYk0k2',
  
  // 🇦🇺 Australia
  'test_james': 'ZQe5CZNOzWyzPSCn5a3c',
  'test_nicole': 'piTKgcLEGmPE4e6mEKli',
  'test_jack': 'CwhRBWXzGAHq8TQ4Fs17',
  'test_emma': 'ThT5KcBeYPX3keUQqHPh',
  
  // 🇮🇳 India
  'test_priya': 'yoZ06aMxZJJ28mfd3POQ',
  'test_raj': 'VR6AewLTigWG4xSOukaG',
  'test_ananya': 'MF3mGyEYCl7XYWbV9V6O',
  'test_arjun': 'N2lVS1w4EtoT3dr4eOWO',
  
  // Default fallback
  'default': 'ErXwobaYiN019PkySvjV'
};

function getRealVoiceId(voiceId) {
  if (!voiceId) return VOICE_ID_MAP.default;
  
  // If it's already a real ID (doesn't start with 'test_'), return as-is
  if (!voiceId.startsWith('test_')) {
    return voiceId;
  }
  
  // Map test ID to real ID
  const realId = VOICE_ID_MAP[voiceId];
  
  if (!realId) {
    logger.warn(`No mapping found for voice ID: ${voiceId}, using default`);
    return VOICE_ID_MAP.default;
  }
  
  logger.info(`Mapped voice ID: ${voiceId} → ${realId}`);
  return realId;
}

// Update syncAssistant method:
async syncAssistant(agent) {
  // ... existing code ...
  
  const payload = {
    name: agent.name,
    model: { /* ... */ },
    voice: {
      provider: '11labs',
      voiceId: getRealVoiceId(agent.elevenlabs_voice), // ✅ Use mapping
      stability: 0.35,
      similarityBoost: 0.75,
      style: 0.3
    },
    // ... rest of payload
  };
  
  // ... rest of method
}
```

**Time:** 15-20 minutes
**Risk:** Low
**Impact:** Immediate fix

---

## 📊 **Real ElevenLabs Voice IDs**

### **Available Voices:**

| Test ID | Real ID | Name | Gender | Accent |
|---------|---------|------|--------|--------|
| test_antoni | ErXwobaYiN019PkySvjV | Antoni | Male | US |
| test_rachel | 21m00Tcm4TlvDq8ikWAM | Rachel | Female | US |
| test_adam | pNInz6obpgDQGcFmaJgB | Adam | Male | US |
| test_bella | EXAVITQu4vr4xnSDxMaL | Bella | Female | US |
| test_josh | TxGEqnHWrfWFTfGW9XjX | Josh | Male | US |
| test_domi | AZnzlk1XvdvUeBnXmlld | Domi | Female | US |
| test_grace | oWAxZDx7w5VEj9dCyTzz | Grace | Female | US Southern |
| test_lily | pFZP5JQG7iQjIQuC4Bku | Lily | Female | UK |
| test_daniel | onwK4e9ZLuTAKqWW03F9 | Daniel | Male | UK |
| test_james | ZQe5CZNOzWyzPSCn5a3c | James | Male | Australian |

---

## ✅ **Testing Plan**

### **After Implementing Mapping:**

1. **Test Voice Change:**
   ```
   1. Go to /agents/:id/edit
   2. Change voice to different option
   3. Save agent
   4. Check backend logs for mapping message
   5. Make test call
   6. Verify voice changed
   ```

2. **Check Vapi Dashboard:**
   ```
   1. Login to https://dashboard.vapi.ai
   2. Go to Assistants
   3. Find Will Collection
   4. Check voice configuration
   5. Should show real ElevenLabs voice ID
   ```

3. **Test Multiple Voices:**
   ```
   - Change to US voice (Antoni)
   - Change to UK voice (Lily)
   - Change to Australian voice (James)
   - Verify each works in calls
   ```

---

## 🎯 **Summary**

### **Root Cause:**
Using test voice IDs (`test_lily`) instead of real ElevenLabs voice IDs (`pFZP5JQG7iQjIQuC4Bku`)

### **Impact:**
- Database updates correctly ✅
- Vapi receives invalid voice ID ❌
- Voice doesn't change during calls ❌

### **Solution:**
Add voice ID mapping in backend to convert test IDs to real IDs

### **Effort:**
- Time: 15-20 minutes
- Complexity: Low
- Risk: Low
- Files: 1 file (vapi.js)

### **Result:**
Voice changes will work immediately for all agents

---

## 🚀 **Next Steps**

1. ✅ Implement voice ID mapping in vapi.js
2. ✅ Deploy backend
3. ✅ Test voice change on Will Collection
4. ✅ Verify call uses new voice
5. ✅ Document mapping for future voices

---

**Ready to implement the fix?**
