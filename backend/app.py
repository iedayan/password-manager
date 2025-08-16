import os
from flask import Flask
from flask_cors import CORS

from config.settings import config
from config.extensions import db, jwt, bcrypt, init_limiter
from config.logging import setup_logging
from middleware.security import SecurityHeaders


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
    init_limiter(app)

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
    from routes.auth import auth_bp
    from routes.passwords import passwords_bp
    from routes.security import security_bp
    from routes.health import health_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(passwords_bp, url_prefix="/api/passwords")
    app.register_blueprint(security_bp, url_prefix="/api/security")
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


if __name__ == "__main__":
    app = create_app()
    # Never run debug mode in production
    debug_mode = os.getenv("FLASK_ENV") == "development"
    port = int(os.getenv("PORT", 5000))
    app.run(debug=debug_mode, port=port, host="127.0.0.1")
