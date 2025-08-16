"""Development server entry point."""

import os
from .app import create_app

if __name__ == "__main__":
    app = create_app()
    debug_mode = os.getenv("FLASK_ENV") == "development"
    port = int(os.getenv("PORT", 5000))
    app.run(debug=debug_mode, port=port, host="127.0.0.1")