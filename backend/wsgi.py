"""WSGI entry point for production deployment."""

import os
from lok_backend.app import create_app

# Create application instance
config_name = os.environ.get('FLASK_ENV', 'production')
app = create_app(config_name)

if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5000))
    # Only bind to 0.0.0.0 in production
    host = '0.0.0.0' if os.environ.get('RAILWAY_ENVIRONMENT') else '127.0.0.1'
    app.run(host=host, port=port)