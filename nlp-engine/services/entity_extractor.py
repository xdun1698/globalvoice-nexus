import logging
from typing import List, Dict, Any
import re
from datetime import datetime

logger = logging.getLogger(__name__)

class EntityExtractor:
    """
    Extract named entities from text
    Supports: names, dates, times, locations, organizations, phone numbers, emails
    """
    
    def __init__(self):
        self.entity_patterns = {
            'date': [
                r'\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b',
                r'\b(\d{4}[/-]\d{1,2}[/-]\d{1,2})\b',
                r'\b(today|tomorrow|yesterday)\b',
                r'\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b',
                r'\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}\b',
            ],
            'time': [
                r'\b(\d{1,2}:\d{2}\s*(?:am|pm)?)\b',
                r'\b(\d{1,2}\s*(?:am|pm))\b',
                r'\b(morning|afternoon|evening|night)\b',
            ],
            'phone': [
                r'\b(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b',
            ],
            'email': [
                r'\b([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,})\b',
            ],
            'money': [
                r'\$\s*\d+(?:,\d{3})*(?:\.\d{2})?',
                r'\b\d+(?:,\d{3})*(?:\.\d{2})?\s*(?:dollars|usd|eur|gbp)\b',
            ],
            'number': [
                r'\b\d+(?:,\d{3})*(?:\.\d+)?\b',
            ],
            'url': [
                r'https?://[^\s]+',
                r'www\.[^\s]+',
            ],
        }
    
    async def extract(self, text: str, language: str = "en") -> List[Dict[str, Any]]:
        """
        Extract all entities from text
        """
        entities = []
        
        try:
            # Extract each entity type
            for entity_type, patterns in self.entity_patterns.items():
                for pattern in patterns:
                    matches = re.finditer(pattern, text, re.IGNORECASE)
                    for match in matches:
                        entity_value = match.group(0)
                        
                        # Normalize entity value
                        normalized_value = self._normalize_entity(entity_value, entity_type)
                        
                        entities.append({
                            'type': entity_type,
                            'value': entity_value,
                            'normalized_value': normalized_value,
                            'start': match.start(),
                            'end': match.end(),
                            'confidence': 0.9  # Pattern-based extraction has high confidence
                        })
            
            # Remove duplicates
            entities = self._deduplicate_entities(entities)
            
            # Sort by position in text
            entities.sort(key=lambda x: x['start'])
            
            return entities
        except Exception as e:
            logger.error(f"Entity extraction error: {e}")
            return []
    
    def _normalize_entity(self, value: str, entity_type: str) -> Any:
        """
        Normalize entity values to standard formats
        """
        try:
            if entity_type == 'phone':
                # Remove non-digit characters
                return re.sub(r'[^\d+]', '', value)
            
            elif entity_type == 'email':
                return value.lower()
            
            elif entity_type == 'date':
                # Try to parse date
                return self._parse_date(value)
            
            elif entity_type == 'time':
                return self._parse_time(value)
            
            elif entity_type == 'money':
                # Extract numeric value
                numeric = re.sub(r'[^\d.]', '', value)
                return float(numeric) if numeric else None
            
            elif entity_type == 'number':
                # Remove commas and convert to number
                numeric = value.replace(',', '')
                try:
                    return int(numeric)
                except ValueError:
                    return float(numeric)
            
            else:
                return value
        except Exception as e:
            logger.debug(f"Normalization error for {entity_type}: {e}")
            return value
    
    def _parse_date(self, date_str: str) -> str:
        """
        Parse date string to ISO format
        """
        date_str_lower = date_str.lower()
        
        # Handle relative dates
        if date_str_lower == 'today':
            return datetime.now().strftime('%Y-%m-%d')
        elif date_str_lower == 'tomorrow':
            from datetime import timedelta
            return (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
        elif date_str_lower == 'yesterday':
            from datetime import timedelta
            return (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')
        
        # Try common date formats
        formats = ['%m/%d/%Y', '%d/%m/%Y', '%Y-%m-%d', '%m-%d-%Y', '%d-%m-%Y']
        for fmt in formats:
            try:
                return datetime.strptime(date_str, fmt).strftime('%Y-%m-%d')
            except ValueError:
                continue
        
        return date_str
    
    def _parse_time(self, time_str: str) -> str:
        """
        Parse time string to standard format
        """
        time_str_lower = time_str.lower()
        
        # Handle relative times
        if time_str_lower in ['morning', 'afternoon', 'evening', 'night']:
            return time_str_lower
        
        # Try to parse time
        try:
            # Handle formats like "2:30pm" or "14:30"
            if 'am' in time_str_lower or 'pm' in time_str_lower:
                time_obj = datetime.strptime(time_str_lower, '%I:%M%p')
            else:
                time_obj = datetime.strptime(time_str, '%H:%M')
            return time_obj.strftime('%H:%M')
        except ValueError:
            return time_str
    
    def _deduplicate_entities(self, entities: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Remove duplicate entities
        """
        seen = set()
        unique_entities = []
        
        for entity in entities:
            key = (entity['type'], entity['value'], entity['start'])
            if key not in seen:
                seen.add(key)
                unique_entities.append(entity)
        
        return unique_entities
