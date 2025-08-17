import re
import math

def calculate_password_strength(password):
    """Calculate password strength score (0-100)"""
    if not password:
        return 0
    
    score = 0
    length = len(password)
    
    # Length scoring
    if length >= 12:
        score += 25
    elif length >= 8:
        score += 15
    elif length >= 6:
        score += 5
    
    # Character variety
    if re.search(r'[a-z]', password):
        score += 5
    if re.search(r'[A-Z]', password):
        score += 5
    if re.search(r'\d', password):
        score += 5
    if re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        score += 10
    
    # Entropy bonus
    charset_size = 0
    if re.search(r'[a-z]', password):
        charset_size += 26
    if re.search(r'[A-Z]', password):
        charset_size += 26
    if re.search(r'\d', password):
        charset_size += 10
    if re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        charset_size += 32
    
    if charset_size > 0:
        entropy = length * math.log2(charset_size)
        if entropy >= 60:
            score += 20
        elif entropy >= 40:
            score += 10
        elif entropy >= 25:
            score += 5
    
    # Pattern penalties
    if re.search(r'(.)\1{2,}', password):  # Repeated characters
        score -= 10
    if re.search(r'(012|123|234|345|456|567|678|789|890|abc|bcd|cde)', password.lower()):
        score -= 15
    if re.search(r'(password|123456|qwerty)', password.lower()):
        score -= 25
    
    return max(0, min(100, score))