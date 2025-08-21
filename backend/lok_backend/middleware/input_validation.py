"""Input validation and sanitization utilities"""

import re
from flask import request, jsonify
from functools import wraps
import logging

logger = logging.getLogger(__name__)

# Validation patterns
EMAIL_PATTERN = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
PASSWORD_PATTERN = re.compile(r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$')
SITE_NAME_PATTERN = re.compile(r'^[a-zA-Z0-9\s\-_.]{1,100}$')
USERNAME_PATTERN = re.compile(r'^[a-zA-Z0-9@._\-]{1,100}$')

def validate_email(email):
    """Validate email format"""
    if not email or len(email) > 254:
        return False
    return EMAIL_PATTERN.match(email) is not None

def validate_password_strength(password):
    """Validate password meets security requirements"""
    if not password or len(password) < 8 or len(password) > 128:
        return False
    return PASSWORD_PATTERN.match(password) is not None

def sanitize_string(value, max_length=255):
    """Sanitize string input"""
    if not isinstance(value, str):
        return ""
    # Remove control characters and limit length
    sanitized = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', value)
    return sanitized[:max_length].strip()

def validate_json_input(required_fields=None, optional_fields=None):
    """Decorator to validate JSON input"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            try:
                data = request.get_json()
                if not data:
                    return jsonify({"error": "JSON data required"}), 400
                
                # Check required fields
                if required_fields:
                    missing_fields = [field for field in required_fields if field not in data]
                    if missing_fields:
                        return jsonify({"error": f"Missing required fields: {missing_fields}"}), 400
                
                # Validate field types and sanitize
                for field, value in data.items():
                    if isinstance(value, str):
                        data[field] = sanitize_string(value)
                
                request.validated_json = data
                return f(*args, **kwargs)
                
            except Exception as e:
                logger.warning(f"JSON validation failed: {str(e)[:100]}")
                return jsonify({"error": "Invalid JSON format"}), 400
        
        return decorated_function
    return decorator

def validate_password_data(f):
    """Validate password creation/update data"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        data = getattr(request, 'validated_json', request.get_json())
        
        # Validate site_name
        if 'site_name' in data:
            if not SITE_NAME_PATTERN.match(data['site_name']):
                return jsonify({"error": "Invalid site name format"}), 400
        
        # Validate username
        if 'username' in data:
            if not USERNAME_PATTERN.match(data['username']):
                return jsonify({"error": "Invalid username format"}), 400
        
        # Validate site_url if provided
        if 'site_url' in data and data['site_url']:
            if not data['site_url'].startswith(('http://', 'https://')):
                return jsonify({"error": "Invalid URL format"}), 400
            if len(data['site_url']) > 2048:
                return jsonify({"error": "URL too long"}), 400
        
        return f(*args, **kwargs)
    
    return decorated_function