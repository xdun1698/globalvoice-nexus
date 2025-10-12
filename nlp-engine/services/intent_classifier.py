import logging
from typing import Dict, List, Any
import re

logger = logging.getLogger(__name__)

class IntentClassifier:
    """
    Intent classification for call agent conversations
    Uses pattern matching and keyword detection
    """
    
    def __init__(self):
        # Define common intents with patterns
        self.intent_patterns = {
            'greeting': [
                r'\b(hello|hi|hey|good morning|good afternoon|good evening)\b',
                r'\bhow are you\b',
            ],
            'farewell': [
                r'\b(goodbye|bye|see you|talk to you later|have a good day)\b',
                r'\bthank you.*goodbye\b',
            ],
            'question': [
                r'\b(what|when|where|who|why|how|can you|could you|would you)\b',
                r'\?$',
            ],
            'complaint': [
                r'\b(problem|issue|complaint|not working|broken|frustrated|angry)\b',
                r'\bnot (happy|satisfied|pleased)\b',
            ],
            'booking': [
                r'\b(book|schedule|appointment|reservation|meeting)\b',
                r'\b(want to|need to|like to) (book|schedule)\b',
            ],
            'cancellation': [
                r'\b(cancel|cancellation|refund)\b',
                r'\bcancel (my|the|this)\b',
            ],
            'information_request': [
                r'\b(tell me|let me know|information about|details about)\b',
                r'\b(what is|what are|how much|how many)\b',
            ],
            'confirmation': [
                r'\b(yes|yeah|yep|correct|right|exactly|sure|okay|ok)\b',
            ],
            'denial': [
                r'\b(no|nope|not|never|incorrect|wrong)\b',
            ],
            'help': [
                r'\b(help|assist|support|need help)\b',
            ],
            'transfer_request': [
                r'\b(speak to|talk to|transfer|representative|human|person)\b',
            ],
            'thank_you': [
                r'\b(thank you|thanks|appreciate)\b',
            ],
            'hold_on': [
                r'\b(wait|hold on|one moment|give me a second)\b',
            ],
        }
    
    async def classify(
        self,
        text: str,
        language: str = "en",
        possible_intents: List[str] = []
    ) -> Dict[str, Any]:
        """
        Classify intent from user text
        """
        try:
            text_lower = text.lower()
            
            # If specific intents provided, only check those
            intents_to_check = possible_intents if possible_intents else self.intent_patterns.keys()
            
            # Score each intent
            intent_scores = {}
            for intent in intents_to_check:
                if intent in self.intent_patterns:
                    score = self._calculate_intent_score(text_lower, intent)
                    if score > 0:
                        intent_scores[intent] = score
            
            # Get best matching intent
            if intent_scores:
                best_intent = max(intent_scores, key=intent_scores.get)
                confidence = min(intent_scores[best_intent], 1.0)
            else:
                best_intent = 'unknown'
                confidence = 0.0
            
            # Extract parameters
            parameters = self._extract_parameters(text, best_intent)
            
            return {
                "intent": best_intent,
                "confidence": confidence,
                "parameters": parameters,
                "all_scores": intent_scores
            }
        except Exception as e:
            logger.error(f"Intent classification error: {e}")
            return {
                "intent": "unknown",
                "confidence": 0.0,
                "parameters": {},
                "all_scores": {}
            }
    
    def _calculate_intent_score(self, text: str, intent: str) -> float:
        """
        Calculate match score for an intent
        """
        patterns = self.intent_patterns.get(intent, [])
        matches = 0
        
        for pattern in patterns:
            if re.search(pattern, text, re.IGNORECASE):
                matches += 1
        
        # Normalize score
        if patterns:
            return matches / len(patterns)
        return 0.0
    
    def _extract_parameters(self, text: str, intent: str) -> Dict[str, Any]:
        """
        Extract relevant parameters based on intent
        """
        parameters = {}
        
        # Extract dates
        date_pattern = r'\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}[/-]\d{1,2}[/-]\d{1,2})\b'
        dates = re.findall(date_pattern, text)
        if dates:
            parameters['date'] = dates[0]
        
        # Extract times
        time_pattern = r'\b(\d{1,2}:\d{2}\s*(?:am|pm)?)\b'
        times = re.findall(time_pattern, text, re.IGNORECASE)
        if times:
            parameters['time'] = times[0]
        
        # Extract phone numbers
        phone_pattern = r'\b(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b'
        phones = re.findall(phone_pattern, text)
        if phones:
            parameters['phone'] = ''.join(phones[0]) if isinstance(phones[0], tuple) else phones[0]
        
        # Extract email addresses
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        emails = re.findall(email_pattern, text)
        if emails:
            parameters['email'] = emails[0]
        
        # Extract names (simple approach)
        if intent in ['booking', 'information_request']:
            name_pattern = r'\bmy name is ([A-Z][a-z]+ [A-Z][a-z]+)\b'
            names = re.findall(name_pattern, text)
            if names:
                parameters['name'] = names[0]
        
        return parameters
