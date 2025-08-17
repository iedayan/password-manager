from cryptography.fernet import Fernet, InvalidToken
import os
import logging

logger = logging.getLogger(__name__)

class EncryptionService:
    def __init__(self):
        logger.info("Initializing encryption service")
        self.encryption_key = os.getenv('ENCRYPTION_KEY')
        if not self.encryption_key:
            # Generate a new key if none provided
            self.encryption_key = Fernet.generate_key()
            logger.warning("No ENCRYPTION_KEY found. Generated new key - set ENCRYPTION_KEY env var for persistence.")
        else:
            self.encryption_key = self.encryption_key.encode()
        
        self.cipher_suite = Fernet(self.encryption_key)
    
    def encrypt(self, data: str) -> str:
        """Encrypt string data with error handling"""
        try:
            if not isinstance(data, str):
                raise ValueError("Data must be a string")
            return self.cipher_suite.encrypt(data.encode()).decode()
        except Exception as e:
            logger.error(f"Encryption failed: {type(e).__name__}")
            raise
    
    def decrypt(self, encrypted_data: str) -> str:
        """Decrypt string data with error handling"""
        try:
            if not isinstance(encrypted_data, str):
                raise ValueError("Encrypted data must be a string")
            return self.cipher_suite.decrypt(encrypted_data.encode()).decode()
        except InvalidToken:
            logger.error("Decryption failed: Invalid token or corrupted data")
            raise ValueError("Invalid or corrupted encrypted data")
        except Exception as e:
            logger.error(f"Decryption failed: {type(e).__name__}")
            raise

# Global instance
encryption_service = EncryptionService()