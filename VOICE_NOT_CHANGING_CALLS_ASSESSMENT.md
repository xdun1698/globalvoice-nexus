# Voice Not Changing During Calls - Root Cause Analysis

## 🔍 **Problem Statement**

Voice changes save in the UI and database, but test calls still use the old voice.

---

## 🔬 **Investigation Results**

### **1. Database Check** ✅
```json
{
  "name": "Will Collection",
  "elevenlabs_voice": "test_antoni",
  "vapi_assistant_id": "5d1b3e75-1ce8-4338-9c3a-85c774469c32"
}
```
- ✅ Database updated correctly
- ✅ Shows Antoni voice (test_antoni)

### **2. Vapi Assistant Check** ✅
```bash
curl https://api.vapi.ai/assistant/5d1b3e75-1ce8-4338-9c3a-85c774469c32
```
```json
{
  "name": "Will Collection",
  "voice": {
    "voiceId": "ErXwobaYiN019PkySvjV",  // Antoni - Correct! ✅
    "provider": "11labs"
  }
}
```
- ✅ Vapi assistant updated correctly
- ✅ Voice ID mapping working (test_antoni → ErXwobaYiN019PkySvjV)

### **3. Phone Number Check** ❌ **ISSUE FOUND**
```bash
curl https://api.vapi.ai/phone-number
```
```json
[
  {
    "number": "+19724741424",
    "assistantId": "0d53a102-a879-4653-b483-1d83add506fb"  // ❌ Wrong ID!
  },
  {
    "number": "+16826269224",
    "assistantId": "92806588-9a07-4105-9b85-edb2913da4ec"  // ❌ Wrong ID!
  }
]
```

### **4. All Vapi Assistants** ⚠️ **DUPLICATES FOUND**
```json
[
  {
    "id": "5d1b3e75-1ce8-4338-9c3a-85c774469c32",
    "name": "Will Collection",
    "voiceId": "ErXwobaYiN019PkySvjV"  // ✅ Antoni (NEW/UPDATED)
  },
  {
    "id": "92806588-9a07-4105-9b85-edb2913da4ec",
    "name": "Will Collection",
    "voiceId": "bIHbv24MWmeRgasZH58o"  // ❌ Old voice (DUPLICATE)
  },
  {
    "id": "e5598ae1-a682-4b2c-910a-4c2f715ab32b",
    "name": "Shannan Collection",
    "voiceId": "Ky9j3wxFbp3dSAdrkOEv"  // ✅ Emily (NEW/UPDATED)
  },
  {
    "id": "0d53a102-a879-4653-b483-1d83add506fb",
    "name": "Shannan Collection",
    "voiceId": "Ky9j3wxFbp3dSAdrkOEv"  // ❌ Old voice (DUPLICATE)
  }
]
```

---

## 🎯 **ROOT CAUSE IDENTIFIED**

### **The Problem:**

**Duplicate Assistants in Vapi + Phone Numbers Point to Wrong Ones**

**What's Happening:**
1. Database has correct assistant IDs
2. We update the correct assistants in Vapi ✅
3. BUT phone numbers are assigned to **different/duplicate** assistants ❌
4. When you call, it uses the duplicate assistant with old voice ❌

**Visual Representation:**
```
Database:
  Will Collection → 5d1b3e75... (Voice: Antoni ✅)
  
Vapi Assistants:
  5d1b3e75... → Will Collection (Voice: Antoni ✅) [UPDATED]
  92806588... → Will Collection (Voice: Old) [DUPLICATE - NOT UPDATED]
  
Vapi Phone Numbers:
  972-474-1424 → 92806588... ❌ WRONG! Should be 5d1b3e75...
  
When you call 972-474-1424:
  → Routes to 92806588... (duplicate)
  → Uses old voice ❌
```

---

## 🔧 **Solution Options**

### **Option 1: Update Phone Number Assignments** ✅ RECOMMENDED

Update Vapi phone numbers to point to the correct assistant IDs.

