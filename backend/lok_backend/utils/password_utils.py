"""Password analysis and health utilities."""

from datetime import datetime, timezone
from typing import Dict, List, Any
from collections import Counter
import re


def analyze_password_health(password_data: List[Dict]) -> Dict[str, Any]:
    """
    Comprehensive password health analysis.
    
    Args:
        password_data: List of password dictionaries with keys:
                      id, site_name, username, password, created_at, updated_at
    
    Returns:
        Dictionary with health analysis results
    """
    if not password_data:
        return {
            "total_passwords": 0,
            "weak_passwords": [],
            "reused_passwords": [],
            "old_passwords": [],
            "compromised_passwords": [],
            "overall_score": 100,
            "recommendations": []
        }
    
    weak_passwords = []
    reused_passwords = []
    old_passwords = []
    compromised_passwords = []
    
    # Count password occurrences for duplicate detection
    password_counts = Counter(pwd["password"] for pwd in password_data)
    
    now = datetime.now(timezone.utc)
    
    for pwd in password_data:
        password_text = pwd["password"]
        created_at = pwd.get("created_at")
        
        # Check password strength
        strength = calculate_password_strength(password_text)
        if strength < 60:
            weak_passwords.append({
                **pwd,
                "strength": strength,
                "issue": "Weak password - consider using a stronger password"
            })
        
        # Check for reused passwords
        if password_counts[password_text] > 1:
            reused_passwords.append({
                **pwd,
                "issue": f"Password reused {password_counts[password_text]} times"
            })
        
        # Check password age
        if created_at:
            if isinstance(created_at, str):
                created_date = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
            else:
                created_date = created_at
            
            days_old = (now - created_date).days
            if days_old > 365:
                old_passwords.append({
                    **pwd,
                    "age": days_old,
                    "issue": f"Password is {days_old} days old - consider updating"
                })
        
        # Check against common compromised passwords
        if is_commonly_compromised(password_text):
            compromised_passwords.append({
                **pwd,
                "issue": "Password found in common breach databases"
            })
    
    # Calculate overall score
    total_issues = len(weak_passwords) + len(reused_passwords) + len(old_passwords) + len(compromised_passwords)
    overall_score = max(0, 100 - (total_issues / len(password_data)) * 100)
    
    # Generate recommendations
    recommendations = []
    if weak_passwords:
        recommendations.append(f"Update {len(weak_passwords)} weak passwords")
    if reused_passwords:
        recommendations.append(f"Replace {len(set(pwd['password'] for pwd in reused_passwords))} reused passwords")
    if old_passwords:
        recommendations.append(f"Refresh {len(old_passwords)} old passwords")
    if compromised_passwords:
        recommendations.append(f"Change {len(compromised_passwords)} compromised passwords")
    
    if not recommendations:
        recommendations.append("Your password security looks good!")
    
    return {
        "total_passwords": len(password_data),
        "weak_passwords": weak_passwords,
        "reused_passwords": reused_passwords,
        "old_passwords": old_passwords,
        "compromised_passwords": compromised_passwords,
        "overall_score": round(overall_score),
        "recommendations": recommendations
    }


def calculate_password_strength(password: str) -> int:
    """
    Calculate password strength score (0-100).
    
    Args:
        password: The password to analyze
        
    Returns:
        Strength score from 0 (very weak) to 100 (very strong)
    """
    if not password:
        return 0
    
    score = 0
    
    # Length scoring
    length = len(password)
    if length >= 8:
        score += 20
    if length >= 12:
        score += 10
    if length >= 16:
        score += 10
    
    # Character variety scoring
    if re.search(r'[a-z]', password):
        score += 15
    if re.search(r'[A-Z]', password):
        score += 15
    if re.search(r'[0-9]', password):
        score += 15
    if re.search(r'[^A-Za-z0-9]', password):
        score += 15
    
    # Penalty for common patterns
    if re.search(r'(.)\1{2,}', password):  # Repeated characters
        score -= 10
    if re.search(r'(012|123|234|345|456|567|678|789|890)', password):  # Sequential numbers
        score -= 10
    if re.search(r'(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)', password.lower()):  # Sequential letters
        score -= 10
    
    # Common password patterns
    common_patterns = [
        r'password', r'123456', r'qwerty', r'abc123', r'admin',
        r'letmein', r'welcome', r'monkey', r'dragon', r'master'
    ]
    
    for pattern in common_patterns:
        if re.search(pattern, password.lower()):
            score -= 20
            break
    
    return max(0, min(100, score))


def is_commonly_compromised(password: str) -> bool:
    """
    Check if password is in common breach databases.
    
    Args:
        password: The password to check
        
    Returns:
        True if password is commonly compromised
    """
    # List of most commonly breached passwords
    common_breached = {
        'password', '123456', '123456789', 'qwerty', 'abc123',
        'password123', 'admin', 'letmein', 'welcome', 'monkey',
        'dragon', 'master', 'sunshine', 'princess', 'football',
        'baseball', 'superman', 'michael', 'jordan', 'harley',
        'ranger', 'buster', 'johnny', 'badboy', 'trustno1',
        'pass', 'test', 'guest', 'info', 'love', 'sex', 'god'
    }
    
    return password.lower() in common_breached


