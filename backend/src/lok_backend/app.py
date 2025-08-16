import os
from flask import Flask
from flask_cors import CORS

from .config.settings import config
from .config.extensions import db, jwt, bcrypt, limiter
from .config.logging import setup_logging
from .middleware.security import SecurityHeaders


def create_app(config_name=None):
    """Application factory pattern"""
    if config_name is None:
        config_name = os.getenv("FLASK_ENV", "development")

    app = Flask(__name__)
    app.config.from_object(config[config_name])

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)
    CORS(app)

    # Initialize rate limiter
    limiter.init_app(app)

    # Setup logging
    setup_logging(app)

    # Initialize security headers
    SecurityHeaders.init_app(app)

    # Register blueprints
    register_blueprints(app)

    # Register error handlers
    register_error_handlers(app)

    # Create database tables (production safe)
    with app.app_context():
        if config_name == "development":
            db.create_all()
        elif not db.engine.dialect.has_table(db.engine, "users"):
            db.create_all()

    return app


def register_blueprints(app):
    """Register application blueprints"""
    from .routes.auth import auth_bp
    from .routes.passwords import passwords_bp
    from .routes.security import security_bp
    from .routes.health import health_bp
    from .routes.devices import devices_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(passwords_bp, url_prefix="/api/passwords")
    app.register_blueprint(security_bp, url_prefix="/api/security")
    app.register_blueprint(devices_bp, url_prefix="/api/devices")
    app.register_blueprint(health_bp)


def register_error_handlers(app):
    """Register error handlers"""

    @app.errorhandler(404)
    def not_found(error):
        return {"error": "Resource not found"}, 404

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return {"error": "Internal server error"}, 500

    @app.errorhandler(429)
    def ratelimit_handler(e):
        return {"error": "Rate limit exceeded", "retry_after": str(e.retry_after)}, 429


# Entry points are in wsgi.py (production) and run.py (development)
