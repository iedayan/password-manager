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
    
    # Use secure host binding
    host = os.environ.get('HOST', '127.0.0.1' if config_name == 'development' else '0.0.0.0')
    app.run(host=host, port=port)