#!/usr/bin/env python3
"""Create security-related database tables and migrations."""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from lok_backend.app import create_app
from lok_backend.core.database import db
from lok_backend.models.user import User
from lok_backend.models.password import Password

def create_security_tables():
    """Create or update tables with new security fields."""
    app = create_app()
    
    with app.app_context():
        try:
            # Create all tables (will add new columns if they don't exist)
            db.create_all()
            
            print("✅ Security tables created/updated successfully")
            
            # Check if we need to add new columns to existing tables
            from sqlalchemy import inspect, text
            
            inspector = inspect(db.engine)
            
            # Check users table for new 2FA columns
            user_columns = [col['name'] for col in inspector.get_columns('users')]
            
            missing_columns = []
            if 'is_2fa_enabled' not in user_columns:
                missing_columns.append('is_2fa_enabled')
            if 'totp_secret' not in user_columns:
                missing_columns.append('totp_secret')
            if 'totp_secret_temp' not in user_columns:
                missing_columns.append('totp_secret_temp')
            
            # Add missing columns
            if missing_columns:
                print(f"Adding missing columns to users table: {missing_columns}")
                
                for column in missing_columns:
                    try:
                        if column == 'is_2fa_enabled':
                            db.engine.execute(text("ALTER TABLE users ADD COLUMN is_2fa_enabled BOOLEAN DEFAULT FALSE"))
                        elif column == 'totp_secret':
                            db.engine.execute(text("ALTER TABLE users ADD COLUMN totp_secret VARCHAR(32)"))
                        elif column == 'totp_secret_temp':
                            db.engine.execute(text("ALTER TABLE users ADD COLUMN totp_secret_temp VARCHAR(32)"))
                        
                        print(f"  ✅ Added column: {column}")
                    except Exception as e:
                        print(f"  ⚠️  Column {column} might already exist: {e}")
                
                db.session.commit()
            
            print("🔒 Security features are ready!")
            
        except Exception as e:
            print(f"❌ Error creating security tables: {e}")
            return False
    
    return True

if __name__ == "__main__":
    create_security_tables()