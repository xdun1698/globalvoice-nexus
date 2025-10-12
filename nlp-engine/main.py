import os
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import uvicorn

from services.language_detector import LanguageDetector
from services.translator import TranslationService
from services.intent_classifier import IntentClassifier
from services.entity_extractor import EntityExtractor
from services.sentiment_analyzer import SentimentAnalyzer
from services.conversation_manager import ConversationManager
from services.summarizer import SummarizationService
from utils.logger import setup_logger

# Setup logging
logger = setup_logger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="GlobalVoice Nexus NLP Engine",
    description="Advanced multilingual NLP engine for AI call agents",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
language_detector = LanguageDetector()
translator = TranslationService()
intent_classifier = IntentClassifier()
entity_extractor = EntityExtractor()
sentiment_analyzer = SentimentAnalyzer()
conversation_manager = ConversationManager()
summarizer = SummarizationService()

# Pydantic models
class LanguageDetectionRequest(BaseModel):
    text: str

class TranslationRequest(BaseModel):
    text: str
    from_language: str
    to_language: str

class ProcessRequest(BaseModel):
    text: str
    language: str
    agent_id: str
    call_id: str
    context: Dict[str, Any] = {}

class SentimentRequest(BaseModel):
    text: str
    language: str = "en"

class IntentRequest(BaseModel):
    text: str
    language: str = "en"
    possible_intents: List[str] = []

class EntityRequest(BaseModel):
    text: str
    language: str = "en"

class SummarizeRequest(BaseModel):
    transcript: str
    language: str = "en"

class CSATRequest(BaseModel):
    transcript: str
    sentiment: Dict[str, Any]

# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "NLP Engine",
        "version": "1.0.0"
    }

# Language detection endpoint
@app.post("/detect-language")
async def detect_language(request: LanguageDetectionRequest):
    try:
        language = await language_detector.detect(request.text)
        confidence = await language_detector.get_confidence(request.text)
        
        return {
            "language": language,
            "confidence": confidence,
            "supported": language in language_detector.supported_languages
        }
    except Exception as e:
        logger.error(f"Language detection error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Translation endpoint
@app.post("/translate")
async def translate(request: TranslationRequest):
    try:
        translated_text = await translator.translate(
            request.text,
            request.from_language,
            request.to_language
        )
        
        return {
            "translated_text": translated_text,
            "from_language": request.from_language,
            "to_language": request.to_language
        }
    except Exception as e:
        logger.error(f"Translation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Main processing endpoint
@app.post("/process")
async def process_input(request: ProcessRequest):
    try:
        # Detect intent
        intent_result = await intent_classifier.classify(
            request.text,
            request.language
        )
        
        # Extract entities
        entities = await entity_extractor.extract(
            request.text,
            request.language
        )
        
        # Analyze sentiment
        sentiment = await sentiment_analyzer.analyze(
            request.text,
            request.language
        )
        
        # Generate response using conversation manager
        response_data = await conversation_manager.generate_response(
            text=request.text,
            language=request.language,
            agent_id=request.agent_id,
            call_id=request.call_id,
            context=request.context,
            intent=intent_result["intent"],
            entities=entities,
            sentiment=sentiment
        )
        
        return {
            "response": response_data["response"],
            "intent": intent_result["intent"],
            "entities": entities,
            "sentiment": sentiment,
            "confidence": intent_result["confidence"],
            "context": response_data["context"],
            "should_end_call": response_data.get("should_end_call", False)
        }
    except Exception as e:
        logger.error(f"Processing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Sentiment analysis endpoint
@app.post("/sentiment")
async def analyze_sentiment(request: SentimentRequest):
    try:
        result = await sentiment_analyzer.analyze(
            request.text,
            request.language
        )
        
        return result
    except Exception as e:
        logger.error(f"Sentiment analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Intent classification endpoint
@app.post("/intent")
async def classify_intent(request: IntentRequest):
    try:
        result = await intent_classifier.classify(
            request.text,
            request.language,
            request.possible_intents
        )
        
        return result
    except Exception as e:
        logger.error(f"Intent classification error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Entity extraction endpoint
@app.post("/entities")
async def extract_entities(request: EntityRequest):
    try:
        entities = await entity_extractor.extract(
            request.text,
            request.language
        )
        
        return {"entities": entities}
    except Exception as e:
        logger.error(f"Entity extraction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Summarization endpoint
@app.post("/summarize")
async def summarize_conversation(request: SummarizeRequest):
    try:
        result = await summarizer.summarize(
            request.transcript,
            request.language
        )
        
        return result
    except Exception as e:
        logger.error(f"Summarization error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# CSAT calculation endpoint
@app.post("/csat")
async def calculate_csat(request: CSATRequest):
    try:
        result = await sentiment_analyzer.calculate_csat(
            request.transcript,
            request.sentiment
        )
        
        return result
    except Exception as e:
        logger.error(f"CSAT calculation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Supported languages endpoint
@app.get("/languages")
async def get_supported_languages():
    return {
        "languages": language_detector.supported_languages,
        "total": len(language_detector.supported_languages)
    }

if __name__ == "__main__":
    port = int(os.getenv("NLP_ENGINE_PORT", 8001))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )
