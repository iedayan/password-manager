"""Auto-update service for reused passwords."""

import secrets
import string
from typing import List, Dict
from ..models.password import Password
from ..core.database import db
from .encryption_service import encryption_service


class AutoPasswordUpdater:
    """Service to automatically update reused passwords."""
    
    @staticmethod
    def generate_strong_password(length: int = 16) -> str:
        """Generate a strong password."""
        characters = string.ascii_letters + string.digits + "!@#$%^&*"
        return ''.join(secrets.choice(characters) for _ in range(length))
    
    @staticmethod
    def find_reused_passwords(user_id: int) -> Dict[str, List[Password]]:
        """Find all reused passwords for a user."""
        passwords = Password.query.filter_by(user_id=user_id).all()
        
        # Decrypt and group by password value
        password_groups = {}
        for pwd in passwords:
            try:
                decrypted = encryption_service.decrypt(pwd.encrypted_password)
                if decrypted in password_groups:
                    password_groups[decrypted].append(pwd)
                else:
                    password_groups[decrypted] = [pwd]
            except:
                continue
        
        # Return only groups with multiple passwords
        return {k: v for k, v in password_groups.items() if len(v) > 1}
    
    @staticmethod
    def auto_update_reused_passwords(user_id: int, exclude_ids: List[int] = None) -> Dict:
        """Automatically update reused passwords, keeping the most recently used."""
        exclude_ids = exclude_ids or []
        reused_groups = AutoPasswordUpdater.find_reused_passwords(user_id)
        
        updated_passwords = []
        errors = []
        
        for password_value, password_list in reused_groups.items():
            # Sort by last updated (most recent first)
            sorted_passwords = sorted(password_list, key=lambda p: p.updated_at, reverse=True)
            
            # Keep the first (most recent), update the rest
            for pwd in sorted_passwords[1:]:
                if pwd.id in exclude_ids:
                    continue
                    
                try:
                    # Generate new password
                    new_password = AutoPasswordUpdater.generate_strong_password()
                    
                    # Encrypt and update
                    pwd.encrypted_password = encryption_service.encrypt(new_password)
                    pwd.strength_score = AutoPasswordUpdater.calculate_strength(new_password)
                    
                    updated_passwords.append({
                        'id': pwd.id,
                        'site_name': pwd.site_name,
                        'old_password': password_value,
                        'new_password': new_password
                    })
                    
                except Exception as e:
                    errors.append({
                        'id': pwd.id,
                        'site_name': pwd.site_name,
                        'error': str(e)
                    })
        
        if updated_passwords:
            db.session.commit()
        
        return {
            'updated_count': len(updated_passwords),
            'updated_passwords': updated_passwords,
            'errors': errors
        }
    
    @staticmethod
    def calculate_strength(password: str) -> int:
        """Calculate password strength score."""
        score = 0
        
        # Length scoring
        if len(password) >= 12:
            score += 25
        elif len(password) >= 8:
            score += 15
        
        # Character variety
        if any(c.islower() for c in password):
            score += 15
        if any(c.isupper() for c in password):
            score += 15
        if any(c.isdigit() for c in password):
            score += 15
        if any(c in "!@#$%^&*(),.?\":{}|<>" for c in password):
            score += 20
        
        return min(100, score)