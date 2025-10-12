import logging
from typing import Dict, List
from langdetect import detect, detect_langs, LangDetectException
import pycld2 as cld2

logger = logging.getLogger(__name__)

class LanguageDetector:
    """
    Advanced language detection supporting 100+ languages
    Uses hybrid approach with langdetect and CLD2 for accuracy
    """
    
    def __init__(self):
        # Top 100+ supported languages
        self.supported_languages = [
            'en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko',
            'ar', 'hi', 'bn', 'pa', 'te', 'mr', 'ta', 'ur', 'gu', 'kn',
            'ml', 'or', 'ne', 'si', 'my', 'km', 'lo', 'th', 'vi', 'id',
            'ms', 'tl', 'jv', 'su', 'nl', 'pl', 'uk', 'cs', 'sk', 'ro',
            'hu', 'el', 'bg', 'sr', 'hr', 'bs', 'sl', 'mk', 'sq', 'lt',
            'lv', 'et', 'fi', 'sv', 'no', 'da', 'is', 'ga', 'cy', 'gd',
            'eu', 'ca', 'gl', 'ast', 'oc', 'br', 'co', 'fo', 'fy', 'lb',
            'af', 'zu', 'xh', 'st', 'tn', 'sw', 'rw', 'rn', 'ny', 'sn',
            'yo', 'ig', 'ha', 'am', 'ti', 'om', 'so', 'mg', 'eo', 'la',
            'he', 'yi', 'fa', 'ps', 'ku', 'az', 'uz', 'kk', 'ky', 'tg',
            'tk', 'mn', 'bo', 'dz', 'ka', 'hy', 'tr', 'tt', 'ba', 'cv'
        ]
        
        self.language_names = {
            'en': 'English', 'es': 'Spanish', 'fr': 'French', 'de': 'German',
            'it': 'Italian', 'pt': 'Portuguese', 'ru': 'Russian', 'zh': 'Chinese',
            'ja': 'Japanese', 'ko': 'Korean', 'ar': 'Arabic', 'hi': 'Hindi',
            'bn': 'Bengali', 'pa': 'Punjabi', 'te': 'Telugu', 'mr': 'Marathi',
            'ta': 'Tamil', 'ur': 'Urdu', 'gu': 'Gujarati', 'kn': 'Kannada',
            'ml': 'Malayalam', 'th': 'Thai', 'vi': 'Vietnamese', 'id': 'Indonesian',
            'tr': 'Turkish', 'pl': 'Polish', 'uk': 'Ukrainian', 'nl': 'Dutch',
            'sv': 'Swedish', 'no': 'Norwegian', 'da': 'Danish', 'fi': 'Finnish',
            'el': 'Greek', 'he': 'Hebrew', 'fa': 'Persian', 'sw': 'Swahili'
        }
    
    async def detect(self, text: str) -> str:
        """
        Detect language from text using hybrid approach
        """
        if not text or len(text.strip()) < 3:
            return 'en'  # Default to English for very short text
        
        try:
            # Method 1: langdetect (fast, good for most cases)
            lang_detect = detect(text)
            
            # Method 2: CLD2 (more accurate for longer text)
            try:
                is_reliable, text_bytes_found, details = cld2.detect(text)
                cld2_lang = details[0][1]
                
                # If both agree, high confidence
                if lang_detect == cld2_lang:
                    return lang_detect
                
                # If CLD2 is reliable, prefer it
                if is_reliable:
                    return cld2_lang
            except Exception as e:
                logger.debug(f"CLD2 detection failed: {e}")
            
            # Return langdetect result as fallback
            return lang_detect
            
        except LangDetectException as e:
            logger.warning(f"Language detection failed: {e}")
            return 'en'
        except Exception as e:
            logger.error(f"Unexpected error in language detection: {e}")
            return 'en'
    
    async def get_confidence(self, text: str) -> float:
        """
        Get confidence score for language detection
        """
        try:
            langs = detect_langs(text)
            if langs:
                return float(langs[0].prob)
            return 0.0
        except Exception as e:
            logger.error(f"Error getting confidence: {e}")
            return 0.0
    
    async def detect_multiple(self, text: str, top_n: int = 3) -> List[Dict]:
        """
        Detect multiple possible languages with probabilities
        """
        try:
            langs = detect_langs(text)
            results = []
            
            for lang in langs[:top_n]:
                results.append({
                    'language': lang.lang,
                    'language_name': self.language_names.get(lang.lang, lang.lang),
                    'probability': float(lang.prob),
                    'supported': lang.lang in self.supported_languages
                })
            
            return results
        except Exception as e:
            logger.error(f"Error detecting multiple languages: {e}")
            return [{'language': 'en', 'language_name': 'English', 'probability': 1.0, 'supported': True}]
    
    def get_language_name(self, code: str) -> str:
        """
        Get full language name from ISO code
        """
        return self.language_names.get(code, code.upper())
    
    def is_supported(self, language_code: str) -> bool:
        """
        Check if language is supported
        """
        return language_code in self.supported_languages
