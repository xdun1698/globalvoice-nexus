# Vapi Test Call Assessment - Deep Dive

## 🔍 **Problem Statement**
Test call function does not work. Need to properly pass phone number to Vapi to make the call.

---

## 📊 **Current System Analysis**

### **1. Frontend (AgentsSimplified.jsx)**
```javascript
// Test Call Modal - Line 191
const makeTestCall = async () => {
  if (!testPhone.trim()) {
    toast.error('Please enter a phone number');
    return;
  }

  setTestingCall(true);
  try {
    await api.post(`/api/agents/${selectedAgent.id}/test-call`, {
      phoneNumber: testPhone  // ✅ Sending phone number
    });
    toast.success('Test call initiated!');
    setShowTestModal(false);
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to initiate test call');
  } finally {
    setTestingCall(false);
  }
}
```
**Status:** ✅ Frontend correctly sends phoneNumber

---

### **2. Backend Endpoint (agents.js)**
```javascript
// POST /api/agents/:id/test-call
router.post('/:id/test-call', async (req, res) => {
  try {
    const { phoneNumber } = req.body;  // ✅ Receives phone number
    
    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const agent = await db('agents')
      .where({ id: req.params.id, user_id: req.user.id })
      .first();

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    if (!agent.vapi_assistant_id) {
      return res.status(400).json({ 
        error: 'Agent not synced with Vapi.' 
      });
    }

    // Make outbound call via Vapi
    const callResult = await vapiService.makeOutboundCall({
      assistantId: agent.vapi_assistant_id,
      phoneNumber: phoneNumber,  // ✅ Passing phone number
      name: `Test call for ${agent.name}`
    });

    res.json({ 
      success: true,
      message: 'Test call initiated successfully',
      callId: callResult.id
    });
  } catch (error) {
    logger.error('Error making test call:', error);
    res.status(500).json({ 
      error: 'Failed to initiate test call',
      message: error.message 
    });
  }
});
```
**Status:** ✅ Backend correctly receives and passes phoneNumber

---

### **3. Vapi Service (vapi.js)**
```javascript
// makeOutboundCall method
async makeOutboundCall({ assistantId, phoneNumber, name, customerData = {} }) {
  return this.makeCall(assistantId, phoneNumber, { name, ...customerData });
}

// makeCall method
async makeCall(assistantId, phoneNumber, customerData = {}) {
  if (!this.apiKey) {
    throw new Error('Vapi API key not configured');
  }

  try {
    // Get a phone number to call FROM
    const phoneNumbers = await this.getPhoneNumbers();
    if (phoneNumbers.length === 0) {
      throw new Error('No phone numbers available in Vapi.');
    }
    
    const fromPhoneNumber = phoneNumbers[0];
    
    const response = await axios.post(
      `${this.baseUrl}/call`,
      {
        assistantId: assistantId,
        phoneNumberId: fromPhoneNumber.id,  // Phone to call FROM
        customer: {
          number: phoneNumber,  // ✅ Phone to call TO
          ...customerData
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    logger.info(`Initiated Vapi call: ${response.data.id}`);
    return response.data;
  } catch (error) {
    logger.error('Error making Vapi call:', error.response?.data || error.message);
    throw error;
  }
}
```
**Status:** ✅ Service correctly passes phoneNumber to Vapi

---

## 🔍 **Vapi API Requirements**

### **Correct Vapi Call Payload:**
```json
{
  "assistantId": "5d1b3e75-1ce8-4338-9c3a-85c774469c32",
  "phoneNumberId": "17cad39a-5152-4fd5-ac06-cc968fd41701",
  "customer": {
    "number": "+15551234567"
  }
}
```

### **What Each Field Means:**
- `assistantId`: Which AI agent to use (✅ We have this)
- `phoneNumberId`: Which phone number to call FROM (✅ We fetch this)
- `customer.number`: Which phone number to call TO (✅ We pass this)

---

## 🔍 **Potential Issues**

### **Issue #1: Phone Number Format**
**Problem:** Vapi may require specific phone number format

**Current:** User can enter any format
- `555-123-4567`
- `(555) 123-4567`
- `+1 555 123 4567`
- `5551234567`

