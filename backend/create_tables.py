#!/usr/bin/env python3
"""Create database tables for Railway deployment."""

import os
from lok_backend.app import create_app
from lok_backend.core.database import db

def create_tables():
    """Create all database tables."""
    # Use production config for Railway
    app = create_app('production')
    
    with app.app_context():
        print("Creating database tables...")
        
        # Import all models to ensure they're registered
        from lok_backend.models.user import User
        from lok_backend.models.password import Password
        from lok_backend.models.login_session import LoginSession
        from lok_backend.models.device import Device
        
        # Create all tables
        db.create_all()
        
        print("✅ Database tables created successfully!")
        
        # Verify tables were created
        inspector = db.inspect(db.engine)
        tables = inspector.get_table_names()
        print(f"📋 Created tables: {', '.join(tables)}")

if __name__ == '__main__':
    create_tables()