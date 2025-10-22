# API Documentation Assessment & Implementation Plan

## 🔍 **Current State**

### **Integrations Page - API Docs Button:**
```jsx
<button onClick={handleViewDocs}>
  <FileText className="h-4 w-4 mr-2" />
  View API Documentation
</button>
```

**Current Behavior:**
- Shows toast: "API documentation coming soon!" 📚
- Does nothing else ❌

**Expected Behavior:**
- Should open comprehensive API documentation
- Show available endpoints
- Provide authentication guide
- Include code examples
- Allow API testing

---

## 🎯 **What We Need To Build**

### **1. API Documentation Page** (`/api-docs`)

**Features:**
- ✅ List of all available endpoints
- ✅ Request/response examples
- ✅ Authentication guide
- ✅ Interactive API testing
- ✅ Code snippets (cURL, JavaScript, Python)
- ✅ Rate limiting info
- ✅ Error codes reference

---

### **2. Starter API Set**

**Core APIs to Document:**

#### **Authentication APIs:**
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Get JWT token
- `POST /api/auth/logout` - Invalidate token
- `GET /api/auth/me` - Get current user

#### **Agent APIs:**
- `GET /api/agents` - List all agents
- `POST /api/agents` - Create agent
- `GET /api/agents/:id` - Get agent details
- `PUT /api/agents/:id` - Update agent
- `DELETE /api/agents/:id` - Delete agent

#### **Phone Number APIs:**
- `GET /api/phone-numbers` - List phone numbers
- `GET /api/phone-numbers/search` - Search available numbers
- `POST /api/phone-numbers/buy` - Purchase number
- `DELETE /api/phone-numbers/:id` - Release number

#### **Call APIs:**
- `GET /api/calls` - List calls
- `GET /api/calls/:id` - Get call details
- `POST /api/calls/outbound` - Make outbound call
- `GET /api/calls/:id/transcript` - Get transcript

#### **Webhook APIs:**
- `POST /api/vapi/webhook` - Receive Vapi events
- `GET /api/vapi/stats` - Get Vapi statistics

---

## 🚀 **Implementation Plan**

### **Phase 1: API Documentation Page** (2-3 hours)

**Create:**
1. `/frontend/src/pages/ApiDocs.jsx` - Main docs page
2. `/frontend/src/components/ApiEndpoint.jsx` - Endpoint card component
3. `/frontend/src/components/CodeSnippet.jsx` - Code example component
4. Add route to App.jsx

**Features:**
- Searchable endpoint list
- Categorized by resource
- Copy-to-clipboard for examples
- Try-it-out functionality
- Authentication token input

---

### **Phase 2: Backend API Info Endpoint** (30 minutes)

**Create:**
- `GET /api/docs` - Returns API specification (OpenAPI/Swagger format)

**Returns:**
```json
{
  "version": "1.0.0",
  "endpoints": [...],
  "authentication": {...},
  "rateLimit": {...}
}
```

---

### **Phase 3: Interactive Testing** (1-2 hours)

**Add:**
- API key input field
- Request builder
- Response viewer
- Error handling
- Success/error indicators

---

## 📋 **API Documentation Structure**

### **Endpoint Card Format:**

```
┌─────────────────────────────────────────┐
│ POST /api/agents                        │
│ Create a new AI agent                   │
├─────────────────────────────────────────┤
│ Authentication: Required (Bearer token) │
│ Rate Limit: 100 requests/hour           │
├─────────────────────────────────────────┤
│ Request Body:                           │
│ {                                       │
│   "name": "Customer Support",           │
│   "greeting": "Hello!",                 │
│   "language": "en",                     │
│   "elevenlabs_voice": "test_antoni"     │
│ }                                       │
├─────────────────────────────────────────┤
│ Response (201):                         │
│ {                                       │
│   "agent": {                            │
│     "id": "uuid",                       │
│     "name": "Customer Support",         │
│     "created_at": "2025-10-22"          │
│   }                                     │
│ }                                       │
├─────────────────────────────────────────┤
│ [Try It Out] [Copy cURL] [Copy JS]     │
└─────────────────────────────────────────┘
```

---

## 🎨 **UI Design**

### **Layout:**

