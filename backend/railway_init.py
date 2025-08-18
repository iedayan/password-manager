#!/usr/bin/env python3
"""
Railway Database Initialization Script
Automatically creates all database tables on Railway deployment.
"""

import os
import sys
import logging
from sqlalchemy import text

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_railway_database():
    """Initialize database for Railway deployment."""
    try:
        # Import app and database
        from lok_backend.app import create_app
        from lok_backend.core.database import db
        
        # Create app with production config
        app = create_app('production')
        
        with app.app_context():
            logger.info("🚀 Starting Railway database initialization...")
            
            # Import all models to ensure they're registered
            from lok_backend.models.user import User
            from lok_backend.models.password import Password, PasswordUpdateLog
            from lok_backend.models.login_session import LoginSession
            from lok_backend.models.device import Device
            
            logger.info("📦 Models imported successfully")
            
            # Check if database is accessible
            try:
                db.engine.execute(text('SELECT 1'))
                logger.info("✅ Database connection successful")
            except Exception as e:
                logger.error(f"❌ Database connection failed: {e}")
                return False
            
            # Create all tables
            logger.info("🔨 Creating database tables...")
            db.create_all()
            
            # Verify tables were created
            inspector = db.inspect(db.engine)
            tables = inspector.get_table_names()
            
            if tables:
                logger.info(f"✅ Successfully created {len(tables)} tables:")
                for table in sorted(tables):
                    logger.info(f"   📋 {table}")
            else:
                logger.warning("⚠️  No tables found after creation")
                return False
            
            # Test table access
            try:
                user_count = db.session.query(User).count()
                logger.info(f"🔍 User table accessible (current count: {user_count})")
            except Exception as e:
                logger.error(f"❌ Error accessing user table: {e}")
                return False
            
            logger.info("🎉 Railway database initialization completed successfully!")
            return True
            
    except ImportError as e:
        logger.error(f"❌ Import error: {e}")
        logger.error("Make sure all dependencies are installed")
        return False
    except Exception as e:
        logger.error(f"❌ Unexpected error during initialization: {e}")
        return False

if __name__ == '__main__':
    success = init_railway_database()
    sys.exit(0 if success else 1)