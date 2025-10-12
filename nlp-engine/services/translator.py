import logging
from typing import Dict, Optional
from deep_translator import GoogleTranslator
import asyncio

logger = logging.getLogger(__name__)

class TranslationService:
    """
    Translation service supporting 100+ languages
    Uses Google Translate API via deep-translator
    """
    
    def __init__(self):
        self.cache = {}  # Simple in-memory cache
        
        # Supported languages (ISO 639-1 codes)
        self.supported_languages = [
            'en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh-CN', 'zh-TW', 'ja', 'ko',
            'ar', 'hi', 'bn', 'pa', 'te', 'mr', 'ta', 'ur', 'gu', 'kn', 'ml',
            'th', 'vi', 'id', 'ms', 'tl', 'nl', 'pl', 'uk', 'cs', 'sk', 'ro',
            'hu', 'el', 'bg', 'sr', 'hr', 'sl', 'lt', 'lv', 'et', 'fi', 'sv',
            'no', 'da', 'is', 'tr', 'he', 'fa', 'sw', 'af', 'zu'
        ]
    
    async def translate(
        self,
        text: str,
        from_language: str,
        to_language: str
    ) -> str:
        """
        Translate text from one language to another
        """
        # Check cache first
        cache_key = f"{from_language}:{to_language}:{text}"
        if cache_key in self.cache:
            return self.cache[cache_key]
        
        # No translation needed if same language
        if from_language == to_language:
            return text
        
        try:
            # Normalize language codes
            from_lang = self._normalize_language_code(from_language)
            to_lang = self._normalize_language_code(to_language)
            
            # Validate languages
            if from_lang not in self.supported_languages:
                logger.warning(f"Unsupported source language: {from_language}")
                return text
            
            if to_lang not in self.supported_languages:
                logger.warning(f"Unsupported target language: {to_language}")
                return text
            
            # Perform translation
            translator = GoogleTranslator(source=from_lang, target=to_lang)
            
            # Run in thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            translated = await loop.run_in_executor(
                None,
                lambda: translator.translate(text)
            )
            
            # Cache result
            self.cache[cache_key] = translated
            
            # Limit cache size
            if len(self.cache) > 1000:
                # Remove oldest entries
                keys_to_remove = list(self.cache.keys())[:100]
                for key in keys_to_remove:
                    del self.cache[key]
            
            return translated
        except Exception as e:
            logger.error(f"Translation error ({from_language} -> {to_language}): {e}")
            return text  # Return original text on error
    
    async def batch_translate(
        self,
        texts: list,
        from_language: str,
        to_language: str
    ) -> list:
        """
        Translate multiple texts
        """
        tasks = [
            self.translate(text, from_language, to_language)
            for text in texts
        ]
        return await asyncio.gather(*tasks)
    
    def _normalize_language_code(self, code: str) -> str:
        """
        Normalize language code to supported format
        """
        # Map common variations
        code_map = {
            'zh': 'zh-CN',
            'chinese': 'zh-CN',
            'mandarin': 'zh-CN',
            'cantonese': 'zh-TW',
            'filipino': 'tl',
            'tagalog': 'tl',
            'norwegian': 'no',
            'farsi': 'fa',
            'persian': 'fa',
        }
        
        code_lower = code.lower()
        return code_map.get(code_lower, code_lower)
    
    def is_supported(self, language_code: str) -> bool:
        """
        Check if language is supported
        """
        normalized = self._normalize_language_code(language_code)
        return normalized in self.supported_languages
    
    def get_supported_languages(self) -> list:
        """
        Get list of supported languages
        """
        return self.supported_languages.copy()
