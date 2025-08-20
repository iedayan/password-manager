"""Database migration utilities."""

from sqlalchemy import inspect, text


def auto_migrate_columns(app, db):
    """Auto-migrate missing columns on app startup."""
    try:
        inspector = inspect(db.engine)
        is_postgresql = 'postgresql' in str(db.engine.url)
        
        # Users table migration
        if 'users' in inspector.get_table_names():
            user_columns = [col['name'] for col in inspector.get_columns('users')]
            missing_cols = []
            
            required_cols = [
                ('is_2fa_enabled', 'BOOLEAN DEFAULT FALSE'),
                ('totp_secret', 'VARCHAR(32)'),
                ('totp_secret_temp', 'VARCHAR(32)'),
                ('biometric_enabled', 'BOOLEAN DEFAULT FALSE'),
                ('biometric_credential_id', 'VARCHAR(64)'),
                ('last_login', 'TIMESTAMP'),
                ('last_logout', 'TIMESTAMP'),
                ('last_sync', 'TIMESTAMP'),
                ('last_password_change', 'TIMESTAMP'),
                ('is_active', 'BOOLEAN DEFAULT TRUE'),
                ('email_verified', 'BOOLEAN DEFAULT FALSE'),
                ('auto_lock_timeout', 'INTEGER DEFAULT 15'),
                ('password_strength_requirement', 'VARCHAR(20) DEFAULT \'strong\'')
            ]
            
            for col_name, col_def in required_cols:
                if col_name not in user_columns:
                    try:
                        with db.engine.connect() as conn:
                            if is_postgresql:
                                conn.execute(text(f"ALTER TABLE users ADD COLUMN IF NOT EXISTS {col_name} {col_def}"))
                            else:
                                conn.execute(text(f"ALTER TABLE users ADD COLUMN {col_name} {col_def}"))
                            conn.commit()
                        missing_cols.append(col_name)
                    except Exception:
                        pass
            
            if missing_cols:
                app.logger.info(f"Auto-migrated user columns: {missing_cols}")
        
        # Passwords table migration
        if 'passwords' in inspector.get_table_names():
            password_columns = [col['name'] for col in inspector.get_columns('passwords')]
            missing_cols = []
            
            required_cols = [
                ('category', 'VARCHAR(50) DEFAULT \'Personal\''),
                ('is_favorite', 'BOOLEAN DEFAULT FALSE'),
                ('tags', 'TEXT'),
                ('last_accessed', 'TIMESTAMP'),
                ('auto_update_enabled', 'BOOLEAN DEFAULT FALSE'),
                ('is_compromised', 'BOOLEAN DEFAULT FALSE')
            ]
            
            for col_name, col_def in required_cols:
                if col_name not in password_columns:
                    try:
                        with db.engine.connect() as conn:
                            if is_postgresql:
                                conn.execute(text(f"ALTER TABLE passwords ADD COLUMN IF NOT EXISTS {col_name} {col_def}"))
                            else:
                                conn.execute(text(f"ALTER TABLE passwords ADD COLUMN {col_name} {col_def}"))
                            conn.commit()
                        missing_cols.append(col_name)
                    except Exception:
                        pass
            
            if missing_cols:
                app.logger.info(f"Auto-migrated password columns: {missing_cols}")
                
    except Exception as e:
        app.logger.error(f"Auto-migration error: {e}")