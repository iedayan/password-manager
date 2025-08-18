#!/usr/bin/env python3
"""
Manual Database Migration Script
Run this script to create/update database tables manually.
"""

import os
import sys
from sqlalchemy import text

def migrate_database():
    """Create or update database tables."""
    print("🔄 Starting database migration...")
    
    try:
        from lok_backend.app import create_app
        from lok_backend.core.database import db
        
        # Determine environment
        env = os.getenv('FLASK_ENV', 'production')
        print(f"📍 Environment: {env}")
        
        app = create_app(env)
        
        with app.app_context():
            # Import all models
            from lok_backend.models.user import User
            from lok_backend.models.password import Password, PasswordUpdateLog
            from lok_backend.models.login_session import LoginSession
            from lok_backend.models.device import Device
            
            print("📦 All models imported")
            
            # Test database connection
            try:
                with db.engine.connect() as conn:
                    result = conn.execute(text('SELECT version()'))
                    version = result.fetchone()[0]
                print(f"✅ Database connected: {version}")
            except Exception as e:
                print(f"❌ Database connection failed: {e}")
                return False
            
            # Create tables
            print("🔨 Creating/updating tables...")
            db.create_all()
            
            # List created tables
            inspector = db.inspect(db.engine)
            tables = inspector.get_table_names()
            
            print(f"📋 Available tables ({len(tables)}):")
            for table in sorted(tables):
                print(f"   • {table}")
            
            # Verify each model table exists
            expected_tables = ['users', 'passwords', 'password_update_logs', 'login_sessions', 'devices']
            missing_tables = [t for t in expected_tables if t not in tables]
            
            if missing_tables:
                print(f"⚠️  Missing tables: {missing_tables}")
                return False
            
            print("✅ All required tables exist")
            
            # Test basic operations
            try:
                user_count = db.session.query(User).count()
                password_count = db.session.query(Password).count()
                print(f"📊 Current data: {user_count} users, {password_count} passwords")
            except Exception as e:
                print(f"⚠️  Error querying tables: {e}")
            
            print("🎉 Database migration completed successfully!")
            return True
            
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = migrate_database()
    if success:
        print("\n✅ Migration successful! Database is ready.")
    else:
        print("\n❌ Migration failed! Check the errors above.")
    sys.exit(0 if success else 1)