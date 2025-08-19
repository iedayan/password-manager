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
            "http://localhost:5173",
            "https://comforting-sunshine-65105a.netlify.app",
            "https://*.netlify.app",
        ],
        supports_credentials=True,
    )

    # Setup logging
    setup_logging(app)

    # Register blueprints
    register_blueprints(app)

    # Initialize database
    with app.app_context():
        try:
            # Import all models
            from .models.user import User
            from .models.password import Password, PasswordUpdateLog
            from .models.login_session import LoginSession
            from .models.device import Device

            # Create tables and run migrations
            db.create_all()
            
            from .core.migrations import auto_migrate_columns
            auto_migrate_columns(app, db)
            
            from sqlalchemy import inspect
            tables = inspect(db.engine).get_table_names()
            app.logger.info(f"Database ready: {len(tables)} tables")
            
        except Exception as e:
            app.logger.error(f"Database initialization error: {e}")
            pass

    return app


def register_blueprints(app):
    """Register application blueprints."""
    from .api.v1.auth import auth_bp
    from .api.v1.passwords import passwords_bp
    from .api.v1.health import health_bp
    from .api.v1.admin import admin_bp
    from .api.v1.security import security_bp
    from .api.v1.onboarding import onboarding_bp
    from .api.v1.updates import updates_bp

    app.register_blueprint(auth_bp, url_prefix="/api/v1/auth")
    app.register_blueprint(passwords_bp, url_prefix="/api/v1/passwords")
    app.register_blueprint(health_bp, url_prefix="/api/v1/health")
    app.register_blueprint(admin_bp, url_prefix="/api/v1/admin")
    app.register_blueprint(security_bp, url_prefix="/api/v1/security")
    app.register_blueprint(onboarding_bp, url_prefix="/api/v1/onboarding")
    app.register_blueprint(updates_bp, url_prefix="/api/v1/updates")
