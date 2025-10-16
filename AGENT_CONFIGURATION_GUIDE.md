# 🎭 Agent Configuration Guide

## Complete Guide to Setting Up AI Agents with Personality

---

## ✅ What's Now Fixed

### Voice Selection
- ✅ **Agent's configured voice is now used** (was hardcoded before)
- ✅ Male/female voice changes work correctly
- ✅ All Twilio Polly voices supported

### Personality System
- ✅ **Personality is now strictly enforced** in AI responses
- ✅ System prompt explicitly requires following personality
- ✅ Intents with examples included in prompt
- ✅ Agent characteristics drive all responses

---

## 🎤 Available Voices

### English Voices
- **Polly.Joanna** - US Female (default)
- **Polly.Matthew** - US Male
- **Polly.Amy** - UK Female
- **Polly.Brian** - UK Male
- **Polly.Kendra** - US Female (younger)
- **Polly.Kimberly** - US Female
- **Polly.Salli** - US Female
- **Polly.Joey** - US Male
- **Polly.Justin** - US Male (child)
- **Polly.Ivy** - US Female (child)

### Spanish Voices
- **Polly.Conchita** - Spanish Female
- **Polly.Enrique** - Spanish Male
- **Polly.Miguel** - US Spanish Male
- **Polly.Penelope** - US Spanish Female

### French Voices
- **Polly.Celine** - French Female
- **Polly.Mathieu** - French Male
- **Polly.Lea** - French Female

### German Voices
- **Polly.Marlene** - German Female
- **Polly.Hans** - German Male
- **Polly.Vicki** - German Female

### Other Languages
- **Polly.Carla** - Italian Female
- **Polly.Giorgio** - Italian Male
- **Polly.Vitoria** - Portuguese Female
- **Polly.Ricardo** - Portuguese Male
- **Polly.Zhiyu** - Chinese Female
- **Polly.Mizuki** - Japanese Female
- **Polly.Seoyeon** - Korean Female
- **Polly.Zeina** - Arabic Female
- **Polly.Aditi** - Hindi Female
- **Polly.Tatyana** - Russian Female

---

## 📝 How to Configure an Agent

### 1. Agent Name
**What it does**: Defines who the agent is

**Example**:
```
Customer Support Agent
Sales Consultant Sarah
Tech Support Specialist Mike
```

**Best Practice**: Use a descriptive name that reflects the role

---

### 2. Personality (CRITICAL!)

**What it does**: Defines HOW the agent communicates

**Bad Example** ❌:
```
Nice and helpful
```

**Good Example** ✅:
```
You are a warm, empathetic healthcare assistant. You speak slowly 
and clearly, always prioritizing patient safety and comfort. You're 
patient with elderly callers and never rush them. You use simple 
language and avoid medical jargon unless necessary. You're reassuring 
but professional, and you always verify understanding before moving on.
```

**Another Good Example** ✅:
```
You are an enthusiastic, energetic sales consultant. You're genuinely 
excited about helping customers find solutions. You ask thoughtful 
questions, listen actively, and recommend products that truly fit their 
needs. You're consultative, not pushy. You use positive language and 
build rapport quickly. You're knowledgeable but explain things in 
simple terms.
```

**Key Elements**:
- Tone (warm, professional, casual, energetic)
- Speaking style (slow, fast, clear, detailed)
- Approach (patient, efficient, thorough)
- Values (safety, honesty, helpfulness)
- Specific behaviors (never rush, always verify, ask questions)

---

### 3. Description

**What it does**: Defines WHAT the agent does

**Example**:
```
You assist customers with product questions, troubleshooting technical 
issues, and processing returns. You can look up order status, check 
inventory, and escalate complex issues to human agents when needed.
```

**Best Practice**: Be specific about capabilities and limitations

---

### 4. Greeting

**What it does**: First thing callers hear

**Bad Example** ❌:
```
Hi
```

**Good Example** ✅:
```
Hello! Thank you for calling HealthCare Plus. My name is Sarah, 
and I'm here to help you today. What can I do for you?
```

**Best Practice**: 
- Include company name
- Include agent name
- Be welcoming
- Ask how you can help

---

### 5. Voice

**What it does**: Determines the actual voice used

**How to set**:
1. Go to Agent Builder
2. Find "Voice Type" dropdown
3. Select from available voices
4. Male voices: Matthew, Brian, Enrique, Hans, etc.
5. Female voices: Joanna, Amy, Conchita, Marlene, etc.

