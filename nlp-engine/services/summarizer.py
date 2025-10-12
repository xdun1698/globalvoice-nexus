import logging
from typing import Dict, Any, List
import os
from openai import AsyncOpenAI

logger = logging.getLogger(__name__)

class SummarizationService:
    """
    Conversation summarization service
    """
    
    def __init__(self):
        self.openai_client = AsyncOpenAI(api_key=os.getenv('OPENAI_API_KEY'))
    
    async def summarize(self, transcript: str, language: str = "en") -> Dict[str, Any]:
        """
        Summarize conversation transcript
        """
        try:
            summary = await self._generate_summary(transcript, language)
            key_points = await self._extract_key_points(transcript, language)
            action_items = await self._extract_action_items(transcript, language)
            overall_sentiment = self._determine_sentiment(transcript)
            
            return {
                "summary": summary,
                "key_points": key_points,
                "action_items": action_items,
                "overall_sentiment": overall_sentiment,
                "word_count": len(transcript.split()),
                "language": language
            }
        except Exception as e:
            logger.error(f"Summarization error: {e}")
            return {
                "summary": "Unable to generate summary",
                "key_points": [],
                "action_items": [],
                "overall_sentiment": "neutral",
                "word_count": 0,
                "language": language
            }
    
    async def _generate_summary(self, transcript: str, language: str) -> str:
        try:
            prompt = f"Summarize this call in {language} (2-3 sentences):\n\n{transcript[:2000]}"
            response = await self.openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=150
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"Summary error: {e}")
            return "Summary unavailable"
    
    async def _extract_key_points(self, transcript: str, language: str) -> List[str]:
        try:
            prompt = f"Extract 3-5 key points from this call:\n\n{transcript[:2000]}"
            response = await self.openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=200
            )
            content = response.choices[0].message.content.strip()
            points = [line.strip('- •*').strip() for line in content.split('\n') if line.strip()]
            return points[:5]
        except Exception as e:
            logger.error(f"Key points error: {e}")
            return []
    
    async def _extract_action_items(self, transcript: str, language: str) -> List[Dict[str, str]]:
        try:
            prompt = f"Extract action items (format: Person: Action):\n\n{transcript[:2000]}"
            response = await self.openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=200
            )
            content = response.choices[0].message.content.strip()
            action_items = []
            for line in content.split('\n'):
                if ':' in line:
                    parts = line.split(':', 1)
                    if len(parts) == 2:
                        action_items.append({"responsible": parts[0].strip(), "action": parts[1].strip()})
            return action_items[:5]
        except Exception as e:
            logger.error(f"Action items error: {e}")
            return []
    
    def _determine_sentiment(self, transcript: str) -> str:
        positive = ['thank', 'great', 'excellent', 'happy', 'satisfied']
        negative = ['problem', 'issue', 'frustrated', 'angry', 'disappointed']
        transcript_lower = transcript.lower()
        pos_count = sum(1 for w in positive if w in transcript_lower)
        neg_count = sum(1 for w in negative if w in transcript_lower)
        if pos_count > neg_count:
            return "positive"
        elif neg_count > pos_count:
            return "negative"
        return "neutral"
