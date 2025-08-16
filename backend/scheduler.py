from apscheduler.schedulers.background import BackgroundScheduler
from services.password_updater import PasswordUpdater
from app import app, db, User, Password
import requests
import hashlib

class SecurityScheduler:
    def __init__(self):
        self.scheduler = BackgroundScheduler()
        self.password_updater = PasswordUpdater()
    
    def start(self):
        """Start the background scheduler"""
        # Check for weak passwords daily at 2 AM
        self.scheduler.add_job(
            func=self.check_and_update_weak_passwords,
            trigger="cron",
            hour=2,
            minute=0,
            id='weak_password_check'
        )
        
        # Check for breached passwords weekly
        self.scheduler.add_job(
            func=self.check_breached_passwords,
            trigger="cron",
            day_of_week='mon',
            hour=3,
            minute=0,
            id='breach_check'
        )
        
        self.scheduler.start()
    
    def stop(self):
        """Stop the scheduler"""
        self.scheduler.shutdown()
    
    def check_and_update_weak_passwords(self):
        """Check and update weak passwords for all users"""
        with app.app_context():
            users = User.query.filter_by(is_active=True).all()
            
            for user in users:
                try:
                    updated_count = self.password_updater.update_weak_passwords(user.id)
                    print(f"Updated {updated_count} passwords for user ID {user.id}")
                except Exception as e:
                    print(f"Error updating passwords for user ID {user.id}: {str(e)}")
    
    def check_breached_passwords(self):
        """Check if any passwords have been compromised in data breaches"""
        with app.app_context():
            passwords = Password.query.filter_by(is_compromised=False).all()
            
            for password_record in passwords:
                try:
                    # Decrypt password to check against breach database
                    from app import cipher_suite
                    decrypted_password = cipher_suite.decrypt(password_record.encrypted_password.encode()).decode()
                    
                    # Check against Have I Been Pwned API
                    if self.is_password_breached(decrypted_password):
                        password_record.is_compromised = True
                        print(f"Password compromised for password ID {password_record.id}")
                        
                        # Trigger automatic update if enabled
                        if password_record.auto_update_enabled:
                            new_password = self.password_updater.generate_strong_password()
                            success = self.password_updater.update_password_for_site(password_record, new_password)
                            
                            if success:
                                password_record.encrypted_password = cipher_suite.encrypt(new_password.encode()).decode()
                                password_record.strength_score = self.password_updater.calculate_password_strength(new_password)
                                password_record.is_compromised = False
                                password_record.last_updated = datetime.utcnow()
                                print(f"Auto-updated compromised password for password ID {password_record.id}")
                
                except Exception as e:
                    print(f"Error checking password breach for password ID {password_record.id}: {str(e)}")
                    continue
            
            db.session.commit()
    
    def is_password_breached(self, password):
        """Check if password exists in known breaches using Have I Been Pwned API"""
        try:
            # Hash the password with SHA-1
            sha1_hash = hashlib.sha1(password.encode()).hexdigest().upper()
            prefix = sha1_hash[:5]
            suffix = sha1_hash[5:]
            
            # Query HIBP API
            url = f"https://api.pwnedpasswords.com/range/{prefix}"
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                # Check if our suffix appears in the response
                for line in response.text.split('\n'):
                    if line.startswith(suffix):
                        return True
            
            return False
            
        except Exception as e:
            print(f"Error checking password breach: {str(e)}")
            return False

# Initialize scheduler
scheduler = SecurityScheduler()

if __name__ == '__main__':
    scheduler.start()
    try:
        # Keep the script running
        import time
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        scheduler.stop()