**Implementation:**
```bash
# Update phone 972-474-1424 to point to Will Collection (correct ID)
curl -X PATCH https://api.vapi.ai/phone-number/{phone_id} \
  -H "Authorization: Bearer $VAPI_PRIVATE_KEY" \
  -d '{"assistantId": "5d1b3e75-1ce8-4338-9c3a-85c774469c32"}'

# Update phone 682-626-9224 to point to Shannan Collection (correct ID)
curl -X PATCH https://api.vapi.ai/phone-number/{phone_id} \
  -H "Authorization: Bearer $VAPI_PRIVATE_KEY" \
  -d '{"assistantId": "e5598ae1-a682-4b2c-910a-4c2f715ab32b"}'
```

**Pros:**
- ✅ Quick fix (5 minutes)
- ✅ No code changes needed
- ✅ Immediate effect

**Cons:**
- ⚠️ Manual process
- ⚠️ Doesn't prevent future duplicates

---

### **Option 2: Delete Duplicate Assistants + Update Phone Numbers**

Clean up Vapi by removing duplicates and fixing phone assignments.

**Implementation:**
```bash
# Delete duplicate assistants
curl -X DELETE https://api.vapi.ai/assistant/92806588-9a07-4105-9b85-edb2913da4ec
curl -X DELETE https://api.vapi.ai/assistant/0d53a102-a879-4653-b483-1d83add506fb

# Update phone numbers to correct assistants
# (same as Option 1)
```

**Pros:**
- ✅ Cleans up Vapi
- ✅ Prevents confusion
- ✅ Better long-term

**Cons:**
- ⚠️ Need to identify phone IDs first
- ⚠️ More steps

---

### **Option 3: Automated Phone Number Sync** ✅ BEST LONG-TERM

Add code to automatically sync phone numbers to correct assistants.

**Implementation:**
```javascript
// backend/src/services/vapi.js

async syncPhoneNumberToAssistant(phoneNumber, assistantId) {
  try {
    // Get phone number ID from Vapi
    const phones = await axios.get(`${this.baseUrl}/phone-number`, {
      headers: { 'Authorization': `Bearer ${this.apiKey}` }
    });
    
    const phone = phones.data.find(p => p.number === phoneNumber);
    
    if (phone) {
      // Update phone to point to correct assistant
      await axios.patch(
        `${this.baseUrl}/phone-number/${phone.id}`,
        { assistantId },
        { headers: { 'Authorization': `Bearer ${this.apiKey}` } }
      );
      
      logger.info(`Phone ${phoneNumber} synced to assistant ${assistantId}`);
    }
  } catch (error) {
    logger.error('Failed to sync phone number:', error);
  }
}

// Call this after syncing assistant
async syncAssistant(agent) {
  // ... existing sync code ...
  
  // Also sync phone numbers
  if (agent.phone_numbers && agent.phone_numbers.length > 0) {
    for (const phone of agent.phone_numbers) {
      await this.syncPhoneNumberToAssistant(phone.number, agent.vapi_assistant_id);
    }
  }
}
```

**Pros:**
- ✅ Automatic
- ✅ Prevents future issues
- ✅ Comprehensive solution

**Cons:**
- ⚠️ Requires code changes
- ⚠️ Need to deploy

---

## 🚀 **Immediate Fix (Recommended)**

### **Step 1: Get Phone Number IDs**
```bash
curl -s https://api.vapi.ai/phone-number \
  -H "Authorization: Bearer 340a3e25-d52c-46cd-a36c-1d12b9163393" \
  | jq '.[] | {id, number, assistantId}'
```

### **Step 2: Update Phone Numbers**

**For Will Collection (972-474-1424):**
```bash
# Get phone ID from step 1, then:
curl -X PATCH https://api.vapi.ai/phone-number/{PHONE_ID} \
  -H "Authorization: Bearer 340a3e25-d52c-46cd-a36c-1d12b9163393" \
  -H "Content-Type: application/json" \
  -d '{
    "assistantId": "5d1b3e75-1ce8-4338-9c3a-85c774469c32"
  }'
```

**For Shannan Collection (682-626-9224):**
```bash
# Get phone ID from step 1, then:
curl -X PATCH https://api.vapi.ai/phone-number/{PHONE_ID} \
  -H "Authorization: Bearer 340a3e25-d52c-46cd-a36c-1d12b9163393" \
  -H "Content-Type: application/json" \
  -d '{
    "assistantId": "e5598ae1-a682-4b2c-910a-4c2f715ab32b"
  }'
```

