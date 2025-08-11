import os
from flask import Flask
from flask_cors import CORS

from config.settings import config
from config.extensions import db, jwt, bcrypt, init_limiter

def create_app(config_name=None):
    """Application factory pattern"""
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'development')
    
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)
    CORS(app)
    
    # Initialize rate limiter
    limiter = init_limiter(app)
    
    # Register blueprints
    register_blueprints(app, limiter)
    
    # Register error handlers
    register_error_handlers(app)
    
    # Create database tables
    with app.app_context():
        db.create_all()
    
    return app

def register_blueprints(app, limiter):
    """Register application blueprints"""
    from routes.auth import auth_bp
    from routes.passwords import passwords_bp
    from routes.security import security_bp
    
    # Apply rate limiting to auth routes
    limiter.limit("5 per minute")(auth_bp.view_functions['register'])
    limiter.limit("10 per minute")(auth_bp.view_functions['login'])
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(passwords_bp, url_prefix='/api/passwords')
    app.register_blueprint(security_bp, url_prefix='/api/security')

def register_error_handlers(app):
    """Register error handlers"""
    @app.errorhandler(404)
    def not_found(error):
        return {'error': 'Resource not found'}, 404
    
    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return {'error': 'Internal server error'}, 500
    
    @app.errorhandler(429)
    def ratelimit_handler(e):
        return {'error': 'Rate limit exceeded', 'retry_after': str(e.retry_after)}, 429

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)