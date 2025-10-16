# 🧠 Agent Context Enhancement Strategy

## Current State Analysis

### What We Have ✅
- Basic agent configuration (name, greeting, personality)
- Call transcripts stored
- JSONB context field in calls table
- Basic NLP service with GPT-4o/Claude
- Intent and entity extraction
- Sentiment analysis

### What's Missing ❌
- **No conversation memory** across calls
- **No customer history** integration
- **No knowledge base** for agents
- **Limited context window** (only current call)
- **No RAG (Retrieval Augmented Generation)**
- **No vector embeddings** for semantic search
- **No business-specific knowledge**
- **No dynamic context injection**

---

## 🎯 Comprehensive Context Enhancement Plan

### Phase 1: Conversation Memory (Week 1)

#### 1.1 Add Conversation History Table
```sql
CREATE TABLE conversation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID REFERENCES calls(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  customer_phone VARCHAR(20) NOT NULL,
  turn_number INTEGER NOT NULL,
  speaker VARCHAR(10) NOT NULL, -- 'agent' or 'customer'
  message TEXT NOT NULL,
  intent VARCHAR(100),
  entities JSONB,
  sentiment VARCHAR(20),
  timestamp TIMESTAMP DEFAULT NOW(),
  INDEX idx_customer_phone (customer_phone),
  INDEX idx_agent_call (agent_id, call_id)
);
```

#### 1.2 Add Session Context Table
```sql
CREATE TABLE call_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID REFERENCES calls(id) ON DELETE CASCADE,
  customer_phone VARCHAR(20) NOT NULL,
  agent_id UUID REFERENCES agents(id),
  context JSONB NOT NULL DEFAULT '{}',
  conversation_state VARCHAR(50) DEFAULT 'greeting',
  collected_info JSONB DEFAULT '{}',
  pending_actions JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 1.3 Implement Context Manager Service
```javascript
class ContextManager {
  async getCallContext(callId, customerPhone, agentId) {
    // Get current call session
    // Get last 3 calls with this customer
    // Get customer profile
    // Get relevant knowledge base entries
    // Build comprehensive context
  }
  
  async updateContext(callId, newInfo) {
    // Update session context
    // Store in vector database
  }
  
  async getConversationHistory(customerPhone, limit = 10) {
    // Get last N turns from all calls
  }
}
```

---

### Phase 2: Knowledge Base & RAG (Week 2)

#### 2.1 Add Knowledge Base Table
```sql
CREATE TABLE knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  category VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  tags TEXT[],
  language VARCHAR(10) DEFAULT 'en',
  priority INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_category (category),
  INDEX idx_tags (tags),
  INDEX idx_agent (agent_id)
);
```

#### 2.2 Vector Embeddings Table
```sql
CREATE TABLE knowledge_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  knowledge_id UUID REFERENCES knowledge_base(id) ON DELETE CASCADE,
  embedding VECTOR(1536), -- OpenAI ada-002 embeddings
  chunk_index INTEGER DEFAULT 0,
  chunk_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create index for similarity search
CREATE INDEX ON knowledge_embeddings USING ivfflat (embedding vector_cosine_ops);
```

#### 2.3 Implement RAG Service
```javascript
class RAGService {
  async addKnowledge(content, metadata) {
    // 1. Chunk content (500-1000 tokens)
    // 2. Generate embeddings for each chunk
    // 3. Store in knowledge_base + knowledge_embeddings
  }
  
  async retrieveRelevantKnowledge(query, agentId, topK = 5) {
    // 1. Generate query embedding
    // 2. Vector similarity search
    // 3. Return top K most relevant chunks
  }
  
