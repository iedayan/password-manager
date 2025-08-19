#!/usr/bin/env python3
"""
Migration script to add missing columns to users table
"""

import sqlite3
import os
from datetime import datetime

def migrate_users_table():
    # Get database path
    db_path = os.path.join(os.path.dirname(__file__), 'instance', 'lok_passwords.db')
    
    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Get current table schema
        cursor.execute("PRAGMA table_info(users)")
        existing_columns = {row[1] for row in cursor.fetchall()}
        print(f"Existing columns: {existing_columns}")
        
        # Define all required columns with their types and defaults
        required_columns = {
            'id': 'INTEGER PRIMARY KEY',
            'uuid': 'VARCHAR(36) UNIQUE NOT NULL',
            'email': 'VARCHAR(120) UNIQUE NOT NULL',
            'password_hash': 'VARCHAR(128) NOT NULL',
            'failed_login_attempts': 'INTEGER DEFAULT 0 NOT NULL',
            'locked_until': 'DATETIME',
            'two_factor_enabled': 'BOOLEAN DEFAULT 0 NOT NULL',
            'two_factor_secret': 'VARCHAR(32)',
            'backup_codes': 'TEXT',
            'is_2fa_enabled': 'BOOLEAN DEFAULT 0 NOT NULL',
            'totp_secret': 'VARCHAR(32)',
            'totp_secret_temp': 'VARCHAR(32)',
            'biometric_enabled': 'BOOLEAN DEFAULT 0 NOT NULL',
            'biometric_credential_id': 'VARCHAR(64)',
            'created_at': 'DATETIME NOT NULL',
            'updated_at': 'DATETIME NOT NULL',
            'last_login': 'DATETIME',
            'last_logout': 'DATETIME',
            'last_password_change': 'DATETIME',
            'is_active': 'BOOLEAN DEFAULT 1 NOT NULL',
            'email_verified': 'BOOLEAN DEFAULT 0 NOT NULL',
            'auto_lock_timeout': 'INTEGER DEFAULT 15',
            'password_strength_requirement': 'VARCHAR(20) DEFAULT "strong"'
        }
        
        # Add missing columns
        missing_columns = set(required_columns.keys()) - existing_columns
        
        if not missing_columns:
            print("All columns already exist!")
            return
        
        print(f"Adding missing columns: {missing_columns}")
        
        for column in missing_columns:
            column_def = required_columns[column]
            
            # Handle special cases for ALTER TABLE
            if 'PRIMARY KEY' in column_def:
                continue  # Skip primary key, should already exist
            
            # Simplify column definition for ALTER TABLE
            if column == 'uuid' and 'uuid' not in existing_columns:
                # Add uuid column with default value
                cursor.execute(f"ALTER TABLE users ADD COLUMN {column} VARCHAR(36)")
                # Update existing rows with UUIDs
                cursor.execute("SELECT id FROM users")
                user_ids = cursor.fetchall()
                import uuid
                for (user_id,) in user_ids:
                    new_uuid = str(uuid.uuid4())
                    cursor.execute("UPDATE users SET uuid = ? WHERE id = ?", (new_uuid, user_id))
            elif 'DEFAULT' in column_def:
                # Extract just the column type and default for ALTER TABLE
                parts = column_def.split()
                col_type = parts[0]
                default_val = None
                
                if 'DEFAULT' in parts:
                    default_idx = parts.index('DEFAULT')
                    if default_idx + 1 < len(parts):
                        default_val = parts[default_idx + 1].strip('"\'')
                
                cursor.execute(f"ALTER TABLE users ADD COLUMN {column} {col_type}")
                
                # Set default values for existing rows
                if default_val is not None:
                    if default_val.isdigit():
                        cursor.execute(f"UPDATE users SET {column} = {default_val} WHERE {column} IS NULL")
                    elif default_val in ['0', '1']:
                        cursor.execute(f"UPDATE users SET {column} = {default_val} WHERE {column} IS NULL")
                    else:
                        cursor.execute(f"UPDATE users SET {column} = ? WHERE {column} IS NULL", (default_val,))
            else:
                # Simple column addition
                col_type = column_def.split()[0]
                cursor.execute(f"ALTER TABLE users ADD COLUMN {column} {col_type}")
        
        # Set timestamps for existing users if they don't have them
        current_time = datetime.now().isoformat()
        
        if 'created_at' in missing_columns:
            cursor.execute("UPDATE users SET created_at = ? WHERE created_at IS NULL", (current_time,))
        
        if 'updated_at' in missing_columns:
            cursor.execute("UPDATE users SET updated_at = ? WHERE updated_at IS NULL", (current_time,))
        
        if 'last_password_change' in missing_columns:
            cursor.execute("UPDATE users SET last_password_change = ? WHERE last_password_change IS NULL", (current_time,))
        
        conn.commit()
        print("Migration completed successfully!")
        
        # Verify the migration
        cursor.execute("PRAGMA table_info(users)")
        final_columns = {row[1] for row in cursor.fetchall()}
        print(f"Final columns: {final_columns}")
        
    except Exception as e:
        print(f"Migration failed: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_users_table()