**Vapi Expects:** E.164 format
- `+15551234567`

**Solution:** Format phone number before sending to Vapi

---

### **Issue #2: Vapi API Endpoint**
**Current:** `https://api.vapi.ai/call`

**Verify:** Is this the correct endpoint?
- Outbound calls: `POST /call`
- Or: `POST /calls` (plural)?

**Need to check:** Vapi API documentation

---

### **Issue #3: Phone Number Availability**
**Problem:** `getPhoneNumbers()` might return empty array

**Current Check:**
```javascript
if (phoneNumbers.length === 0) {
  throw new Error('No phone numbers available in Vapi.');
}
```

**Verify:**
- Are phone numbers actually in Vapi?
- Do they have correct permissions?
- Are they verified/active?

---

### **Issue #4: Assistant Configuration**
**Problem:** Assistant might not be configured for outbound calls

**Vapi Requirements:**
- Assistant must exist
- Assistant must have voice configured
- Assistant must have model configured
- Assistant must have permissions for outbound calls

**Current Agent Config:**
```javascript
{
  name: "Will Collection",
  vapi_assistant_id: "5d1b3e75-1ce8-4338-9c3a-85c774469c32",
  elevenlabs_voice: "bIHbv24MWmeRgasZH58o",
  personality: "...",
  system_prompt: "..."
}
```

---

## 🔧 **Diagnostic Steps**

### **Step 1: Check Vapi API Keys**
```bash
# In production
flyctl ssh console -a globalvoice-backend
echo $VAPI_PRIVATE_KEY
echo $VAPI_PUBLIC_KEY
```

**Expected:**
- VAPI_PRIVATE_KEY: `340a3e25-d52c-46cd-a36c-1d12b9163393`
- VAPI_PUBLIC_KEY: `c92dd79e-fc10-47a9-b650-eb6586987933`

---

