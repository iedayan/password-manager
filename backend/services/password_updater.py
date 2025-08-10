from playwright.sync_api import sync_playwright
import time
import random
from app import app, db, Password, PasswordUpdateLog, cipher_suite
from datetime import datetime

class PasswordUpdater:
    def __init__(self):
        self.browser = None
        self.context = None
        self.page = None
    
    def start_browser(self):
        """Initialize browser for automation"""
        playwright = sync_playwright().start()
        self.browser = playwright.chromium.launch(headless=True)
        self.context = self.browser.new_context()
        self.page = self.context.new_page()
    
    def close_browser(self):
        """Clean up browser resources"""
        if self.browser:
            self.browser.close()
    
    def generate_strong_password(self, length=16):
        """Generate a cryptographically strong password"""
        import secrets
        import string
        
        alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
        password = ''.join(secrets.choice(alphabet) for _ in range(length))
        
        # Ensure password has all character types
        if not any(c.islower() for c in password):
            password = password[:-1] + random.choice(string.ascii_lowercase)
        if not any(c.isupper() for c in password):
            password = password[:-1] + random.choice(string.ascii_uppercase)
        if not any(c.isdigit() for c in password):
            password = password[:-1] + random.choice(string.digits)
        if not any(c in "!@#$%^&*" for c in password):
            password = password[:-1] + random.choice("!@#$%^&*")
        
        return password
    
    def update_password_for_site(self, password_record, new_password):
        """Update password on a specific website"""
        try:
            site_url = password_record.site_url
            username = password_record.username
            
            # Navigate to the site
            self.page.goto(site_url)
            time.sleep(2)
            
            # Common selectors for login/password change pages
            login_selectors = [
                'input[type="email"]', 'input[name="email"]', 'input[id="email"]',
                'input[type="text"][name*="user"]', 'input[id*="username"]'
            ]
            
            password_selectors = [
                'input[type="password"]', 'input[name="password"]', 'input[id="password"]'
            ]
            
            # Try to find and fill login form
            for selector in login_selectors:
                try:
                    if self.page.locator(selector).is_visible():
                        self.page.fill(selector, username)
                        break
                except:
                    continue
            
            # Fill current password
            old_password = cipher_suite.decrypt(password_record.encrypted_password.encode()).decode()
            for selector in password_selectors:
                try:
                    if self.page.locator(selector).is_visible():
                        self.page.fill(selector, old_password)
                        break
                except:
                    continue
            
            # Submit login form
            submit_selectors = [
                'button[type="submit"]', 'input[type="submit"]', 
                'button:has-text("Login")', 'button:has-text("Sign In")'
            ]
            
            for selector in submit_selectors:
                try:
                    if self.page.locator(selector).is_visible():
                        self.page.click(selector)
                        break
                except:
                    continue
            
            time.sleep(3)
            
            # Navigate to password change page (site-specific logic would go here)
            # This is a simplified version - real implementation would need site-specific handlers
            
            # Look for password change form
            new_password_selectors = [
                'input[name="new_password"]', 'input[id="new_password"]',
                'input[name="password"]', 'input[type="password"]'
            ]
            
            # Fill new password
            for selector in new_password_selectors:
                try:
                    if self.page.locator(selector).is_visible():
                        self.page.fill(selector, new_password)
                        break
                except:
                    continue
            
            # Confirm new password
            confirm_selectors = [
                'input[name="confirm_password"]', 'input[id="confirm_password"]',
                'input[name="password_confirmation"]'
            ]
            
            for selector in confirm_selectors:
                try:
                    if self.page.locator(selector).is_visible():
                        self.page.fill(selector, new_password)
                        break
                except:
                    continue
            
            # Submit password change
            for selector in submit_selectors:
                try:
                    if self.page.locator(selector).is_visible():
                        self.page.click(selector)
                        break
                except:
                    continue
            
            time.sleep(2)
            
            # Check for success indicators
            success_indicators = [
                'text=Password updated', 'text=Password changed', 
                'text=Success', 'text=Updated successfully'
            ]
            
            success = False
            for indicator in success_indicators:
                try:
                    if self.page.locator(indicator).is_visible():
                        success = True
                        break
                except:
                    continue
            
            return success
            
        except Exception as e:
            print(f"Error updating password for {password_record.site_name}: {str(e)}")
            return False
    
    def update_weak_passwords(self, user_id):
        """Update all weak passwords for a user"""
        with app.app_context():
            weak_passwords = Password.query.filter_by(
                user_id=user_id, 
                auto_update_enabled=True
            ).filter(Password.strength_score < 60).all()
            
            self.start_browser()
            
            updated_count = 0
            for password_record in weak_passwords:
                try:
                    new_password = self.generate_strong_password()
                    success = self.update_password_for_site(password_record, new_password)
                    
                    if success:
                        # Update password in database
                        old_strength = password_record.strength_score
                        password_record.encrypted_password = cipher_suite.encrypt(new_password.encode()).decode()
                        password_record.strength_score = self.calculate_password_strength(new_password)
                        password_record.last_updated = datetime.utcnow()
                        
                        # Log the update
                        log = PasswordUpdateLog(
                            password_id=password_record.id,
                            old_strength=old_strength,
                            new_strength=password_record.strength_score,
                            update_reason='Automatic weak password update',
                            success=True
                        )
                        db.session.add(log)
                        updated_count += 1
                    else:
                        # Log failed attempt
                        log = PasswordUpdateLog(
                            password_id=password_record.id,
                            old_strength=password_record.strength_score,
                            new_strength=password_record.strength_score,
                            update_reason='Automatic update failed',
                            success=False
                        )
                        db.session.add(log)
                    
                    # Random delay between updates
                    time.sleep(random.uniform(5, 15))
                    
                except Exception as e:
                    print(f"Failed to update password for {password_record.site_name}: {str(e)}")
                    continue
            
            db.session.commit()
            self.close_browser()
            
            return updated_count
    
    def calculate_password_strength(self, password):
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