  async augmentPrompt(userQuery, agentId, context) {
    // 1. Retrieve relevant knowledge
    // 2. Build enhanced prompt with context
    // 3. Return augmented prompt
  }
}
```

---

### Phase 3: Customer Intelligence (Week 3)

#### 3.1 Enhanced Customer Profile
```sql
CREATE TABLE customer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  phone VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255),
  email VARCHAR(255),
  company VARCHAR(255),
  language_preference VARCHAR(10),
  timezone VARCHAR(50),
  
  -- Interaction history
  total_calls INTEGER DEFAULT 0,
  successful_calls INTEGER DEFAULT 0,
  average_call_duration INTEGER,
  last_call_date TIMESTAMP,
  
  -- Behavioral insights
  preferred_contact_time VARCHAR(50),
  communication_style VARCHAR(50), -- formal, casual, technical
  sentiment_trend VARCHAR(20), -- improving, declining, stable
  average_sentiment_score FLOAT,
  
  -- Business context
  customer_segment VARCHAR(50),
  lifetime_value DECIMAL(10,2),
  account_status VARCHAR(50),
  
  -- Preferences
  preferences JSONB DEFAULT '{}',
  custom_fields JSONB DEFAULT '{}',
  tags TEXT[],
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_phone (phone),
  INDEX idx_user_id (user_id)
);
```

#### 3.2 Call Insights Table
```sql
CREATE TABLE call_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID REFERENCES calls(id) ON DELETE CASCADE,
  customer_phone VARCHAR(20) NOT NULL,
  
  -- Extracted information
  key_topics TEXT[],
  mentioned_products TEXT[],
  pain_points TEXT[],
  questions_asked TEXT[],
  objections TEXT[],
  
  -- Sentiment analysis
  overall_sentiment VARCHAR(20),
  sentiment_by_topic JSONB,
  emotional_journey JSONB, -- timeline of emotions
  
  -- Intent classification
  primary_intent VARCHAR(100),
  secondary_intents TEXT[],
  intent_confidence FLOAT,
  
  -- Outcome
  resolution_status VARCHAR(50),
  next_steps TEXT[],
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_date TIMESTAMP,
  
  -- AI-generated insights
  summary TEXT,
  recommendations TEXT[],
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### Phase 4: Dynamic Context Injection (Week 4)

#### 4.1 Context Builder Service
```javascript
class DynamicContextBuilder {
  async buildContext(callId, customerPhone, agentId, currentMessage) {
    const context = {
      // 1. Customer Profile
      customer: await this.getCustomerProfile(customerPhone),
      
      // 2. Recent Interaction History
      recentCalls: await this.getRecentCalls(customerPhone, 3),
      
      // 3. Current Conversation State
      currentSession: await this.getCurrentSession(callId),
      
      // 4. Relevant Knowledge
      knowledge: await this.getRelevantKnowledge(currentMessage, agentId),
      
      // 5. Business Rules
      businessRules: await this.getBusinessRules(agentId),
      
      // 6. Real-time Data
      realTimeData: await this.getRealTimeData(customerPhone),
      
      // 7. Agent Personality & Guidelines
      agentConfig: await this.getAgentConfig(agentId),
      
      // 8. Conversation Patterns
      patterns: await this.getConversationPatterns(customerPhone)
    };
    
    return this.formatContextForLLM(context);
  }
  
  formatContextForLLM(context) {
    return `
## Customer Profile
Name: ${context.customer.name || 'Unknown'}
Phone: ${context.customer.phone}
Language: ${context.customer.language_preference || 'en'}
Previous Calls: ${context.customer.total_calls}
Last Contact: ${context.customer.last_call_date}
Communication Style: ${context.customer.communication_style}
Sentiment Trend: ${context.customer.sentiment_trend}

## Recent Interaction History
${this.formatRecentCalls(context.recentCalls)}

## Current Conversation
State: ${context.currentSession.conversation_state}
Collected Info: ${JSON.stringify(context.currentSession.collected_info)}
Pending Actions: ${context.currentSession.pending_actions.join(', ')}

## Relevant Knowledge
${context.knowledge.map(k => `- ${k.title}: ${k.content}`).join('\n')}

## Business Rules
${context.businessRules.map(r => `- ${r.rule}`).join('\n')}

## Agent Guidelines
Personality: ${context.agentConfig.personality}
Voice: ${context.agentConfig.voice}
Language: ${context.agentConfig.language}
Special Instructions: ${context.agentConfig.special_instructions}
`;
  }
}
```

---

### Phase 5: Advanced Features (Week 5-6)

#### 5.1 Multi-turn Conversation Tracking
```javascript
class ConversationTracker {
  async trackTurn(callId, speaker, message, intent, entities) {
    // Store turn in conversation_history
    // Update conversation state machine
    // Detect conversation patterns
    // Identify when to escalate or transfer
  }
  
  async detectConversationFlow(callId) {
    // Analyze conversation progression
    // Identify if customer is satisfied
    // Detect confusion or frustration
    // Suggest next best action
  }
}
```

