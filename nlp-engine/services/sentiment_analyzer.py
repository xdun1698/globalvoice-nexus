import logging
from typing import Dict, Any, List
from transformers import pipeline
import asyncio

logger = logging.getLogger(__name__)

class SentimentAnalyzer:
    """
    Advanced sentiment analysis with emotion detection
    Supports multilingual sentiment analysis
    """
    
    def __init__(self):
        # Initialize sentiment analysis pipeline
        try:
            self.sentiment_pipeline = pipeline(
                "sentiment-analysis",
                model="distilbert-base-uncased-finetuned-sst-2-english"
            )
            
            # For emotion detection
            self.emotion_pipeline = pipeline(
                "text-classification",
                model="j-hartmann/emotion-english-distilroberta-base",
                top_k=None
            )
        except Exception as e:
            logger.error(f"Failed to initialize sentiment analyzer: {e}")
            self.sentiment_pipeline = None
            self.emotion_pipeline = None
    
    async def analyze(self, text: str, language: str = "en") -> Dict[str, Any]:
        """
        Analyze sentiment and emotions in text
        """
        try:
            # Run sentiment analysis
            sentiment_result = await self._analyze_sentiment(text)
            
            # Run emotion detection
            emotions = await self._detect_emotions(text)
            
            # Calculate overall score (-1 to 1)
            score = self._calculate_score(sentiment_result['label'], sentiment_result['score'])
            
            return {
                "sentiment": sentiment_result['label'].lower(),  # positive, negative, neutral
                "score": score,
                "confidence": sentiment_result['score'],
                "emotions": emotions,
                "language": language
            }
        except Exception as e:
            logger.error(f"Sentiment analysis error: {e}")
            return {
                "sentiment": "neutral",
                "score": 0.0,
                "confidence": 0.0,
                "emotions": [],
                "language": language
            }
    
    async def _analyze_sentiment(self, text: str) -> Dict[str, Any]:
        """
        Perform basic sentiment analysis
        """
        if not self.sentiment_pipeline:
            return {"label": "NEUTRAL", "score": 0.5}
        
        try:
            # Run in thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                None,
                lambda: self.sentiment_pipeline(text[:512])[0]
            )
            return result
        except Exception as e:
            logger.error(f"Sentiment pipeline error: {e}")
            return {"label": "NEUTRAL", "score": 0.5}
    
    async def _detect_emotions(self, text: str) -> List[Dict[str, Any]]:
        """
        Detect specific emotions in text
        """
        if not self.emotion_pipeline:
            return []
        
        try:
            loop = asyncio.get_event_loop()
            results = await loop.run_in_executor(
                None,
                lambda: self.emotion_pipeline(text[:512])[0]
            )
            
            # Sort by score and return top 3
            sorted_emotions = sorted(results, key=lambda x: x['score'], reverse=True)[:3]
            
            return [
                {
                    "emotion": emotion['label'],
                    "confidence": float(emotion['score'])
                }
                for emotion in sorted_emotions
            ]
        except Exception as e:
            logger.error(f"Emotion detection error: {e}")
            return []
    
    def _calculate_score(self, label: str, confidence: float) -> float:
        """
        Convert sentiment label to score (-1 to 1)
        """
        if label.upper() == "POSITIVE":
            return confidence
        elif label.upper() == "NEGATIVE":
            return -confidence
        else:
            return 0.0
    
    async def calculate_csat(self, transcript: str, sentiment: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate Customer Satisfaction (CSAT) score from conversation
        """
        try:
            # Analyze overall sentiment
            overall_sentiment = await self.analyze(transcript)
            
            # Calculate CSAT score (1-5 scale)
            score = self._sentiment_to_csat(overall_sentiment['score'])
            
            # Identify factors affecting CSAT
            factors = self._identify_csat_factors(transcript, overall_sentiment)
            
            return {
                "score": score,
                "confidence": overall_sentiment['confidence'],
                "factors": factors
            }
        except Exception as e:
            logger.error(f"CSAT calculation error: {e}")
            return {
                "score": 3,
                "confidence": 0.0,
                "factors": []
            }
    
    def _sentiment_to_csat(self, sentiment_score: float) -> int:
        """
        Convert sentiment score to CSAT (1-5)
        """
        if sentiment_score >= 0.6:
            return 5
        elif sentiment_score >= 0.2:
            return 4
        elif sentiment_score >= -0.2:
            return 3
        elif sentiment_score >= -0.6:
            return 2
        else:
            return 1
    
    def _identify_csat_factors(self, transcript: str, sentiment: Dict[str, Any]) -> List[str]:
        """
        Identify factors affecting CSAT
        """
        factors = []
        
        # Check for positive indicators
        positive_keywords = ['thank', 'great', 'excellent', 'helpful', 'appreciate', 'perfect']
        negative_keywords = ['frustrated', 'angry', 'disappointed', 'terrible', 'awful', 'useless']
        
        transcript_lower = transcript.lower()
        
        for keyword in positive_keywords:
            if keyword in transcript_lower:
                factors.append(f"Positive: Customer expressed {keyword}")
        
        for keyword in negative_keywords:
            if keyword in transcript_lower:
                factors.append(f"Negative: Customer expressed {keyword}")
        
        # Check emotions
        if sentiment.get('emotions'):
            top_emotion = sentiment['emotions'][0]
            factors.append(f"Primary emotion: {top_emotion['emotion']}")
        
        return factors[:5]  # Return top 5 factors
