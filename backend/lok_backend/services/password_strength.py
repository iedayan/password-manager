import re
import math
from typing import Dict, List
from requests import get
from hashlib import sha1
import logging

logger = logging.getLogger(__name__)


class PasswordStrengthAnalyzer:
    """Advanced password strength analysis with breach checking"""

    def __init__(self):
        self.common_passwords = self._load_common_passwords()
        self.patterns = {
            "sequential": re.compile(
                r"(012|123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)",
                re.IGNORECASE,
            ),
            "repeated": re.compile(r"(.)\1{2,}"),
            "keyboard": re.compile(r"(qwerty|asdf|zxcv|1234|password)", re.IGNORECASE),
            "common_substitutions": re.compile(
                r"[@4aA][sS5$][sS5$][wW][oO0][rR][dD]", re.IGNORECASE
            ),
        }

    def _load_common_passwords(self) -> set:
        """Load common passwords list"""
        # In production, load from a file or database
        return {
            "password",
            "123456",
            "123456789",
            "qwerty",
            "abc123",
            "password123",
            "admin",
            "letmein",
            "welcome",
            "monkey",
            "dragon",
            "master",
            "shadow",
            "superman",
            "michael",
        }

    def analyze_password(self, password: str) -> Dict:
        """Comprehensive password analysis"""
        if not password:
            return {
                "score": 0,
                "strength": "Very Weak",
                "issues": ["Password is empty"],
            }

        analysis = {
            "length": len(password),
            "character_sets": self._analyze_character_sets(password),
            "entropy": self._calculate_entropy(password),
            "patterns": self._detect_patterns(password),
            "common_password": password.lower() in self.common_passwords,
            "breached": False,  # Will be checked separately
        }

        score = self._calculate_score(analysis)
        strength = self._determine_strength(score)
        issues = self._identify_issues(analysis)
        recommendations = self._generate_recommendations(analysis)

        return {
            "score": score,
            "strength": strength,
            "issues": issues,
            "recommendations": recommendations,
            "analysis": analysis,
        }

    def _analyze_character_sets(self, password: str) -> Dict:
        """Analyze character set diversity"""
        return {
            "lowercase": bool(re.search(r"[a-z]", password)),
            "uppercase": bool(re.search(r"[A-Z]", password)),
            "digits": bool(re.search(r"\d", password)),
            "special": bool(re.search(r'[!@#$%^&*(),.?":{}|<>]', password)),
            "unicode": bool(re.search(r"[^\x00-\x7F]", password)),
        }

    def _calculate_entropy(self, password: str) -> float:
        """Calculate password entropy"""
        charset_size = 0
        char_sets = self._analyze_character_sets(password)

        if char_sets["lowercase"]:
            charset_size += 26
        if char_sets["uppercase"]:
            charset_size += 26
        if char_sets["digits"]:
            charset_size += 10
        if char_sets["special"]:
            charset_size += 32
        if char_sets["unicode"]:
            charset_size += 100  # Approximate

        if charset_size == 0:
            return 0

        return len(password) * math.log2(charset_size)

    def _detect_patterns(self, password: str) -> List[str]:
        """Detect common password patterns"""
        detected = []

        for pattern_name, pattern in self.patterns.items():
            if pattern.search(password):
                detected.append(pattern_name)

        # Check for dates
        if re.search(r"\b(19|20)\d{2}\b", password):
            detected.append("date_pattern")

        # Check for personal info patterns (basic)
        if re.search(r"\b(name|user|admin|test)\b", password, re.IGNORECASE):
            detected.append("personal_info")

        return detected

    def _calculate_score(self, analysis: Dict) -> int:
        """Calculate password strength score (0-100)"""
        score = 0

        # Length scoring
        length = analysis["length"]
        if length >= 12:
            score += 25
        elif length >= 8:
            score += 15
        elif length >= 6:
            score += 5

        # Character set diversity
        char_sets = analysis["character_sets"]
        diversity_count = sum(char_sets.values())
        score += diversity_count * 5

        # Entropy bonus
        entropy = analysis["entropy"]
        if entropy >= 60:
            score += 20
        elif entropy >= 40:
            score += 10
        elif entropy >= 25:
            score += 5

        # Pattern penalties
        pattern_penalty = len(analysis["patterns"]) * 10
        score -= pattern_penalty

        # Common password penalty
        if analysis["common_password"]:
            score -= 50

        return max(0, min(100, score))

    def _determine_strength(self, score: int) -> str:
        """Determine strength category"""
        if score >= 80:
            return "Very Strong"
        elif score >= 60:
            return "Strong"
        elif score >= 40:
            return "Moderate"
        elif score >= 20:
            return "Weak"
        else:
            return "Very Weak"

    def _identify_issues(self, analysis: Dict) -> List[str]:
        """Identify specific password issues"""
        issues = []

        if analysis["length"] < 8:
            issues.append("Password is too short (minimum 8 characters)")

        char_sets = analysis["character_sets"]
        if not char_sets["lowercase"]:
            issues.append("Missing lowercase letters")
        if not char_sets["uppercase"]:
            issues.append("Missing uppercase letters")
        if not char_sets["digits"]:
            issues.append("Missing numbers")
        if not char_sets["special"]:
            issues.append("Missing special characters")

        if analysis["common_password"]:
            issues.append("Password is commonly used")

        for pattern in analysis["patterns"]:
            if pattern == "sequential":
                issues.append("Contains sequential characters")
            elif pattern == "repeated":
                issues.append("Contains repeated characters")
            elif pattern == "keyboard":
                issues.append("Contains keyboard patterns")
            elif pattern == "date_pattern":
                issues.append("Contains date patterns")

        return issues

    def _generate_recommendations(self, analysis: Dict) -> List[str]:
        """Generate improvement recommendations"""
        recommendations = []

        if analysis["length"] < 12:
            recommendations.append("Use at least 12 characters for better security")

        char_sets = analysis["character_sets"]
        missing_sets = []
        if not char_sets["lowercase"]:
            missing_sets.append("lowercase letters")
        if not char_sets["uppercase"]:
            missing_sets.append("uppercase letters")
        if not char_sets["digits"]:
            missing_sets.append("numbers")
        if not char_sets["special"]:
            missing_sets.append("special characters")

        if missing_sets:
            recommendations.append(f'Add {", ".join(missing_sets)}')

        if analysis["patterns"]:
            recommendations.append("Avoid predictable patterns and sequences")

        if analysis["common_password"]:
            recommendations.append("Use a unique password not found in common lists")

        recommendations.append("Consider using a passphrase with random words")

        return recommendations

    async def check_breach_status(self, password: str) -> bool:
        """Check if password has been breached using HaveIBeenPwned API"""
        try:
            # Hash password with SHA-1 (required by HaveIBeenPwned API)
            sha1_hash = sha1(password.encode()).hexdigest().upper()
            prefix = sha1_hash[:5]
            suffix = sha1_hash[5:]

            # Query HaveIBeenPwned API
            url = f"https://api.pwnedpasswords.com/range/{prefix}"
            response = get(url, timeout=5)

            if response.status_code == 200:
                # Check if our suffix is in the response
                for line in response.text.splitlines():
                    parts = line.split(":")
                    if len(parts) == 2:
                        hash_suffix, count = parts
                        if hash_suffix == suffix:
                            logger.warning("Password found in breach database")
                            return True

            return False

        except Exception as e:
            logger.error(f"Error checking breach status: {e}")
            return False  # Assume not breached if check fails


# Global instance
password_analyzer = PasswordStrengthAnalyzer()


# Simple function for backward compatibility
def calculate_password_strength(password: str) -> int:
    """Simple password strength calculation for backward compatibility"""
    try:
        result = password_analyzer.analyze_password(password)
        return result.get("score", 0)
    except Exception as e:
        logger.error(f"Error calculating password strength: {e}")
        return 0