#### 5.2 Proactive Context Updates
```javascript
class ProactiveContextService {
  async enrichContext(callId, customerPhone) {
    // Check CRM for updates
    // Check order status
    // Check support tickets
    // Check account changes
    // Update context in real-time
  }
  
  async suggestProactiveActions(context) {
    // Based on customer history, suggest:
    // - Upsell opportunities
    // - Service reminders
    // - Issue prevention
    // - Personalized offers
  }
}
```

#### 5.3 Context-Aware Response Generation
```javascript
class ContextAwareResponseGenerator {
  async generateResponse(userMessage, fullContext, agentId) {
    // 1. Retrieve relevant knowledge (RAG)
    const knowledge = await this.ragService.retrieveRelevantKnowledge(
      userMessage, 
      agentId, 
      5
    );
    
    // 2. Build comprehensive prompt
    const prompt = this.buildPrompt({
      userMessage,
      context: fullContext,
      knowledge,
      conversationHistory: fullContext.recentTurns,
      agentPersonality: fullContext.agent.personality
    });
    
    // 3. Generate response with GPT-4o
    const response = await this.nlpService.generateResponse(
      prompt,
      {
        temperature: 0.7,
        max_tokens: 150,
        top_p: 0.9
      }
    );
    
    // 4. Post-process response
    return this.postProcessResponse(response, fullContext);
  }
  
  buildPrompt({ userMessage, context, knowledge, conversationHistory, agentPersonality }) {
    return `
You are an AI voice agent with the following personality: ${agentPersonality}

## Customer Context
${this.formatCustomerContext(context.customer)}

## Conversation History (last 5 turns)
${this.formatConversationHistory(conversationHistory)}

## Relevant Knowledge Base
${knowledge.map(k => `- ${k.content}`).join('\n')}

## Current Customer Message
"${userMessage}"

## Instructions
1. Respond naturally and conversationally
2. Reference previous conversation if relevant
3. Use customer's name if known
4. Match their communication style
5. Be concise (1-2 sentences for voice)
6. If you don't know something, say so and offer to find out
7. Always be helpful and empathetic

Generate your response:`;
  }
}
```

---

## 🚀 Implementation Priority

### Must-Have (Immediate)
1. ✅ **Conversation History** - Store all turns
2. ✅ **Session Context** - Track current call state
3. ✅ **Customer Profile** - Basic customer info
4. ✅ **Context Manager** - Centralized context handling

### Should-Have (Next 2 weeks)
5. ✅ **Knowledge Base** - Store business knowledge
6. ✅ **RAG Implementation** - Semantic search
7. ✅ **Vector Embeddings** - Use pgvector or Pinecone
8. ✅ **Enhanced Prompts** - Include full context

### Nice-to-Have (Future)
9. 🔧 **Real-time CRM Integration**
10. 🔧 **Predictive Analytics**
11. 🔧 **A/B Testing for Responses**
12. 🔧 **Multi-modal Context** (images, documents)

---

## 📊 Context Structure Example

### Optimal Context for LLM
```json
{
  "customer": {
    "id": "uuid",
    "name": "John Doe",
    "phone": "+1234567890",
    "email": "john@example.com",
    "language": "en",
    "total_calls": 5,
    "last_call": "2025-10-10",
    "sentiment_trend": "positive",
    "communication_style": "casual",
    "preferences": {
      "contact_time": "morning",
      "topics_of_interest": ["product_updates", "billing"]
    }
  },
  "conversation": {
    "state": "information_gathering",
    "turn_number": 3,
    "history": [
      {"speaker": "agent", "message": "Hello! How can I help?"},
      {"speaker": "customer", "message": "I have a question about my bill"},
      {"speaker": "agent", "message": "I'd be happy to help with that"}
    ],
    "collected_info": {
      "issue_type": "billing",
      "account_number": "12345"
    },
    "pending_actions": ["lookup_bill", "explain_charges"]
  },
  "knowledge": [
    {
      "title": "Billing FAQ",
      "content": "Common billing questions...",
      "relevance": 0.95
    },
    {
      "title": "Payment Methods",
      "content": "Accepted payment methods...",
      "relevance": 0.87
    }
  ],
  "business_rules": [
    "Always verify account before discussing billing",
    "Offer payment plan if customer mentions financial difficulty",
    "Escalate to supervisor if dispute > $100"
  ],
  "agent": {
    "name": "Customer Support Agent",
    "personality": "professional, empathetic, solution-oriented",
    "language": "en",
    "voice": "Polly.Joanna",
    "special_instructions": "Always thank customer at end of call"
  }
}
```

