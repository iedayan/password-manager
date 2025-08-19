"""Security analysis service for password health and metrics."""

import re
from datetime import datetime, timedelta
from collections import Counter
from typing import List, Dict, Any
import hashlib


class SecurityAnalyzer:
    """Analyze password security and generate metrics."""
    
    @staticmethod
    def calculate_password_strength(password: str) -> int:
        """Calculate password strength score (0-100)."""
        if not password:
            return 0
        
        score = 0
        
        # Length scoring
        if len(password) >= 12:
            score += 25
        elif len(password) >= 8:
            score += 15
        elif len(password) >= 6:
            score += 10
        
        # Character variety
        if re.search(r'[a-z]', password):
            score += 15
        if re.search(r'[A-Z]', password):
            score += 15
        if re.search(r'\d', password):
            score += 15
        if re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            score += 20
        
        # Patterns (deduct points)
        if re.search(r'(.)\1{2,}', password):  # Repeated characters
            score -= 10
        if re.search(r'(012|123|234|345|456|567|678|789|890)', password):  # Sequential numbers
            score -= 10
        if re.search(r'(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)', password.lower()):  # Sequential letters
            score -= 10
        
        return max(0, min(100, score))
    
    @staticmethod
    def find_duplicates(passwords: List[Dict]) -> List[Dict]:
        """Find duplicate passwords."""
        password_hashes = {}
        duplicates = []
        
        for pwd in passwords:
            # Use a simple hash for comparison (in real app, use proper hashing)
            pwd_hash = hashlib.md5(pwd.get('password', '').encode()).hexdigest()
            
            if pwd_hash in password_hashes:
                duplicates.append(pwd)
                # Also mark the original as duplicate if not already
                original = password_hashes[pwd_hash]
                if original not in duplicates:
                    duplicates.append(original)
            else:
                password_hashes[pwd_hash] = pwd
        
        return duplicates
    
    @staticmethod
    def find_old_passwords(passwords: List[Dict], days_threshold: int = 365) -> List[Dict]:
        """Find passwords older than threshold."""
        cutoff_date = datetime.now() - timedelta(days=days_threshold)
        old_passwords = []
        
        for pwd in passwords:
            created_at = pwd.get('created_at')
            if created_at:
                if isinstance(created_at, str):
                    try:
                        created_date = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                    except:
                        continue
                else:
                    created_date = created_at
                
                if created_date < cutoff_date:
                    old_passwords.append(pwd)
        
        return old_passwords
    
    @staticmethod
    def analyze_password_health(passwords: List[Dict]) -> Dict[str, Any]:
        """Comprehensive password health analysis."""
        if not passwords:
            return {
                'total_passwords': 0,
                'security_score': 0,
                'strong_passwords': 0,
                'weak_passwords': 0,
                'medium_passwords': 0,
                'duplicate_passwords': 0,
                'old_passwords': 0,
                'reused_passwords': 0,
                'average_strength': 0,
                'recommendations': ['Add passwords to get security analysis']
            }
        
        # Calculate strength for each password
        for pwd in passwords:
            if 'strength_score' not in pwd or pwd['strength_score'] is None:
                pwd['strength_score'] = SecurityAnalyzer.calculate_password_strength(pwd.get('password', ''))
        
        total = len(passwords)
        strong = len([p for p in passwords if (p.get('strength_score', 0) or 0) >= 80])
        medium = len([p for p in passwords if 60 <= (p.get('strength_score', 0) or 0) < 80])
        weak = len([p for p in passwords if (p.get('strength_score', 0) or 0) < 60])
        
        duplicates = SecurityAnalyzer.find_duplicates(passwords)
        old_passwords = SecurityAnalyzer.find_old_passwords(passwords)
        
        # Calculate reused passwords (same logic as duplicates for now)
        reused = len(duplicates)
        
        # Calculate overall security score
        security_score = round(
            (strong / total) * 40 +
            ((total - weak) / total) * 30 +
            ((total - len(duplicates)) / total) * 20 +
            ((total - len(old_passwords)) / total) * 10
        )
        
        # Generate recommendations
        recommendations = []
        if weak > 0:
            recommendations.append(f"Update {weak} weak passwords")
        if len(duplicates) > 0:
            recommendations.append(f"Fix {len(duplicates)} duplicate passwords")
        if len(old_passwords) > 0:
            recommendations.append(f"Update {len(old_passwords)} old passwords")
        if not recommendations:
            recommendations.append("Great job! Your password security is excellent")
        
        average_strength = sum(p.get('strength_score', 0) or 0 for p in passwords) / total
        
        return {
            'total_passwords': total,
            'security_score': security_score,
            'strong_passwords': strong,
            'weak_passwords': weak,
            'medium_passwords': medium,
            'duplicate_passwords': len(duplicates),
            'old_passwords': len(old_passwords),
            'reused_passwords': reused,
            'average_strength': round(average_strength),
            'recommendations': recommendations,
            'duplicate_list': [{'id': p.get('id'), 'site_name': p.get('site_name')} for p in duplicates],
            'old_password_list': [{'id': p.get('id'), 'site_name': p.get('site_name')} for p in old_passwords]
        }


class BreachChecker:
    """Check passwords against known breaches."""
    
    # Common breached passwords (in real implementation, use HaveIBeenPwned API)
    COMMON_BREACHED = {
        'password', '123456', 'password123', 'admin', 'qwerty',
        'letmein', 'welcome', 'monkey', '1234567890', 'abc123'
    }
    
    @staticmethod
    def check_password_breach(password: str) -> Dict[str, Any]:
        """Check if password appears in known breaches."""
        is_breached = password.lower() in BreachChecker.COMMON_BREACHED
        
        return {
            'is_breached': is_breached,
            'breach_count': 1 if is_breached else 0,
            'severity': 'high' if is_breached else 'none'
        }
    
    @staticmethod
    def bulk_breach_check(passwords: List[Dict]) -> Dict[str, Any]:
        """Check multiple passwords for breaches."""
        breached_passwords = []
        total_breaches = 0
        
        for pwd in passwords:
            result = BreachChecker.check_password_breach(pwd.get('password', ''))
            if result['is_breached']:
                breached_passwords.append({
                    'id': pwd.get('id'),
                    'site_name': pwd.get('site_name'),
                    'severity': result['severity']
                })
                total_breaches += 1
        
        return {
            'total_checked': len(passwords),
            'breached_count': total_breaches,
            'breached_passwords': breached_passwords,
            'risk_level': 'high' if total_breaches > 0 else 'low'
        }