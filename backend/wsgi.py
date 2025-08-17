"""WSGI entry point for production deployment."""

import os
from lok_backend.app import create_app

# Create application instance
config_name = os.environ.get('FLASK_ENV', 'production')
app = create_app(config_name)

if __name__ == "__main__":
    try:
        port = int(os.environ.get('PORT', 8080))
    except (ValueError, TypeError):
        port = 8080
    
    # Always bind to 0.0.0.0 in production
    app.run(host='0.0.0.0', port=port)