### **Step 2: Test Vapi Connection**
```javascript
// Test script
const axios = require('axios');

async function testVapiConnection() {
  try {
    const response = await axios.get(
      'https://api.vapi.ai/assistant',
      {
        headers: {
          'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`
        }
      }
    );
    console.log('✅ Vapi connection working');
    console.log('Assistants:', response.data);
  } catch (error) {
    console.log('❌ Vapi connection failed');
    console.log('Error:', error.response?.data || error.message);
  }
}
```

---

### **Step 3: Check Phone Numbers in Vapi**
```javascript
async function checkVapiPhones() {
  try {
    const response = await axios.get(
      'https://api.vapi.ai/phone-number',
      {
        headers: {
          'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`
        }
      }
    );
    console.log('✅ Phone numbers in Vapi:', response.data.length);
    response.data.forEach(phone => {
      console.log(`  - ${phone.number} (ID: ${phone.id})`);
    });
  } catch (error) {
    console.log('❌ Failed to get phone numbers');
    console.log('Error:', error.response?.data || error.message);
  }
}
```

---

### **Step 4: Test Actual Call**
```javascript
async function testVapiCall() {
  try {
    const response = await axios.post(
      'https://api.vapi.ai/call',
      {
        assistantId: '5d1b3e75-1ce8-4338-9c3a-85c774469c32',
        phoneNumberId: '17cad39a-5152-4fd5-ac06-cc968fd41701',
        customer: {
          number: '+15551234567'  // YOUR TEST NUMBER
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('✅ Call initiated!');
    console.log('Call ID:', response.data.id);
    console.log('Status:', response.data.status);
  } catch (error) {
    console.log('❌ Call failed');
    console.log('Error:', error.response?.data || error.message);
    console.log('Full error:', JSON.stringify(error.response?.data, null, 2));
  }
}
```

---

## 🔧 **Likely Fixes Needed**

### **Fix #1: Phone Number Formatting**
```javascript
// Add to backend/src/routes/agents.js
function formatPhoneNumber(phone) {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Add +1 if not present (US numbers)
  if (digits.length === 10) {
    return `+1${digits}`;
  } else if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }
  
  return phone; // Return as-is if already formatted
}

// In test-call endpoint
const formattedPhone = formatPhoneNumber(phoneNumber);
const callResult = await vapiService.makeOutboundCall({
  assistantId: agent.vapi_assistant_id,
  phoneNumber: formattedPhone,  // Use formatted number
  name: `Test call for ${agent.name}`
});
```

---

### **Fix #2: Better Error Handling**
```javascript
// In vapi.js makeCall method
try {
  const response = await axios.post(...);
  return response.data;
} catch (error) {
  // Log detailed error
  logger.error('Vapi call failed:', {
    status: error.response?.status,
    statusText: error.response?.statusText,
    data: error.response?.data,
    message: error.message
  });
  
  // Throw user-friendly error
  if (error.response?.data?.message) {
    throw new Error(`Vapi error: ${error.response.data.message}`);
  } else {
    throw new Error(`Failed to initiate call: ${error.message}`);
  }
}
```

---

### **Fix #3: Validate Phone Number**
```javascript
// Add validation in test-call endpoint
function isValidPhoneNumber(phone) {
  // Remove non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Check length (10 or 11 digits for US)
  return digits.length === 10 || digits.length === 11;
}

if (!isValidPhoneNumber(phoneNumber)) {
  return res.status(400).json({ 
    error: 'Invalid phone number format. Please use format: +1 (555) 123-4567' 
  });
}
```

---

### **Fix #4: Check Vapi Phone Number Permissions**
```javascript
// In makeCall method, verify phone number is active
const phoneNumbers = await this.getPhoneNumbers();
const activePhones = phoneNumbers.filter(p => p.status === 'active');

if (activePhones.length === 0) {
  throw new Error('No active phone numbers available in Vapi.');
}

const fromPhoneNumber = activePhones[0];
```

---

## 🎯 **Most Likely Issue**

Based on the code review, the **most likely issue** is:

### **Phone Number Format**
Vapi requires E.164 format (`+15551234567`) but users might enter:
- `555-123-4567`
- `(555) 123-4567`
- `5551234567`

**Solution:** Format phone number before sending to Vapi

---

## 🔍 **Testing Strategy**

### **Test 1: Check Logs**
```bash
flyctl logs -a globalvoice-backend
```
Look for:
- "Making test call for agent..."
- "Error making Vapi call..."
- Vapi error response details

### **Test 2: Test with Formatted Number**
Try entering phone number in exact E.164 format:
- `+15551234567` (no spaces, dashes, or parentheses)

### **Test 3: Check Vapi Dashboard**
1. Login to https://dashboard.vapi.ai
2. Check Assistants - verify Will & Shannan exist
3. Check Phone Numbers - verify they're active
4. Check Call Logs - see if any calls attempted

---

## 📋 **Action Items**

### **Immediate Actions:**
1. ✅ Add phone number formatting
2. ✅ Add phone number validation
3. ✅ Enhance error logging
4. ✅ Test with formatted number
5. ✅ Check Vapi dashboard

### **Verification:**
1. Check backend logs for exact error
2. Verify Vapi API endpoint is correct
3. Verify phone numbers are active in Vapi
4. Test call with E.164 formatted number

---

## 🔧 **Implementation Plan**

### **Step 1: Add Phone Formatting**
File: `backend/src/routes/agents.js`
- Add `formatPhoneNumber()` function
- Format phone before passing to Vapi

### **Step 2: Add Validation**
File: `backend/src/routes/agents.js`
- Add `isValidPhoneNumber()` function
- Validate before making call

### **Step 3: Enhance Logging**
File: `backend/src/services/vapi.js`
- Log full Vapi error response
- Log request payload

### **Step 4: Test**
- Deploy changes
- Test with various phone formats
- Check logs for errors
- Verify call is received

---

## 🎯 **Expected Outcome**

After implementing fixes:
1. ✅ User enters phone in any format
2. ✅ Backend formats to E.164
3. ✅ Backend validates format
4. ✅ Vapi receives correct format
5. ✅ Call is initiated successfully
6. ✅ User receives call within 30 seconds

---

**Next: Implement phone number formatting and enhanced error logging**