```
┌──────────────────────────────────────────────────┐
│  API Documentation                    [Search 🔍]│
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌─────────────┐  ┌──────────────────────────┐  │
│  │ Navigation  │  │ Content                  │  │
│  │             │  │                          │  │
│  │ • Auth      │  │ Authentication           │  │
│  │ • Agents    │  │ ─────────────────────    │  │
│  │ • Phones    │  │ All API requests require │  │
│  │ • Calls     │  │ Bearer token...          │  │
│  │ • Webhooks  │  │                          │  │
│  │             │  │ POST /api/auth/login     │  │
│  │ [API Key]   │  │ ┌──────────────────────┐ │  │
│  │ [________]  │  │ │ Request Body         │ │  │
│  │             │  │ │ Response             │ │  │
│  │             │  │ │ Code Examples        │ │  │
│  │             │  │ └──────────────────────┘ │  │
│  └─────────────┘  └──────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

---

## 💻 **Code Examples Format**

### **cURL:**
```bash
curl -X POST https://globalvoice-backend.fly.dev/api/agents \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Customer Support",
    "greeting": "Hello! How can I help you?",
    "language": "en"
  }'
```

### **JavaScript:**
```javascript
const response = await fetch('https://globalvoice-backend.fly.dev/api/agents', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Customer Support',
    greeting: 'Hello! How can I help you?',
    language: 'en'
  })
});

const data = await response.json();
console.log(data.agent);
```

### **Python:**
```python
import requests

response = requests.post(
    'https://globalvoice-backend.fly.dev/api/agents',
    headers={
        'Authorization': 'Bearer YOUR_TOKEN',
        'Content-Type': 'application/json'
    },
    json={
        'name': 'Customer Support',
        'greeting': 'Hello! How can I help you?',
        'language': 'en'
    }
)

agent = response.json()['agent']
print(agent)
```

---

## 🔐 **Authentication Guide**

### **Getting Your API Token:**

```
1. Login to your account
2. Go to Settings → API Keys
3. Click "Generate New API Key"
4. Copy your token (shown once)
5. Use in Authorization header:
   Authorization: Bearer YOUR_TOKEN
```

### **Token Format:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **Token Expiration:**
- Default: 24 hours
- Refresh: Use /api/auth/refresh endpoint

---

## 📊 **Starter API Set - Complete Specification**

### **1. Authentication**

#### **POST /api/auth/register**
```json
Request:
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}

Response (201):
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "jwt_token_here"
}
```

#### **POST /api/auth/login**
```json
Request:
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response (200):
{
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "token": "jwt_token_here"
}
```

---

### **2. Agents**

#### **GET /api/agents**
```json
Headers:
Authorization: Bearer {token}

Response (200):
{
  "agents": [
    {
      "id": "uuid",
      "name": "Customer Support",
      "greeting": "Hello!",
      "language": "en",
      "elevenlabs_voice": "test_antoni",
      "created_at": "2025-10-22T10:00:00Z"
    }
  ]
}
```

#### **POST /api/agents**
```json
Headers:
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "name": "Sales Agent",
  "description": "Handles sales inquiries",
  "greeting": "Hi! Ready to help with your purchase!",
  "language": "en",
  "elevenlabs_voice": "test_rachel",
  "personality": "Friendly and helpful sales expert"
}

Response (201):
{
  "agent": {
    "id": "uuid",
    "name": "Sales Agent",
    "vapi_assistant_id": "vapi_uuid",
    "created_at": "2025-10-22T10:00:00Z"
  }
}
```

#### **GET /api/agents/:id**
```json
Headers:
Authorization: Bearer {token}

Response (200):
{
  "agent": {
    "id": "uuid",
    "name": "Customer Support",
    "description": "24/7 support agent",
    "greeting": "Hello! How can I help?",
    "language": "en",
    "elevenlabs_voice": "test_antoni",
    "personality": "Professional and helpful",
    "vapi_assistant_id": "vapi_uuid",
    "created_at": "2025-10-22T10:00:00Z"
  }
}
```

#### **PUT /api/agents/:id**
```json
Headers:
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "name": "Updated Agent Name",
  "greeting": "New greeting!",
  "elevenlabs_voice": "test_lily"
}

Response (200):
{
  "agent": {
    "id": "uuid",
    "name": "Updated Agent Name",
    "updated_at": "2025-10-22T11:00:00Z"
  }
}
```

#### **DELETE /api/agents/:id**
```json
Headers:
Authorization: Bearer {token}

Response (200):
{
  "message": "Agent deleted successfully"
}
```

---

### **3. Phone Numbers**

#### **GET /api/phone-numbers**
```json
Headers:
Authorization: Bearer {token}