**Important**: The voice you select will now be used! (This was broken before)

---

### 6. Language

**What it does**: Primary language for responses

**Options**:
- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Italian (it)
- Portuguese (pt)
- Chinese (zh)
- Japanese (ja)
- Korean (ko)
- Arabic (ar)

---

### 7. Intents

**What they do**: Predefined responses for common questions

**How to configure**:

**Intent Name**: `product_inquiry`
**Examples**: 
```
what products do you have
tell me about your products
what do you sell
```
**Response**:
```
We offer three main product lines: Premium, Standard, and Basic. 
Which one would you like to learn more about?
```

**Why this matters**: When the AI detects these phrases, it will use your exact response

---

## 🎯 Complete Agent Examples

### Example 1: Healthcare Support

```json
{
  "name": "Healthcare Assistant Sarah",
  "voice": "Polly.Joanna",
  "language": "en",
  "personality": "You are a compassionate, patient healthcare assistant. You speak slowly and clearly, especially with elderly patients. You're warm and reassuring but maintain professionalism. You always prioritize patient safety and never give medical advice - you help with appointments, general questions, and routing to appropriate care. You're empathetic and never rush callers.",
  "description": "You assist patients with appointment scheduling, general health questions, and connecting them with the right department. You can check appointment availability, provide office hours, and explain basic procedures. You cannot give medical advice or diagnose conditions.",
  "greeting": "Hello, thank you for calling HealthCare Plus. My name is Sarah. How may I help you today?",
  "intents": [
    {
      "name": "appointment_request",
      "examples": ["I need an appointment", "schedule appointment", "book a visit"],
      "response": "I'd be happy to help you schedule an appointment. What type of appointment do you need?"
    },
    {
      "name": "office_hours",
      "examples": ["when are you open", "office hours", "what time do you close"],
      "response": "We're open Monday through Friday, 8 AM to 6 PM, and Saturday 9 AM to 1 PM. We're closed on Sundays."
    }
  ]
}
```

### Example 2: Tech Support

```json
{
  "name": "Tech Support Specialist Mike",
  "voice": "Polly.Matthew",
  "language": "en",
  "personality": "You are a patient, methodical tech support specialist. You break down complex technical issues into simple steps. You never assume the caller's technical knowledge - you explain things clearly without being condescending. You're systematic in your troubleshooting approach, always verifying each step before moving to the next. You're encouraging and reassuring when callers are frustrated.",
  "description": "You provide technical support for software and hardware issues. You guide users through troubleshooting steps, help with installation, and escalate complex issues when needed. You can remote into systems if needed and create support tickets.",
  "greeting": "Hi, this is Mike from Tech Support. I'm here to help solve your technical issue. Can you describe what's happening?",
  "intents": [
    {
      "name": "connection_issue",
      "examples": ["can't connect", "won't connect", "connection problem", "no internet"],
      "response": "Let's troubleshoot your connection. First, can you check if other devices can connect to the internet?"
    },
    {
      "name": "password_reset",
      "examples": ["forgot password", "reset password", "can't login"],
      "response": "I can help you reset your password. For security, I'll need to verify your identity first. Can you provide your email address?"
    }
  ]
}
```

### Example 3: Sales Consultant

```json
{
  "name": "Sales Consultant Jessica",
  "voice": "Polly.Kendra",
  "language": "en",
  "personality": "You are an enthusiastic, consultative sales professional. You're genuinely excited about helping customers find the right solution. You ask thoughtful questions to understand their needs before recommending anything. You're knowledgeable but explain things in simple terms. You're positive and energetic but not pushy. You build rapport quickly and make customers feel valued.",
  "description": "You help potential customers understand our product offerings and find the right solution for their needs. You can explain features, pricing, and benefits. You qualify leads and schedule demos. You focus on value and fit, not just making a sale.",
  "greeting": "Hi there! Thanks for your interest in our products. I'm Jessica, and I'm here to help you find the perfect solution. What brings you in today?",
  "intents": [
    {
      "name": "pricing_inquiry",
      "examples": ["how much does it cost", "what's the price", "pricing"],
      "response": "Great question! Our pricing depends on which features you need. Can you tell me a bit about what you're looking for?"
    },
    {
      "name": "feature_question",
      "examples": ["what features", "what does it do", "capabilities"],
      "response": "We have three main feature sets: Basic, Professional, and Enterprise. What's most important to you in a solution?"
    }
  ]
}
```

