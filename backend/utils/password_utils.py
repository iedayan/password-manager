def calculate_password_strength(password: str) -> int:
    """Calculate password strength score (0-100)"""
    score = 0
    
    if len(password) >= 8:
        score += 20
    if len(password) >= 12:
        score += 10
    if any(c.islower() for c in password):
        score += 15
    if any(c.isupper() for c in password):
        score += 15
    if any(c.isdigit() for c in password):
        score += 15
    if any(c in '!@#$%^&*()_+-=[]{}|;:,.<>?' for c in password):
        score += 25
    
    return min(score, 100)