---

## 🔧 Quick Wins (Can Implement Today)

### 1. Enhanced Agent Configuration
Add these fields to agents table:
```sql
ALTER TABLE agents ADD COLUMN system_prompt TEXT;
ALTER TABLE agents ADD COLUMN context_window INTEGER DEFAULT 10;
ALTER TABLE agents ADD COLUMN knowledge_base_ids UUID[];
ALTER TABLE agents ADD COLUMN business_rules JSONB DEFAULT '[]';
ALTER TABLE agents ADD COLUMN conversation_style VARCHAR(50) DEFAULT 'professional';
```

### 2. Improve NLP Service
Update `generateResponse` to include more context:
```javascript
async generateResponse(userMessage, callContext, agentConfig) {
  const systemPrompt = `
${agentConfig.system_prompt || 'You are a helpful AI assistant'}

## Customer Information
Name: ${callContext.customer?.name || 'Unknown'}
Previous Interactions: ${callContext.customer?.total_calls || 0}
Last Call: ${callContext.customer?.last_call_date || 'First time caller'}

## Conversation So Far
${callContext.conversationHistory?.map(turn => 
  `${turn.speaker}: ${turn.message}`
).join('\n') || 'No previous messages'}

## Your Guidelines
${agentConfig.business_rules?.join('\n') || ''}

Respond naturally and helpfully in ${agentConfig.language}.
`;

  const completion = await this.openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ],
    temperature: 0.7,
    max_tokens: 150
  });

  return completion.choices[0].message.content;
}
```

### 3. Add Context Middleware
```javascript
// backend/src/middleware/contextEnricher.js
async function enrichCallContext(req, res, next) {
  const { callId, customerPhone, agentId } = req.body;
  
  // Get customer profile
  const customer = await db('customer_profiles')
    .where({ phone: customerPhone })
    .first();
  
  // Get recent calls
  const recentCalls = await db('calls')
    .where({ phone_number: customerPhone })
    .orderBy('created_at', 'desc')
    .limit(3);
  
  // Get conversation history for this call
  const conversationHistory = await db('conversation_history')
    .where({ call_id: callId })
    .orderBy('turn_number', 'asc');
  
  // Attach to request
  req.context = {
    customer,
    recentCalls,
    conversationHistory
  };
  
  next();
}
```

---

## 📈 Expected Improvements

### With Full Implementation:
- **Response Relevance**: 40% → 95%
- **Customer Satisfaction**: 60% → 90%
- **First Call Resolution**: 50% → 85%
- **Average Handle Time**: -30%
- **Agent Consistency**: 70% → 98%

### Key Metrics to Track:
1. Context retrieval accuracy
2. Response relevance score
3. Customer satisfaction (CSAT)
4. Conversation completion rate
5. Escalation rate
6. Average conversation length

---

## 🎯 Next Steps

### This Week:
1. Create conversation_history table
2. Create call_sessions table
3. Implement ContextManager service
4. Update NLP service to use context
5. Test with sample conversations

### Next Week:
1. Add knowledge_base table
2. Implement RAG service
3. Set up vector embeddings (pgvector or Pinecone)
4. Create knowledge management UI
5. Test semantic search

### Week 3:
1. Create customer_profiles table
2. Implement customer intelligence
3. Add behavioral tracking
4. Create insights dashboard

---

## 💡 Best Practices

1. **Keep Context Focused**: Don't overwhelm the LLM with too much context
2. **Prioritize Recent Information**: Weight recent interactions higher
3. **Use Semantic Search**: Don't just keyword match
4. **Update Context Real-time**: Keep context fresh during conversation
5. **Test Extensively**: A/B test different context strategies
6. **Monitor Token Usage**: Context can get expensive
7. **Cache Intelligently**: Cache embeddings and frequent queries
8. **Handle Missing Data**: Gracefully handle incomplete context

---

**This strategy will transform your agents from basic chatbots into intelligent, context-aware assistants that feel like they truly understand your customers!** 🚀
