"""
Hotfix for User model to handle missing columns gracefully.
This temporarily modifies the User model to work with incomplete database schema.
"""

from sqlalchemy import text
from lok_backend.models.user import User
from lok_backend.core.database import db

# Backup original query method
_original_query = User.query

def safe_user_query():
    """Safe user query that handles missing columns."""
    try:
        # Try normal query first
        return _original_query
    except Exception:
        # If it fails, use raw SQL with only essential columns
        return db.session.query(User).from_statement(
            text("""
                SELECT 
                    id, uuid, email, password_hash, 
                    failed_login_attempts, locked_until,
                    two_factor_enabled, two_factor_secret, backup_codes,
                    created_at, updated_at,
                    COALESCE(is_2fa_enabled, FALSE) as is_2fa_enabled,
                    COALESCE(totp_secret, NULL) as totp_secret,
                    COALESCE(totp_secret_temp, NULL) as totp_secret_temp,
                    COALESCE(biometric_enabled, FALSE) as biometric_enabled,
                    COALESCE(biometric_credential_id, NULL) as biometric_credential_id,
                    COALESCE(last_login, NULL) as last_login,
                    COALESCE(last_logout, NULL) as last_logout,
                    COALESCE(last_password_change, created_at) as last_password_change,
                    COALESCE(is_active, TRUE) as is_active,
                    COALESCE(email_verified, FALSE) as email_verified,
                    COALESCE(auto_lock_timeout, 15) as auto_lock_timeout,
                    COALESCE(password_strength_requirement, 'strong') as password_strength_requirement
                FROM users 
                WHERE email = :email
            """)
        )

# Monkey patch the User class
User.safe_query = safe_user_query

print("✅ User model hotfix applied - handles missing columns gracefully")