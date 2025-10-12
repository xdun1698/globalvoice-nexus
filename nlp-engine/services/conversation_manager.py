import os
import logging
from typing import Dict, Any, List
from openai import AsyncOpenAI
from anthropic import AsyncAnthropic
import json

logger = logging.getLogger(__name__)

class ConversationManager:
    """
    Manages conversation flow and generates contextual responses
    Supports multiple LLM providers with fallback
    """
    
    def __init__(self):
        self.openai_client = AsyncOpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        self.anthropic_client = AsyncAnthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))
        
        # Conversation memory (in production, use Redis or database)
        self.conversations = {}
        
        # Intent-based response templates
        self.response_templates = {
            'greeting': {
                'en': "Hello! How can I help you today?",
                'es': "¡Hola! ¿Cómo puedo ayudarte hoy?",
                'fr': "Bonjour! Comment puis-je vous aider aujourd'hui?",
                'de': "Hallo! Wie kann ich Ihnen heute helfen?",
                'zh': "你好！今天我能帮你什么？",
                'ja': "こんにちは！今日はどのようにお手伝いできますか？",
                'ar': "مرحبا! كيف يمكنني مساعدتك اليوم؟",
                'hi': "नमस्ते! आज मैं आपकी कैसे मदद कर सकता हूं?",
            },
            'farewell': {
                'en': "Thank you for calling. Have a great day!",
                'es': "Gracias por llamar. ¡Que tengas un gran día!",
                'fr': "Merci d'avoir appelé. Bonne journée!",
                'de': "Vielen Dank für Ihren Anruf. Einen schönen Tag noch!",
                'zh': "感谢您的来电。祝您有美好的一天！",
                'ja': "お電話ありがとうございました。良い一日を！",
                'ar': "شكرا لك على الاتصال. أتمنى لك يوما عظيما!",
                'hi': "कॉल करने के लिए धन्यवाद। आपका दिन शुभ हो!",
            },
            'confirmation': {
                'en': "I understand. Let me help you with that.",
                'es': "Entiendo. Déjame ayudarte con eso.",
                'fr': "Je comprends. Laissez-moi vous aider avec ça.",
                'de': "Ich verstehe. Lassen Sie mich Ihnen dabei helfen.",
                'zh': "我明白了。让我帮你解决这个问题。",
                'ja': "わかりました。それについてお手伝いさせてください。",
                'ar': "أفهم. دعني أساعدك في ذلك.",
                'hi': "मैं समझता हूं। मुझे इसमें आपकी मदद करने दें।",
            }
        }
    
    async def generate_response(
        self,
        text: str,
        language: str,
        agent_id: str,
        call_id: str,
        context: Dict[str, Any],
        intent: str,
        entities: List[Dict],
        sentiment: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate contextual response based on input and conversation history
        """
        try:
            # Get or create conversation history
            conv_key = f"{agent_id}:{call_id}"
            if conv_key not in self.conversations:
                self.conversations[conv_key] = {
                    'history': [],
                    'context': context,
                    'turn_count': 0
                }
            
            conversation = self.conversations[conv_key]
            conversation['turn_count'] += 1
            
            # Add user message to history
            conversation['history'].append({
                'role': 'user',
                'content': text,
                'intent': intent,
                'sentiment': sentiment['sentiment']
            })
            
            # Check for end-of-call intents
            should_end = intent in ['farewell', 'goodbye', 'end_call', 'thank_you_goodbye']
            
            # Generate response based on intent and sentiment
            if intent in self.response_templates and language in self.response_templates[intent]:
                # Use template for common intents
                response = self.response_templates[intent][language]
            else:
                # Use LLM for complex responses
                response = await self._generate_llm_response(
                    text=text,
                    language=language,
                    intent=intent,
                    entities=entities,
                    sentiment=sentiment,
                    conversation_history=conversation['history'],
                    context=conversation['context']
                )
            
            # Add assistant response to history
            conversation['history'].append({
                'role': 'assistant',
                'content': response
            })
            
            # Update context with extracted entities
            for entity in entities:
                conversation['context'][entity['type']] = entity['value']
            
            return {
                'response': response,
                'context': conversation['context'],
                'should_end_call': should_end,
                'turn_count': conversation['turn_count']
            }
            
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            return {
                'response': "I apologize, but I'm having trouble processing that. Could you please repeat?",
                'context': context,
                'should_end_call': False,
                'turn_count': 0
            }
    
    async def _generate_llm_response(
        self,
        text: str,
        language: str,
        intent: str,
        entities: List[Dict],
        sentiment: Dict[str, Any],
        conversation_history: List[Dict],
        context: Dict[str, Any]
    ) -> str:
        """
        Generate response using LLM (GPT-4o or Claude)
        """
        try:
            # Prepare system prompt
            system_prompt = self._build_system_prompt(language, intent, context)
            
            # Prepare conversation history for LLM
            messages = [{'role': 'system', 'content': system_prompt}]
            
            # Add recent history (last 5 turns)
            for msg in conversation_history[-10:]:
                messages.append({
                    'role': msg['role'],
                    'content': msg['content']
                })
            
            # Choose LLM based on sentiment complexity
            if sentiment['sentiment'] in ['negative', 'frustrated', 'angry']:
                # Use Claude for empathetic responses
                response = await self._generate_claude_response(messages)
            else:
                # Use GPT-4o for general responses
                response = await self._generate_openai_response(messages)
            
            return response
            
        except Exception as e:
            logger.error(f"LLM generation error: {e}")
            return "I understand. How can I assist you further?"
    
    async def _generate_openai_response(self, messages: List[Dict]) -> str:
        """
        Generate response using OpenAI GPT-4o
        """
        try:
            completion = await self.openai_client.chat.completions.create(
                model=os.getenv('OPENAI_MODEL', 'gpt-4o'),
                messages=messages,
                temperature=0.7,
                max_tokens=150,
                presence_penalty=0.6,
                frequency_penalty=0.3
            )
            
            return completion.choices[0].message.content.strip()
            
        except Exception as e:
            logger.error(f"OpenAI API error: {e}")
            raise
    
    async def _generate_claude_response(self, messages: List[Dict]) -> str:
        """
        Generate empathetic response using Claude
        """
        try:
            # Extract system message
            system_msg = messages[0]['content']
            conversation_msgs = messages[1:]
            
            response = await self.anthropic_client.messages.create(
                model='claude-3-5-sonnet-20241022',
                max_tokens=150,
                system=system_msg,
                messages=conversation_msgs
            )
            
            return response.content[0].text.strip()
            
        except Exception as e:
            logger.error(f"Claude API error: {e}")
            # Fallback to OpenAI
            return await self._generate_openai_response(messages)
    
    def _build_system_prompt(self, language: str, intent: str, context: Dict[str, Any]) -> str:
        """
        Build system prompt for LLM
        """
        prompt = f"""You are an AI call agent assistant speaking in {language}.

Your role:
- Provide helpful, concise, and natural responses suitable for voice conversation
- Keep responses under 30 words when possible
- Be empathetic and professional
- Address the user's intent: {intent}

Context: {json.dumps(context, indent=2)}

Guidelines:
- Speak naturally as if in a phone conversation
- Ask clarifying questions if needed
- Confirm understanding before taking actions
- Be patient and respectful
- Use appropriate cultural context for {language}
"""
        return prompt
    
    def clear_conversation(self, agent_id: str, call_id: str):
        """
        Clear conversation history
        """
        conv_key = f"{agent_id}:{call_id}"
        if conv_key in self.conversations:
            del self.conversations[conv_key]
