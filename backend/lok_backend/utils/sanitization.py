"""Input sanitization utilities"""

import re
import html

def sanitize_for_logging(text, max_length=200):
    """Sanitize text for safe logging"""
    if not text:
        return ""
    
    # Remove control characters and limit length
    sanitized = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', str(text))
    return sanitized[:max_length]

def sanitize_search_query(query, max_length=100):
    """Sanitize search query to prevent SQL injection"""
    if not query:
        return ""
    
    # Escape SQL wildcards and limit length
    sanitized = str(query).replace('%', '\\%').replace('_', '\\_')
    return sanitized[:max_length]

def sanitize_filename(filename):
    """Sanitize filename for safe file operations"""
    if not filename:
        return "unknown"
    
    # Remove dangerous characters
    sanitized = re.sub(r'[<>:"/\\|?*\x00-\x1f]', '', str(filename))
    return sanitized[:255]  # Max filename length

def sanitize_html(text):
    """Sanitize HTML to prevent XSS"""
    if not text:
        return ""
    
    return html.escape(str(text))