### **Step 3: Delete Duplicate Assistants** (Optional)
```bash
# Delete old Will Collection
curl -X DELETE https://api.vapi.ai/assistant/92806588-9a07-4105-9b85-edb2913da4ec \
  -H "Authorization: Bearer 340a3e25-d52c-46cd-a36c-1d12b9163393"

# Delete old Shannan Collection
curl -X DELETE https://api.vapi.ai/assistant/0d53a102-a879-4653-b483-1d83add506fb \
  -H "Authorization: Bearer 340a3e25-d52c-46cd-a36c-1d12b9163393"
```

### **Step 4: Test**
```bash
# Call 972-474-1424
# Should now use Will Collection with Antoni voice ✅
```

---

## 📊 **Current State vs Desired State**

### **Current State:**
```
Phone: 972-474-1424
  ↓
Assistant: 92806588... (Duplicate Will Collection)
  ↓
Voice: bIHbv24MWmeRgasZH58o (Old voice) ❌
```

### **Desired State:**
```
Phone: 972-474-1424
  ↓
Assistant: 5d1b3e75... (Real Will Collection)
  ↓
Voice: ErXwobaYiN019PkySvjV (Antoni) ✅
```

---

## 🔍 **Why Duplicates Exist**

### **Possible Causes:**

1. **Multiple Syncs:**
   - Agent created → Vapi assistant created
   - Agent updated → New Vapi assistant created (instead of updating)
   - Result: 2 assistants with same name

2. **Manual Creation:**
   - Assistants created manually in Vapi dashboard
   - Then synced from application
   - Result: Duplicates

3. **Sync Logic Issue:**
   - Code creates new assistant instead of updating existing
   - Missing vapi_assistant_id in database
   - Result: Multiple assistants per agent

---

## 🛠️ **Prevention Strategy**

### **Update Sync Logic:**

```javascript
// backend/src/routes/agents.js

router.put('/:id', async (req, res) => {
  // ... update database ...
  
  // Sync to Vapi
  try {
    if (agent.vapi_assistant_id) {
      // UPDATE existing assistant
      await vapiService.updateAssistant(agent.vapi_assistant_id, agent);
    } else {
      // CREATE new assistant
      const vapiAssistant = await vapiService.createAssistant(agent);
      
      // Save vapi_assistant_id to database
      await db('agents')
        .where({ id: agent.id })
        .update({ vapi_assistant_id: vapiAssistant.id });
    }
    
    // ALSO sync phone numbers
    await vapiService.syncPhoneNumbers(agent);
    
  } catch (error) {
    logger.error('Vapi sync failed:', error);
  }
});
```

---

## ✅ **Testing Checklist**

### **After Fixing Phone Numbers:**

- [ ] Get phone number IDs from Vapi
- [ ] Update 972-474-1424 to point to Will (5d1b3e75...)
- [ ] Update 682-626-9224 to point to Shannan (e5598ae1...)
- [ ] Delete duplicate assistants
- [ ] Call 972-474-1424
- [ ] Verify Antoni voice is used
- [ ] Change voice in UI
- [ ] Call again
- [ ] Verify new voice is used

---

## 📋 **Summary**

### **Root Cause:**
Phone numbers in Vapi point to duplicate/old assistants, not the ones we're updating.

### **Why Voice Changes Don't Work:**
1. Database updates ✅
2. Correct assistant updates in Vapi ✅
3. Phone number still points to old assistant ❌
4. Calls use old assistant with old voice ❌

### **Immediate Fix:**
Update Vapi phone numbers to point to correct assistant IDs (5 minutes)

### **Long-term Fix:**
Add automatic phone number sync when agents update (1-2 hours)

### **Impact:**
- **Immediate:** Voice changes will work after phone number update
- **Long-term:** Prevents future phone number mismatches

---

## 🎯 **Next Steps**

1. ✅ Run commands to get phone IDs
2. ✅ Update phone numbers to correct assistants
3. ✅ Delete duplicate assistants
4. ✅ Test calls
5. ⚠️ Consider adding automated phone sync

---

**Ready to fix the phone number assignments?**
