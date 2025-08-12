import pyotp
import qrcode
import io
import base64
import secrets
import json
from typing import List, Tuple
from models.user import User
from config.extensions import db
import logging

logger = logging.getLogger(__name__)

class TwoFactorService:
    """Two-factor authentication service with TOTP and backup codes"""
    
    @staticmethod
    def generate_secret() -> str:
        """Generate a new TOTP secret"""
        return pyotp.random_base32()
    
    @staticmethod
    def generate_qr_code(user_email: str, secret: str, issuer: str = "Lok Password Manager") -> str:
        """Generate QR code for TOTP setup"""
        try:
            totp_uri = pyotp.totp.TOTP(secret).provisioning_uri(
                name=user_email,
                issuer_name=issuer
            )
            
            qr = qrcode.QRCode(version=1, box_size=10, border=5)
            qr.add_data(totp_uri)
            qr.make(fit=True)
            
            img = qr.make_image(fill_color="black", back_color="white")
            
            # Convert to base64 string
            buffer = io.BytesIO()
            img.save(buffer, format='PNG')
            img_str = base64.b64encode(buffer.getvalue()).decode()
            
            return f"data:image/png;base64,{img_str}"
            
        except Exception as e:
            logger.error(f"Failed to generate QR code: {e}")
            raise
    
    @staticmethod
    def generate_backup_codes(count: int = 10) -> List[str]:
        """Generate backup codes for 2FA recovery"""
        codes = []
        for _ in range(count):
            # Generate 8-character alphanumeric codes
            code = ''.join(secrets.choice('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') for _ in range(8))
            codes.append(code)
        return codes
    
    @staticmethod
    def verify_totp(secret: str, token: str, window: int = 1) -> bool:
        """Verify TOTP token with time window tolerance"""
        try:
            totp = pyotp.TOTP(secret)
            return totp.verify(token, valid_window=window)
        except Exception as e:
            logger.error(f"TOTP verification failed: {e}")
            return False
    
    @staticmethod
    def enable_2fa(user_id: int, totp_token: str) -> Tuple[bool, List[str]]:
        """Enable 2FA for user after verifying TOTP token"""
        try:
            user = User.query.get(user_id)
            if not user or not user.two_factor_secret:
                return False, []
            
            # Verify the TOTP token
            if not TwoFactorService.verify_totp(user.two_factor_secret, totp_token):
                return False, []
            
            # Generate backup codes
            backup_codes = TwoFactorService.generate_backup_codes()
            
            # Store hashed backup codes
            hashed_codes = [TwoFactorService._hash_backup_code(code) for code in backup_codes]
            user.backup_codes = json.dumps(hashed_codes)
            user.two_factor_enabled = True
            
            db.session.commit()
            
            logger.info(f"2FA enabled for user {user_id}")
            return True, backup_codes
            
        except Exception as e:
            logger.error(f"Failed to enable 2FA: {e}")
            db.session.rollback()
            return False, []
    
    @staticmethod
    def disable_2fa(user_id: int) -> bool:
        """Disable 2FA for user"""
        try:
            user = User.query.get(user_id)
            if not user:
                return False
            
            user.two_factor_enabled = False
            user.two_factor_secret = None
            user.backup_codes = None
            
            db.session.commit()
            
            logger.info(f"2FA disabled for user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to disable 2FA: {e}")
            db.session.rollback()
            return False
    
    @staticmethod
    def verify_backup_code(user_id: int, backup_code: str) -> bool:
        """Verify and consume a backup code"""
        try:
            user = User.query.get(user_id)
            if not user or not user.backup_codes:
                return False
            
            stored_codes = json.loads(user.backup_codes)
            hashed_input = TwoFactorService._hash_backup_code(backup_code)
            
            if hashed_input in stored_codes:
                # Remove used backup code
                stored_codes.remove(hashed_input)
                user.backup_codes = json.dumps(stored_codes)
                db.session.commit()
                
                logger.info(f"Backup code used for user {user_id}")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Backup code verification failed: {e}")
            return False
    
    @staticmethod
    def regenerate_backup_codes(user_id: int) -> List[str]:
        """Regenerate backup codes for user"""
        try:
            user = User.query.get(user_id)
            if not user or not user.two_factor_enabled:
                return []
            
            # Generate new backup codes
            backup_codes = TwoFactorService.generate_backup_codes()
            hashed_codes = [TwoFactorService._hash_backup_code(code) for code in backup_codes]
            
            user.backup_codes = json.dumps(hashed_codes)
            db.session.commit()
            
            logger.info(f"Backup codes regenerated for user {user_id}")
            return backup_codes
            
        except Exception as e:
            logger.error(f"Failed to regenerate backup codes: {e}")
            db.session.rollback()
            return []
    
    @staticmethod
    def _hash_backup_code(code: str) -> str:
        """Hash backup code for secure storage"""
        import hashlib
        return hashlib.sha256(code.encode()).hexdigest()
    
    @staticmethod
    def get_remaining_backup_codes_count(user_id: int) -> int:
        """Get count of remaining backup codes"""
        try:
            user = User.query.get(user_id)
            if not user or not user.backup_codes:
                return 0
            
            stored_codes = json.loads(user.backup_codes)
            return len(stored_codes)
            
        except Exception as e:
            logger.error(f"Failed to get backup codes count: {e}")
            return 0

# Global instance
two_factor_service = TwoFactorService()