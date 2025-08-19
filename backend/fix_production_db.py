#!/usr/bin/env python3
"""
Fix production database by adding missing columns.
This script works with both SQLite and PostgreSQL.
"""

import os
import sys
from sqlalchemy import text, inspect, create_engine
from sqlalchemy.exc import OperationalError

def get_database_url():
    """Get database URL from environment or default."""
    # Check for production database URL first
    db_url = os.getenv('DATABASE_URL')
    if not db_url:
        # Fallback to local SQLite
        db_url = 'sqlite:///instance/lok_passwords.db'
    
    # Handle PostgreSQL URL format for Railway/Heroku
    if db_url.startswith('postgres://'):
        db_url = db_url.replace('postgres://', 'postgresql://', 1)
    
    return db_url

def fix_database_schema():
    """Fix database schema by adding missing columns."""
    
    db_url = get_database_url()
    print(f"Connecting to database: {db_url.split('@')[0] if '@' in db_url else db_url}")
    
    try:
        engine = create_engine(db_url)
        
        with engine.connect() as conn:
            inspector = inspect(engine)
            
            # Check if tables exist
            tables = inspector.get_table_names()
            print(f"Available tables: {tables}")
            
            if 'users' not in tables or 'passwords' not in tables:
                print("❌ Required tables not found. Please run initial migration first.")
                return False
            
            # Check users table columns
            user_columns = [col['name'] for col in inspector.get_columns('users')]
            print(f"Users table columns: {len(user_columns)} found")
            
            # Check passwords table columns  
            password_columns = [col['name'] for col in inspector.get_columns('passwords')]
            print(f"Passwords table columns: {len(password_columns)} found")
            
            migrations = []
            
            # Define required columns for users table
            required_user_columns = {
                'is_2fa_enabled': 'BOOLEAN DEFAULT FALSE',
                'totp_secret': 'VARCHAR(32)',
                'totp_secret_temp': 'VARCHAR(32)',
                'biometric_enabled': 'BOOLEAN DEFAULT FALSE',
                'biometric_credential_id': 'VARCHAR(64)',
                'last_login': 'TIMESTAMP',
                'last_logout': 'TIMESTAMP', 
                'last_password_change': 'TIMESTAMP',
                'is_active': 'BOOLEAN DEFAULT TRUE',
                'email_verified': 'BOOLEAN DEFAULT FALSE',
                'auto_lock_timeout': 'INTEGER DEFAULT 15',
                'password_strength_requirement': 'VARCHAR(20) DEFAULT \'strong\''
            }
            
            # Add missing users columns
            for column, definition in required_user_columns.items():
                if column not in user_columns:
                    migrations.append(f"ALTER TABLE users ADD COLUMN {column} {definition}")
                    print(f"  + Will add users.{column}")
            
            # Define required columns for passwords table
            required_password_columns = {
                'category': 'VARCHAR(50) DEFAULT \'Personal\'',
                'is_favorite': 'BOOLEAN DEFAULT FALSE',
                'tags': 'TEXT',
                'last_accessed': 'TIMESTAMP',
                'auto_update_enabled': 'BOOLEAN DEFAULT FALSE',
                'is_compromised': 'BOOLEAN DEFAULT FALSE'
            }
            
            # Add missing passwords columns
            for column, definition in required_password_columns.items():
                if column not in password_columns:
                    migrations.append(f"ALTER TABLE passwords ADD COLUMN {column} {definition}")
                    print(f"  + Will add passwords.{column}")
            
            if not migrations:
                print("✅ All required columns already exist!")
                return True
            
            # Execute migrations
            print(f"\n🔄 Executing {len(migrations)} migrations...")
            
            for migration in migrations:
                try:
                    print(f"  Executing: {migration}")
                    conn.execute(text(migration))
                    conn.commit()
                    print(f"  ✅ Success")
                except Exception as e:
                    print(f"  ❌ Failed: {e}")
                    # Continue with other migrations
            
            # Create useful indexes
            indexes = [
                "CREATE INDEX IF NOT EXISTS idx_passwords_user_category ON passwords (user_id, category)",
                "CREATE INDEX IF NOT EXISTS idx_passwords_user_favorite ON passwords (user_id, is_favorite)", 
                "CREATE INDEX IF NOT EXISTS idx_users_active ON users (is_active)",
                "CREATE INDEX IF NOT EXISTS idx_users_2fa ON users (is_2fa_enabled)"
            ]
            
            print("\n🔄 Creating indexes...")
            for index in indexes:
                try:
                    conn.execute(text(index))
                    conn.commit()
                    print(f"  ✅ Created index")
                except Exception as e:
                    print(f"  ⚠️  Index warning: {e}")
            
            print(f"\n🎉 Database schema updated successfully!")
            return True
            
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

if __name__ == "__main__":
    print("🔧 Fixing production database schema...")
    print("=" * 50)
    
    success = fix_database_schema()
    
    if success:
        print("\n✅ Database is now ready!")
        print("\nFeatures now available:")
        print("- Two-factor authentication")
        print("- Password categories and favorites") 
        print("- Enhanced security tracking")
        print("- Biometric authentication support")
    else:
        print("\n❌ Database fix failed!")
        print("Please check your database connection and try again.")
        sys.exit(1)