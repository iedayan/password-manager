import os
import psycopg2

# Get Railway database URL
DATABASE_URL = os.environ.get('DATABASE_URL')
if not DATABASE_URL:
    print("❌ DATABASE_URL not found")
    exit(1)

# Connect to PostgreSQL
conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

try:
    # Add missing users columns
    columns = [
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_2fa_enabled BOOLEAN DEFAULT FALSE",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_secret VARCHAR(32)",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_secret_temp VARCHAR(32)",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS biometric_enabled BOOLEAN DEFAULT FALSE",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS biometric_credential_id VARCHAR(64)",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS last_logout TIMESTAMP",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS last_password_change TIMESTAMP",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS auto_lock_timeout INTEGER DEFAULT 15",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS password_strength_requirement VARCHAR(20) DEFAULT 'strong'",
        
        # Add missing passwords columns
        "ALTER TABLE passwords ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'Personal'",
        "ALTER TABLE passwords ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT FALSE",
        "ALTER TABLE passwords ADD COLUMN IF NOT EXISTS tags TEXT",
        "ALTER TABLE passwords ADD COLUMN IF NOT EXISTS last_accessed TIMESTAMP",
        "ALTER TABLE passwords ADD COLUMN IF NOT EXISTS auto_update_enabled BOOLEAN DEFAULT FALSE",
        "ALTER TABLE passwords ADD COLUMN IF NOT EXISTS is_compromised BOOLEAN DEFAULT FALSE"
    ]
    
    for sql in columns:
        cur.execute(sql)
    
    conn.commit()
    print("✅ Database migration completed!")
    
except Exception as e:
    print(f"❌ Error: {e}")
    conn.rollback()
finally:
    cur.close()
    conn.close()