def categorize_password_by_site(site_name: str, site_url: str = None) -> str:
    """
    Categorize password based on site information.
    
    Args:
        site_name: Name of the site
        site_url: URL of the site (optional)
        
    Returns:
        Category string
    """
    site_lower = site_name.lower()
    url_lower = (site_url or "").lower()
    
    # Banking and Finance
    banking_keywords = [
        'bank', 'credit', 'paypal', 'venmo', 'chase', 'wells', 'citi',
        'finance', 'investment', 'trading', 'crypto', 'bitcoin'
    ]
    if any(keyword in site_lower or keyword in url_lower for keyword in banking_keywords):
        return 'Banking'
    
    # Email
    email_keywords = ['gmail', 'outlook', 'yahoo', 'proton', 'mail', 'email']
    if any(keyword in site_lower or keyword in url_lower for keyword in email_keywords):
        return 'Email'
    
    # Social Media
    social_keywords = [
        'facebook', 'twitter', 'instagram', 'linkedin', 'tiktok',
        'snapchat', 'reddit', 'discord', 'telegram', 'whatsapp'
    ]
    if any(keyword in site_lower or keyword in url_lower for keyword in social_keywords):
        return 'Social'
    
    # Work/Professional
    work_keywords = [
        'github', 'gitlab', 'aws', 'azure', 'google cloud', 'office',
        'slack', 'teams', 'zoom', 'jira', 'confluence', 'work', 'corp'
    ]
    if any(keyword in site_lower or keyword in url_lower for keyword in work_keywords):
        return 'Work'
    
    # Entertainment
    entertainment_keywords = [
        'netflix', 'spotify', 'youtube', 'disney', 'hulu', 'amazon prime',
        'steam', 'xbox', 'playstation', 'twitch', 'gaming'
    ]
    if any(keyword in site_lower or keyword in url_lower for keyword in entertainment_keywords):
        return 'Entertainment'
    
    # Shopping
    shopping_keywords = [
        'amazon', 'ebay', 'shop', 'store', 'buy', 'cart', 'checkout',
        'walmart', 'target', 'bestbuy', 'etsy'
    ]
    if any(keyword in site_lower or keyword in url_lower for keyword in shopping_keywords):
        return 'Shopping'
    
    return 'Personal'


def generate_security_recommendations(health_data: Dict[str, Any]) -> List[str]:
    """
    Generate personalized security recommendations.
    
    Args:
        health_data: Password health analysis results
        
    Returns:
        List of actionable recommendations
    """
    recommendations = []
    
    weak_count = len(health_data.get('weak_passwords', []))
    reused_count = len(health_data.get('reused_passwords', []))
    old_count = len(health_data.get('old_passwords', []))
    compromised_count = len(health_data.get('compromised_passwords', []))
    
    # Priority recommendations
    if compromised_count > 0:
        recommendations.append(f"🚨 URGENT: Change {compromised_count} compromised passwords immediately")
    
    if weak_count > 0:
        recommendations.append(f"🔒 Strengthen {weak_count} weak passwords using our password generator")
    
    if reused_count > 0:
        recommendations.append(f"🔄 Create unique passwords for {reused_count} accounts with duplicate passwords")
    
    if old_count > 0:
        recommendations.append(f"📅 Update {old_count} passwords that are over a year old")
    
    # General recommendations
    total_passwords = health_data.get('total_passwords', 0)
    if total_passwords < 10:
        recommendations.append("📈 Consider adding more of your accounts for better security coverage")
    
    overall_score = health_data.get('overall_score', 0)
    if overall_score < 70:
        recommendations.append("🛡️ Enable two-factor authentication for critical accounts")
        recommendations.append("📱 Consider using our browser extension for better password management")
    
    if not recommendations:
        recommendations.append("✅ Excellent! Your password security is in great shape")
        recommendations.append("🔄 Continue monitoring and updating passwords regularly")
    
    return recommendations


def calculate_security_score(password_data: List[Dict]) -> Dict[str, Any]:
    """
    Calculate comprehensive security score with breakdown.
    
    Args:
        password_data: List of password dictionaries
        
    Returns:
        Dictionary with detailed security scoring
    """
    if not password_data:
        return {
            "overall_score": 100,
            "strength_score": 100,
            "uniqueness_score": 100,
            "freshness_score": 100,
            "security_level": "Unknown"
        }
    
    # Calculate individual scores
    strength_scores = []
    password_counts = Counter(pwd["password"] for pwd in password_data)
    age_scores = []
    
    now = datetime.now(timezone.utc)
    
    for pwd in password_data:
        # Strength score
        strength = calculate_password_strength(pwd["password"])
        strength_scores.append(strength)
        
        # Age score
        created_at = pwd.get("created_at")
        if created_at:
            if isinstance(created_at, str):
                created_date = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
            else:
                created_date = created_at
            
            days_old = (now - created_date).days
            age_score = max(0, 100 - (days_old / 365) * 50)  # Lose 50 points per year
            age_scores.append(age_score)
        else:
            age_scores.append(50)  # Default for unknown age
    
    # Calculate component scores
    avg_strength = sum(strength_scores) / len(strength_scores)
    
    # Uniqueness score (penalize duplicates)
    unique_passwords = len(set(pwd["password"] for pwd in password_data))
    uniqueness_score = (unique_passwords / len(password_data)) * 100
    
    # Freshness score
    avg_freshness = sum(age_scores) / len(age_scores)
    
    # Overall score (weighted average)
    overall_score = (avg_strength * 0.4 + uniqueness_score * 0.3 + avg_freshness * 0.3)
    
    # Determine security level
    if overall_score >= 90:
        security_level = "Excellent"
    elif overall_score >= 75:
        security_level = "Good"
    elif overall_score >= 60:
        security_level = "Fair"
    elif overall_score >= 40:
        security_level = "Poor"
    else:
        security_level = "Critical"
    
    return {
        "overall_score": round(overall_score),
        "strength_score": round(avg_strength),
        "uniqueness_score": round(uniqueness_score),
        "freshness_score": round(avg_freshness),
        "security_level": security_level
    }