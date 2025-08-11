from cryptography.fernet import Fernet
import os

class EncryptionService:
    def __init__(self):
        self.encryption_key = os.getenv('ENCRYPTION_KEY')
        if not self.encryption_key:
            self.encryption_key = Fernet.generate_key()
            print(f"Generated encryption key: {self.encryption_key.decode()}")
            print("Add this to your .env file: ENCRYPTION_KEY=" + self.encryption_key.decode())
        else:
            self.encryption_key = self.encryption_key.encode()
        
        self.cipher_suite = Fernet(self.encryption_key)
    
    def encrypt(self, data: str) -> str:
        """Encrypt string data"""
        return self.cipher_suite.encrypt(data.encode()).decode()
    
    def decrypt(self, encrypted_data: str) -> str:
        """Decrypt string data"""
        return self.cipher_suite.decrypt(encrypted_data.encode()).decode()

# Global instance
encryption_service = EncryptionService()