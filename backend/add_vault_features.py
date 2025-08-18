#!/usr/bin/env python3
"""
Migration script to add new vault features to existing password manager database.
Adds: category, is_favorite, tags fields to passwords table.
"""

import os
import sys
from sqlalchemy import text

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from lok_backend.core.database import db
from lok_backend.app import create_app

def migrate_database():
    """Add new columns to passwords table for enhanced vault features."""
    
    app = create_app()
    
    with app.app_context():
        try:
            # Check if columns already exist
            with db.engine.connect() as conn:
                result = conn.execute(text("PRAGMA table_info(passwords)"))
                columns = [row[1] for row in result.fetchall()]
                
                migrations = []
                
                if 'category' not in columns:
                    migrations.append("ALTER TABLE passwords ADD COLUMN category VARCHAR(50) DEFAULT 'Personal'")
                    
                if 'is_favorite' not in columns:
                    migrations.append("ALTER TABLE passwords ADD COLUMN is_favorite BOOLEAN DEFAULT 0 NOT NULL")
                    
                if 'tags' not in columns:
                    migrations.append("ALTER TABLE passwords ADD COLUMN tags TEXT")
                
                # Execute migrations
                for migration in migrations:
                    print(f"Executing: {migration}")
                    conn.execute(text(migration))
                    conn.commit()
                
                # Create new indexes
                try:
                    conn.execute(text("CREATE INDEX IF NOT EXISTS idx_user_category ON passwords (user_id, category)"))
                    conn.execute(text("CREATE INDEX IF NOT EXISTS idx_user_favorite ON passwords (user_id, is_favorite)"))
                    conn.commit()
                    print("Created new indexes")
                except Exception as e:
                    print(f"Index creation warning: {e}")
            
            print(f"✅ Migration completed successfully! Added {len(migrations)} new columns.")
            
            if not migrations:
                print("ℹ️  All columns already exist, no migration needed.")
                
        except Exception as e:
            print(f"❌ Migration failed: {e}")
            return False
            
    return True

if __name__ == "__main__":
    print("🔄 Starting database migration for vault features...")
    success = migrate_database()
    
    if success:
        print("🎉 Migration completed successfully!")
        print("\nNew features available:")
        print("- Password categories (Banking, Email, Social, Work, Entertainment, Personal)")
        print("- Favorites system")
        print("- Tags support")
        print("- Enhanced password statistics")
    else:
        print("💥 Migration failed!")
        sys.exit(1)