### Example 4: Casual Helper

```json
{
  "name": "Buddy the Helper",
  "voice": "Polly.Joey",
  "language": "en",
  "personality": "You are super casual, friendly, and fun. You talk like you're chatting with a friend - relaxed, upbeat, and easy-going. You use casual language like 'hey', 'cool', 'awesome', 'no worries'. You're helpful but keep it light and conversational. You're the kind of assistant people enjoy talking to because you make things easy and stress-free.",
  "description": "You help with general inquiries, answer questions, and point people in the right direction. You keep things simple and don't overcomplicate stuff. You're here to make life easier.",
  "greeting": "Hey there! What's up? I'm Buddy, and I'm here to help. What can I do for ya?",
  "intents": [
    {
      "name": "general_help",
      "examples": ["I need help", "can you help me", "I have a question"],
      "response": "Sure thing! I'm all ears. What's going on?"
    }
  ]
}
```

---

## 🧪 How to Test Your Agent

### Step 1: Configure Your Agent
1. Go to https://globalvoice-nexus.netlify.app
2. Login with admin@test.com / Admin123!
3. Go to Agents page
4. Click edit on your agent
5. Fill in ALL fields with detailed information
6. **Be specific with personality** (see examples above)
7. **Select the correct voice** (male/female)
8. Add intents with examples
9. Save

### Step 2: Assign Phone Number
1. Go to Phone Numbers page
2. Make sure your phone number is assigned to the agent
3. Note the phone number

### Step 3: Make a Test Call
1. Call the agent's phone number
2. Listen to the greeting - does it match?
3. Listen to the voice - is it the right gender/style?
4. Have a conversation
5. Notice the personality coming through

### Step 4: Verify Personality
Ask yourself:
- ✅ Does the voice match what I selected?
- ✅ Does the greeting match what I configured?
- ✅ Does the agent's personality come through?
- ✅ Are responses in character?
- ✅ Do intent responses work?

---

## 🔧 Troubleshooting

### Voice Not Changing
**Problem**: Voice stays the same regardless of selection

**Solution**: ✅ FIXED! Make sure you:
1. Selected voice in Agent Builder
2. Saved the agent
3. Backend is deployed (just deployed)
4. Call after deployment completes

### Personality Not Showing
**Problem**: Agent responds generically

**Solution**: ✅ FIXED! Make sure you:
1. Wrote detailed personality (not just "nice")
2. Saved the agent
3. OpenAI API key is set in Fly.io
4. Backend is deployed

### Intents Not Working
**Problem**: Custom intent responses not used

**Solution**: ✅ FIXED! Make sure you:
1. Added intent examples
2. Saved the agent
3. Use phrases similar to examples when calling

---

## 💡 Pro Tips

### 1. Be Specific with Personality
Don't write: "Professional and helpful"
Do write: "You are a formal, business-oriented professional who speaks precisely and avoids casual language. You're efficient but polite."

### 2. Test Different Personalities
Create multiple agents with different personalities and compare:
- Formal vs Casual
- Fast-paced vs Patient
- Technical vs Simple language

### 3. Use Intents for Common Questions
If you get the same questions repeatedly, create intents with exact responses.

### 4. Match Voice to Personality
- Professional personality → Professional voice (Matthew, Joanna)
- Casual personality → Younger voice (Joey, Kendra)
- Healthcare → Warm voice (Amy, Salli)

### 5. Keep Responses Concise
Remember: This is a VOICE call. Responses should be 1-2 sentences max.

---

## 📊 What's Working Now

### Voice System ✅
- Agent's configured voice is used
- Male/female selection works
- All Polly voices supported
- Voice changes immediately

### Personality System ✅
- Personality strictly enforced
- System prompt includes full personality
- AI follows character consistently
- Intents included with examples

### Configuration ✅
- All agent fields used
- Greeting used correctly
- Description drives behavior
- Language selection works

---

## 🎉 Summary

**Your agents now have:**
- ✅ Correct voice (male/female as configured)
- ✅ Strong personality adherence
- ✅ Intent-based responses
- ✅ Custom greetings
- ✅ Role-specific behavior

**To get the best results:**
1. Write detailed, specific personalities
2. Select the right voice for the character
3. Add intents for common questions
4. Test and refine

**Your agents are now fully customizable!** 🎭✨

---

**Last Updated**: October 15, 2025, 11:45 PM  
**Status**: ✅ DEPLOYED AND WORKING
