#!/usr/bin/env python3
"""
Railway production database migration script.
Run this on Railway to add missing columns.
"""

import os
from sqlalchemy import create_engine, text, inspect

def migrate_railway_db():
    """Migrate Railway production database."""
    
    # Get Railway database URL
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        print("❌ DATABASE_URL not found in environment")
        return False
    
    # Fix PostgreSQL URL format
    if database_url.startswith('postgres://'):
        database_url = database_url.replace('postgres://', 'postgresql://', 1)
    
    print("🔄 Connecting to Railway database...")
    
    try:
        engine = create_engine(database_url)
        
        with engine.connect() as conn:
            inspector = inspect(engine)
            
            # Get current columns
            user_columns = [col['name'] for col in inspector.get_columns('users')]
            password_columns = [col['name'] for col in inspector.get_columns('passwords')]
            
            print(f"Users columns: {len(user_columns)}")
            print(f"Passwords columns: {len(password_columns)}")
            
            # Missing columns to add
            user_migrations = []
            password_migrations = []
            
            # Check users table
            required_user_cols = [
                ('is_2fa_enabled', 'BOOLEAN DEFAULT FALSE'),
                ('totp_secret', 'VARCHAR(32)'),
                ('totp_secret_temp', 'VARCHAR(32)'),
                ('biometric_enabled', 'BOOLEAN DEFAULT FALSE'),
                ('biometric_credential_id', 'VARCHAR(64)'),
                ('last_login', 'TIMESTAMP'),
                ('last_logout', 'TIMESTAMP'),
                ('last_password_change', 'TIMESTAMP'),
                ('is_active', 'BOOLEAN DEFAULT TRUE'),
                ('email_verified', 'BOOLEAN DEFAULT FALSE'),
                ('auto_lock_timeout', 'INTEGER DEFAULT 15'),
                ('password_strength_requirement', 'VARCHAR(20) DEFAULT \'strong\'')
            ]
            
            for col_name, col_def in required_user_cols:
                if col_name not in user_columns:
                    user_migrations.append(f"ALTER TABLE users ADD COLUMN {col_name} {col_def}")
            
            # Check passwords table  
            required_password_cols = [
                ('category', 'VARCHAR(50) DEFAULT \'Personal\''),
                ('is_favorite', 'BOOLEAN DEFAULT FALSE'),
                ('tags', 'TEXT'),
                ('last_accessed', 'TIMESTAMP'),
                ('auto_update_enabled', 'BOOLEAN DEFAULT FALSE'),
                ('is_compromised', 'BOOLEAN DEFAULT FALSE')
            ]
            
            for col_name, col_def in required_password_cols:
                if col_name not in password_columns:
                    password_migrations.append(f"ALTER TABLE passwords ADD COLUMN {col_name} {col_def}")
            
            # Execute migrations
            all_migrations = user_migrations + password_migrations
            
            if not all_migrations:
                print("✅ All columns exist!")
                return True
            
            print(f"🔄 Running {len(all_migrations)} migrations...")
            
            for migration in all_migrations:
                print(f"  {migration}")
                conn.execute(text(migration))
                conn.commit()
            
            print("✅ Migration completed!")
            return True
            
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False

if __name__ == "__main__":
    migrate_railway_db()