Response (200):
{
  "phoneNumbers": [
    {
      "id": "uuid",
      "number": "+16826269224",
      "agent_id": "agent_uuid",
      "country_code": "+1",
      "created_at": "2025-10-22T10:00:00Z"
    }
  ]
}
```

#### **GET /api/phone-numbers/search?areaCode=682**
```json
Headers:
Authorization: Bearer {token}

Response (200):
{
  "numbers": [
    {
      "number": "+16826261234",
      "locality": "Fort Worth",
      "region": "TX",
      "price": "$1.00/month"
    }
  ]
}
```

#### **POST /api/phone-numbers/buy**
```json
Headers:
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "number": "+16826261234",
  "agent_id": "agent_uuid"
}

Response (201):
{
  "phoneNumber": {
    "id": "uuid",
    "number": "+16826261234",
    "agent_id": "agent_uuid",
    "status": "active"
  }
}
```

---

### **4. Calls**

#### **GET /api/calls**
```json
Headers:
Authorization: Bearer {token}

Query Parameters:
?limit=50&offset=0&agent_id=uuid

Response (200):
{
  "calls": [
    {
      "id": "uuid",
      "agent_id": "agent_uuid",
      "from": "+15551234567",
      "to": "+16826269224",
      "status": "completed",
      "duration": 120,
      "started_at": "2025-10-22T10:00:00Z",
      "ended_at": "2025-10-22T10:02:00Z"
    }
  ],
  "total": 150,
  "limit": 50,
  "offset": 0
}
```

#### **GET /api/calls/:id**
```json
Headers:
Authorization: Bearer {token}

Response (200):
{
  "call": {
    "id": "uuid",
    "agent_id": "agent_uuid",
    "from": "+15551234567",
    "to": "+16826269224",
    "status": "completed",
    "duration": 120,
    "recording_url": "https://...",
    "transcript": "Hello! How can I help you today?...",
    "started_at": "2025-10-22T10:00:00Z",
    "ended_at": "2025-10-22T10:02:00Z"
  }
}
```

---

## 🔧 **Error Responses**

### **Standard Error Format:**
```json
{
  "error": "Error message here",
  "code": "ERROR_CODE",
  "details": {}
}
```

### **Common Error Codes:**

| Code | Status | Description |
|------|--------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or missing token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `SERVER_ERROR` | 500 | Internal server error |

---

## 📈 **Rate Limiting**

### **Default Limits:**
- **Authentication:** 10 requests/minute
- **Read Operations:** 100 requests/minute
- **Write Operations:** 50 requests/minute
- **Webhooks:** Unlimited (from Vapi)

### **Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1698012345
```

---

## ✅ **Implementation Checklist**

### **Frontend:**
- [ ] Create ApiDocs.jsx page
- [ ] Create ApiEndpoint component
- [ ] Create CodeSnippet component
- [ ] Add syntax highlighting
- [ ] Add copy-to-clipboard
- [ ] Add search functionality
- [ ] Add API key input
- [ ] Add try-it-out feature
- [ ] Update Integrations button link
- [ ] Add route to App.jsx

### **Backend:**
- [ ] Create GET /api/docs endpoint
- [ ] Generate OpenAPI spec
- [ ] Add rate limiting headers
- [ ] Document all existing endpoints
- [ ] Add CORS for API docs
- [ ] Add API versioning

### **Documentation:**
- [ ] Authentication guide
- [ ] Quick start guide
- [ ] Code examples (cURL, JS, Python)
- [ ] Error handling guide
- [ ] Webhook setup guide
- [ ] Best practices

---

## 🎯 **Recommended Approach**

### **Phase 1: Quick Win** (1 hour)
1. Create simple API docs page
2. List all endpoints with descriptions
3. Show authentication example
4. Update button to open page

### **Phase 2: Enhanced** (2-3 hours)
1. Add code examples
2. Add copy-to-clipboard
3. Add syntax highlighting
4. Add categorization

### **Phase 3: Interactive** (3-4 hours)
1. Add try-it-out functionality
2. Add API key input
3. Add response viewer
4. Add error handling

---

## 📊 **Summary**

### **Current State:**
- Button shows toast notification only ❌

### **Target State:**
- Comprehensive API documentation ✅
- Interactive testing ✅
- Code examples ✅
- Authentication guide ✅

### **Starter API Set:**
- 4 categories (Auth, Agents, Phones, Calls)
- 15+ endpoints documented
- Full request/response examples
- Error handling guide

### **Time Estimate:**
- Quick version: 1 hour
- Full version: 6-8 hours

---

**Ready to build the API documentation page?**
