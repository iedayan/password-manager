#!/usr/bin/env python3
"""Create onboarding progress table."""

import os
import sys
from sqlalchemy import text

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from lok_backend.core.database import db
from lok_backend.app import create_app

def create_onboarding_table():
    """Create onboarding_progress table."""
    
    app = create_app()
    
    with app.app_context():
        try:
            # Create onboarding_progress table
            with db.engine.connect() as conn:
                conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS onboarding_progress (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        user_id INTEGER NOT NULL UNIQUE,
                        completed_steps TEXT,
                        current_step VARCHAR(50),
                        is_complete BOOLEAN NOT NULL DEFAULT 0,
                        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES users (id)
                    )
                """))
                conn.commit()
                print("✅ Created onboarding_progress table")
                
        except Exception as e:
            print(f"❌ Failed to create table: {e}")
            return False
            
    return True

if __name__ == "__main__":
    print("🔄 Creating onboarding progress table...")
    success = create_onboarding_table()
    
    if success:
        print("🎉 Onboarding table created successfully!")
    else:
        print("💥 Failed to create onboarding table!")
        sys.exit(1)