import os
from sqlalchemy import create_engine, text

# Get Railway database URL
db_url = os.environ.get('DATABASE_URL', 'sqlite:///lok_passwords.db')
if db_url.startswith('postgres://'):
    db_url = db_url.replace('postgres://', 'postgresql://', 1)

engine = create_engine(db_url)

# Quick fix - add missing columns
with engine.connect() as conn:
    try:
        # Add missing users columns
        conn.execute(text("ALTER TABLE users ADD COLUMN is_2fa_enabled BOOLEAN DEFAULT FALSE"))
        conn.execute(text("ALTER TABLE users ADD COLUMN totp_secret VARCHAR(32)"))
        conn.execute(text("ALTER TABLE users ADD COLUMN totp_secret_temp VARCHAR(32)"))
        conn.execute(text("ALTER TABLE users ADD COLUMN biometric_enabled BOOLEAN DEFAULT FALSE"))
        conn.execute(text("ALTER TABLE users ADD COLUMN biometric_credential_id VARCHAR(64)"))
        conn.execute(text("ALTER TABLE users ADD COLUMN last_login TIMESTAMP"))
        conn.execute(text("ALTER TABLE users ADD COLUMN last_logout TIMESTAMP"))
        conn.execute(text("ALTER TABLE users ADD COLUMN last_password_change TIMESTAMP"))
        conn.execute(text("ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE"))
        conn.execute(text("ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE"))
        conn.execute(text("ALTER TABLE users ADD COLUMN auto_lock_timeout INTEGER DEFAULT 15"))
        conn.execute(text("ALTER TABLE users ADD COLUMN password_strength_requirement VARCHAR(20) DEFAULT 'strong'"))
        
        # Add missing passwords columns
        conn.execute(text("ALTER TABLE passwords ADD COLUMN category VARCHAR(50) DEFAULT 'Personal'"))
        conn.execute(text("ALTER TABLE passwords ADD COLUMN is_favorite BOOLEAN DEFAULT FALSE"))
        conn.execute(text("ALTER TABLE passwords ADD COLUMN tags TEXT"))
        conn.execute(text("ALTER TABLE passwords ADD COLUMN last_accessed TIMESTAMP"))
        conn.execute(text("ALTER TABLE passwords ADD COLUMN auto_update_enabled BOOLEAN DEFAULT FALSE"))
        conn.execute(text("ALTER TABLE passwords ADD COLUMN is_compromised BOOLEAN DEFAULT FALSE"))
        
        conn.commit()
        print("✅ Database fixed!")
    except Exception as e:
        print(f"Column might already exist: {e}")
        conn.rollback()