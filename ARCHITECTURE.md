# Architecture Overview - GlobalVoice Nexus

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Web App    │  │  Mobile App  │  │  Phone Call  │          │
│  │   (React)    │  │   (Future)   │  │   (Twilio)   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                           │
│  ┌──────────────────────────────────────────────────────┐       │
│  │         Node.js Backend (Express + Socket.IO)        │       │
│  │  • REST API        • WebSocket        • Webhooks     │       │
│  │  • Authentication  • Rate Limiting    • CORS         │       │
│  └──────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Service    │    │   Service    │    │   Service    │
│    Layer     │    │    Layer     │    │    Layer     │
└──────────────┘    └──────────────┘    └──────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      Service Layer                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Telephony   │  │   NLP Core   │  │  Voice AI    │          │
│  │   Service    │  │  (Python)    │  │   Service    │          │
│  │  (Twilio)    │  │  FastAPI     │  │ (Whisper/EL) │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │     CRM      │  │  Analytics   │  │  Workflow    │          │
│  │ Integration  │  │   Service    │  │   Engine     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  PostgreSQL  │    │    Redis     │    │   Pinecone   │
│  (Primary)   │    │   (Cache)    │    │   (Vector)   │
└──────────────┘    └──────────────┘    └──────────────┘
```

## Component Details

### Frontend (React)

**Technology Stack:**
- React 18 with Hooks
- TailwindCSS for styling
- Recharts for analytics visualization
- Socket.IO client for real-time updates
- React Query for data fetching
- Zustand for state management

**Key Features:**
- Responsive dashboard
- Real-time call monitoring
- Visual agent builder
- Analytics and reporting
- Contact management

### Backend API (Node.js)

**Technology Stack:**
- Express.js for REST API
- Socket.IO for WebSocket
- Knex.js for database queries
- JWT for authentication
- Redis for caching and sessions

**Responsibilities:**
- User authentication and authorization
- Agent CRUD operations
- Call management and routing
- Contact management
- Integration orchestration
- WebSocket event handling

### NLP Engine (Python)

**Technology Stack:**
- FastAPI for API server
- Transformers for NLP models
- LangChain for LLM orchestration
- OpenAI GPT-4o for conversations
- Anthropic Claude for sentiment
- langdetect & CLD2 for language detection

**Capabilities:**
- Language detection (100+ languages)
- Real-time translation
- Intent classification
- Entity extraction
- Sentiment analysis
- Conversation summarization
- CSAT calculation

### Telephony Service

**Technology Stack:**
- Twilio SDK
- WebRTC for browser calls
- SIP trunk support

**Features:**
- Inbound/outbound call handling
- Call recording
- Real-time transcription
- Multi-language support
- Call routing and IVR

### Voice AI Service

**Technology Stack:**
- OpenAI Whisper for STT
- ElevenLabs for TTS
- Voice cloning capabilities

**Features:**
- Speech-to-text (<500ms latency)
- Text-to-speech (natural voices)
- Voice cloning
- Accent handling
- Noise cancellation

## Data Flow

### Inbound Call Flow

```
1. Phone Call → Twilio
2. Twilio → Backend Webhook
3. Backend → Detect Language (NLP Engine)
4. Backend → Load Agent Config
5. Backend → Generate Greeting (TTS)
6. Twilio → Play Greeting
7. Caller Speaks → Twilio (STT)
8. Twilio → Backend (Speech Text)
9. Backend → NLP Engine (Process)
10. NLP Engine → Intent + Entities + Sentiment
11. NLP Engine → Generate Response (LLM)
12. Backend → TTS → Twilio
13. Repeat 7-12 until call ends
14. Backend → Save Transcript + Analytics
```

### Outbound Call Flow

```
1. User → Frontend (Initiate Call)
2. Frontend → Backend API
3. Backend → Twilio (Make Call)
4. Twilio → Connects to Number
5. Follow Inbound Flow from step 3
```

## Database Schema

### Core Tables

**users**
- id (UUID, PK)
- name, email, password
- created_at, updated_at

**agents**
- id (UUID, PK)
- user_id (FK)
- name, description, greeting
- language, voice, personality
- intents (JSONB), workflows (JSONB)
- status, created_at, updated_at

**calls**
- id (UUID, PK)
- user_id (FK), agent_id (FK)
- phone_number, direction, status
- duration, recording_url
- detected_language, context (JSONB)
- csat_score, created_at

**call_transcripts**
- id (UUID, PK)
- call_id (FK)
- speaker, text, language
- confidence, timestamp

**contacts**
- id (UUID, PK)
- user_id (FK)
- name, phone, email, company
- notes, tags (JSONB)

**phone_numbers**
- id (UUID, PK)
- user_id (FK), agent_id (FK)
- number, twilio_sid
- country_code, capabilities (JSONB)

**integrations**
- id (UUID, PK)
- user_id (FK)
- provider, credentials (JSONB)
- status, created_at

## Security Architecture

### Authentication Flow

```
1. User Login → Backend
2. Backend → Verify Credentials
3. Backend → Generate JWT Token
4. Frontend → Store Token (localStorage)
5. All API Requests → Include Token in Header
6. Backend → Verify Token Middleware
7. Backend → Process Request
```

### Security Measures

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: 100 req/15min per IP
- **CORS**: Restricted origins in production
- **HTTPS**: TLS 1.3 encryption
- **Input Validation**: Server-side validation
- **SQL Injection**: Parameterized queries
- **XSS Protection**: Content Security Policy
- **GDPR Compliance**: Data encryption at rest

## Scalability

### Horizontal Scaling

- **Backend**: Multiple Node.js instances behind load balancer
- **NLP Engine**: Multiple Python workers
- **Database**: PostgreSQL read replicas
- **Cache**: Redis cluster

### Vertical Scaling

- **Database**: Increase CPU/RAM for PostgreSQL
- **NLP Models**: GPU acceleration for transformers

### Performance Optimization

- **Caching**: Redis for frequent queries
- **CDN**: CloudFront for static assets
- **Database Indexing**: Optimized queries
- **Connection Pooling**: Efficient DB connections
- **Lazy Loading**: Frontend code splitting

## Monitoring & Observability

### Metrics

- **Application**: Response times, error rates
- **Infrastructure**: CPU, memory, disk usage
- **Business**: Calls/day, CSAT scores, resolution rates

### Logging

- **Structured Logging**: Winston (Node.js), Python logging
- **Log Aggregation**: ELK Stack or CloudWatch
- **Error Tracking**: Sentry integration

### Alerting

- **Uptime Monitoring**: Pingdom or UptimeRobot
- **Performance**: New Relic or Datadog
- **Errors**: Sentry alerts

## Disaster Recovery

### Backup Strategy

- **Database**: Daily automated backups
- **Recordings**: S3 with versioning
- **Configuration**: Git version control

### Recovery Plan

- **RTO**: 1 hour (Recovery Time Objective)
- **RPO**: 15 minutes (Recovery Point Objective)
- **Failover**: Automated database failover
- **Redundancy**: Multi-AZ deployment
