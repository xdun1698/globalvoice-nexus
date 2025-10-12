# API Documentation - GlobalVoice Nexus

## Base URL

- Development: `http://localhost:3001/api`
- Production: `https://api.globalvoice-nexus.com/api`

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### Authentication

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}

Response: 201 Created
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "jwt_token"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}

Response: 200 OK
{
  "user": { ... },
  "token": "jwt_token"
}
```

### Agents

#### List Agents
```http
GET /agents
Authorization: Bearer <token>

Response: 200 OK
{
  "agents": [
    {
      "id": "uuid",
      "name": "Customer Support Agent",
      "language": "en",
      "status": "active",
      ...
    }
  ]
}
```

#### Create Agent
```http
POST /agents
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Sales Agent",
  "description": "Handles sales inquiries",
  "greeting": "Hello! How can I help you today?",
  "language": "en",
  "voice": "female",
  "personality": "friendly",
  "intents": [...],
  "workflows": [...]
}

Response: 201 Created
{
  "agent": { ... }
}
```

#### Update Agent
```http
PUT /agents/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Agent Name",
  ...
}

Response: 200 OK
{
  "agent": { ... }
}
```

#### Delete Agent
```http
DELETE /agents/:id
Authorization: Bearer <token>

Response: 200 OK
{
  "message": "Agent deleted successfully"
}
```

### Calls

#### List Calls
```http
GET /calls?page=1&limit=50&status=completed&direction=inbound
Authorization: Bearer <token>

Response: 200 OK
{
  "calls": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 245,
    "pages": 5
  }
}
```

#### Get Call Details
```http
GET /calls/:id
Authorization: Bearer <token>

Response: 200 OK
{
  "call": {
    "id": "uuid",
    "phone_number": "+1234567890",
    "direction": "inbound",
    "status": "completed",
    "duration": 245,
    ...
  },
  "transcript": [
    {
      "speaker": "caller",
      "text": "Hello, I need help",
      "timestamp": "2024-01-15T10:30:00Z"
    },
    ...
  ]
}
```

#### Initiate Outbound Call
```http
POST /calls/outbound
Authorization: Bearer <token>
Content-Type: application/json

{
  "phoneNumber": "+1234567890",
  "agentId": "agent_uuid"
}

Response: 201 Created
{
  "callId": "uuid",
  "twilioSid": "CA...",
  "status": "initiated"
}
```

### Contacts

#### List Contacts
```http
GET /contacts?page=1&limit=50&search=john
Authorization: Bearer <token>

Response: 200 OK
{
  "contacts": [...],
  "pagination": { ... }
}
```

#### Create Contact
```http
POST /contacts
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe",
  "phone": "+1234567890",
  "email": "john@example.com",
  "company": "Acme Corp",
  "tags": ["vip", "customer"]
}

Response: 201 Created
{
  "contact": { ... }
}
```

#### Bulk Upload Contacts
```http
POST /contacts/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: contacts.csv

Response: 200 OK
{
  "message": "150 contacts uploaded successfully"
}
```

### Analytics

#### Dashboard Analytics
```http
GET /analytics/dashboard?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>

Response: 200 OK
{
  "stats": {
    "total_calls": 1247,
    "inbound_calls": 823,
    "outbound_calls": 424,
    "avg_duration": 245.5,
    "avg_csat": 4.3
  }
}
```

#### Language Distribution
```http
GET /analytics/languages
Authorization: Bearer <token>

Response: 200 OK
{
  "languages": [
    { "detected_language": "en", "count": 450 },
    { "detected_language": "es", "count": 280 },
    ...
  ]
}
```

## NLP Engine API

Base URL: `http://localhost:8001`

### Detect Language
```http
POST /detect-language
Content-Type: application/json

{
  "text": "Bonjour, comment allez-vous?"
}

Response: 200 OK
{
  "language": "fr",
  "confidence": 0.98,
  "supported": true
}
```

### Translate Text
```http
POST /translate
Content-Type: application/json

{
  "text": "Hello, how are you?",
  "from_language": "en",
  "to_language": "es"
}

Response: 200 OK
{
  "translated_text": "Hola, ¿cómo estás?",
  "from_language": "en",
  "to_language": "es"
}
```

### Process Input
```http
POST /process
Content-Type: application/json

{
  "text": "I want to book an appointment",
  "language": "en",
  "agent_id": "uuid",
  "call_id": "uuid",
  "context": {}
}

Response: 200 OK
{
  "response": "I'd be happy to help you book an appointment...",
  "intent": "booking",
  "entities": [...],
  "sentiment": {
    "sentiment": "positive",
    "score": 0.8
  },
  "confidence": 0.95,
  "context": { ... },
  "should_end_call": false
}
```

### Analyze Sentiment
```http
POST /sentiment
Content-Type: application/json

{
  "text": "I'm very happy with the service!",
  "language": "en"
}

Response: 200 OK
{
  "sentiment": "positive",
  "score": 0.92,
  "confidence": 0.95,
  "emotions": [
    { "emotion": "joy", "confidence": 0.89 },
    { "emotion": "satisfaction", "confidence": 0.76 }
  ]
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Validation error",
  "details": { ... }
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Rate Limiting

- Default: 100 requests per 15 minutes per IP
- Authenticated: 1000 requests per 15 minutes per user

Headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

## Webhooks

### Twilio Voice Webhook
```http
POST /webhooks/twilio/voice
Content-Type: application/x-www-form-urlencoded

From=+1234567890
To=+0987654321
CallSid=CA...

Response: 200 OK (TwiML)
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" ...>
    <Say>Hello! How can I help you?</Say>
  </Gather>
</Response>
```

## WebSocket Events

Connect to: `ws://localhost:3001`

### Authentication
```javascript
socket.emit('authenticate', { token: 'jwt_token' });
```

### Events

#### Call Started
```javascript
socket.on('call:started', (data) => {
  // { callId, phoneNumber, agentId }
});
```

#### Call Ended
```javascript
socket.on('call:ended', (data) => {
  // { callId, duration, status }
});
```

#### Transcript Update
```javascript
socket.on('transcript:new', (data) => {
  // { callId, speaker, text, timestamp }
});
```
