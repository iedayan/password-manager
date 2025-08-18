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

            # Get table names using inspector
            from sqlalchemy import inspect

            inspector = inspect(db.engine)
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

    app.register_blueprint(auth_bp, url_prefix="/api/v1/auth")
    app.register_blueprint(passwords_bp, url_prefix="/api/v1/passwords")
    app.register_blueprint(health_bp, url_prefix="/api/v1/health")
    app.register_blueprint(admin_bp, url_prefix="/api/v1/admin")
