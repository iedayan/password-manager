"""WSGI entry point for production deployment."""

import os
import sys

# Add src directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from lok_backend.app import create_app

# Create application instance
app = create_app()

if __name__ == "__main__":
    app.run()