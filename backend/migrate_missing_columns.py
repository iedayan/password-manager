#!/usr/bin/env python3
"""
Migration script to add missing columns to existing database tables.
"""

import os
import sys
from sqlalchemy import text, inspect

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from lok_backend.app import create_app
from lok_backend.core.database import db

def migrate_missing_columns():
    """Add missing columns to existing tables."""
    
    app = create_app()
    
    with app.app_context():
        try:
            inspector = inspect(db.engine)
            
            # Check users table columns
            user_columns = [col['name'] for col in inspector.get_columns('users')]
            print(f"Current users columns: {user_columns}")
            
            # Check passwords table columns  
            password_columns = [col['name'] for col in inspector.get_columns('passwords')]
            print(f"Current passwords columns: {password_columns}")
            
            migrations = []
            
            # Add missing users table columns
            missing_user_columns = {
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
            
            for column, definition in missing_user_columns.items():
                if column not in user_columns:
                    migrations.append(f"ALTER TABLE users ADD COLUMN {column} {definition}")
            
            # Add missing passwords table columns
            missing_password_columns = {
                'category': 'VARCHAR(50) DEFAULT \'Personal\'',
                'is_favorite': 'BOOLEAN DEFAULT FALSE',
                'tags': 'TEXT',
                'last_accessed': 'TIMESTAMP',
                'auto_update_enabled': 'BOOLEAN DEFAULT FALSE',
                'is_compromised': 'BOOLEAN DEFAULT FALSE'
            }
            
            for column, definition in missing_password_columns.items():
                if column not in password_columns:
                    migrations.append(f"ALTER TABLE passwords ADD COLUMN {column} {definition}")
            
            # Execute migrations
            with db.engine.connect() as conn:
                for migration in migrations:
                    print(f"Executing: {migration}")
                    conn.execute(text(migration))
                    conn.commit()
            
            # Create indexes for new columns
            try:
                with db.engine.connect() as conn:
                    indexes = [
                        "CREATE INDEX IF NOT EXISTS idx_passwords_category ON passwords (user_id, category)",
                        "CREATE INDEX IF NOT EXISTS idx_passwords_favorite ON passwords (user_id, is_favorite)",
                        "CREATE INDEX IF NOT EXISTS idx_users_active ON users (is_active)",
                        "CREATE INDEX IF NOT EXISTS idx_users_2fa ON users (is_2fa_enabled)"
                    ]
                    
                    for index in indexes:
                        print(f"Creating index: {index}")
                        conn.execute(text(index))
                        conn.commit()
                        
            except Exception as e:
                print(f"Index creation warning: {e}")
            
            print(f"✅ Migration completed successfully! Added {len(migrations)} columns.")
            
            if not migrations:
                print("ℹ️  All columns already exist, no migration needed.")
                
        except Exception as e:
            print(f"❌ Migration failed: {e}")
            return False
            
    return True

if __name__ == "__main__":
    print("🔄 Starting database migration for missing columns...")
    success = migrate_missing_columns()
    
    if success:
        print("🎉 Migration completed successfully!")
        print("\nNew features available:")
        print("- Enhanced user security settings")
        print("- Password categories and favorites")
        print("- Improved password tracking")
    else:
        print("💥 Migration failed!")
        sys.exit(1)