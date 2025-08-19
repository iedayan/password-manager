"""Application factory for Lok Password Manager."""

from flask import Flask
from flask_cors import CORS

from .core.config import config
from .core.database import db
from .core.extensions import jwt, bcrypt, limiter
from .core.logging import setup_logging


def create_app(config_name="development"):
    """Create Flask application using the factory pattern."""
    app = Flask(__name__)

    # Load configuration
    app.config.from_object(config[config_name])

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)
    limiter.init_app(app)

    # Setup CORS
    CORS(
        app,
        origins=[
            "http://localhost:3000",
            "https://comforting-sunshine-65105a.netlify.app",
            "https://*.netlify.app",
        ],
        supports_credentials=True,
    )

    # Setup logging
    setup_logging(app)

    # Register blueprints
    register_blueprints(app)

    # Create database tables
    with app.app_context():
        try:
            # Import all models to ensure they're registered
            from .models.user import User
            from .models.password import Password, PasswordUpdateLog
            from .models.login_session import LoginSession
            from .models.device import Device

            # Create all tables
            db.create_all()

            # Auto-migrate missing columns
            from sqlalchemy import inspect, text
            inspector = inspect(db.engine)
            
            if 'users' in inspector.get_table_names():
                user_columns = [col['name'] for col in inspector.get_columns('users')]
                
                missing_cols = []
                required_cols = [
                    ('is_2fa_enabled', 'BOOLEAN DEFAULT FALSE'),
                    ('totp_secret', 'VARCHAR(32)'),
                    ('biometric_enabled', 'BOOLEAN DEFAULT FALSE'),
                    ('last_login', 'TIMESTAMP'),
                    ('is_active', 'BOOLEAN DEFAULT TRUE'),
                    ('email_verified', 'BOOLEAN DEFAULT FALSE'),
                    ('auto_lock_timeout', 'INTEGER DEFAULT 15')
                ]
                
                for col_name, col_def in required_cols:
                    if col_name not in user_columns:
                        try:
                            if 'postgresql' in str(db.engine.url):
                                db.engine.execute(text(f"ALTER TABLE users ADD COLUMN IF NOT EXISTS {col_name} {col_def}"))
                            else:
                                db.engine.execute(text(f"ALTER TABLE users ADD COLUMN {col_name} {col_def}"))
                            missing_cols.append(col_name)
                        except Exception:
                            pass
                
                if missing_cols:
                    app.logger.info(f"Auto-migrated user columns: {missing_cols}")
            
            # Auto-migrate passwords table
            if 'passwords' in inspector.get_table_names():
                password_columns = [col['name'] for col in inspector.get_columns('passwords')]
                
                missing_cols = []
                required_cols = [
                    ('category', 'VARCHAR(50) DEFAULT \'Personal\''),
                    ('is_favorite', 'BOOLEAN DEFAULT FALSE'),
                    ('tags', 'TEXT'),
                    ('is_compromised', 'BOOLEAN DEFAULT FALSE')
                ]
                
                for col_name, col_def in required_cols:
                    if col_name not in password_columns:
                        try:
                            if 'postgresql' in str(db.engine.url):
                                db.engine.execute(text(f"ALTER TABLE passwords ADD COLUMN IF NOT EXISTS {col_name} {col_def}"))
                            else:
                                db.engine.execute(text(f"ALTER TABLE passwords ADD COLUMN {col_name} {col_def}"))
                            missing_cols.append(col_name)
                        except Exception:
                            pass
                
                if missing_cols:
                    app.logger.info(f"Auto-migrated password columns: {missing_cols}")

            tables = inspector.get_table_names()
            app.logger.info(
                f"Database tables ready: {len(tables)} tables - {', '.join(sorted(tables))}"
            )

        except Exception as e:
            app.logger.error(f"Database initialization error: {e}")
            # Don't fail the app startup, just log the error
            pass

    return app


def register_blueprints(app):
    """Register application blueprints."""
    from .api.v1.auth import auth_bp
    from .api.v1.passwords import passwords_bp
    from .api.v1.health import health_bp
    from .api.v1.admin import admin_bp
    from .api.v1.security import security_bp

    app.register_blueprint(auth_bp, url_prefix="/api/v1/auth")
    app.register_blueprint(passwords_bp, url_prefix="/api/v1/passwords")
    app.register_blueprint(health_bp, url_prefix="/api/v1/health")
    app.register_blueprint(admin_bp, url_prefix="/api/v1/admin")
    app.register_blueprint(security_bp, url_prefix="/api/v1/security")
