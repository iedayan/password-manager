"""Development server entry point."""

import os
from lok_backend.app import create_app

if __name__ == '__main__':
    config_name = os.environ.get('FLASK_ENV', 'development')
    app = create_app(config_name)
    port = int(os.environ.get('PORT', 5000))
    # Use 0.0.0.0 only in production containers, localhost for dev
    host = '0.0.0.0' if os.environ.get('RAILWAY_ENVIRONMENT') else '127.0.0.1'
    app.run(host=host, port=port, debug=False)