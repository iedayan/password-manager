import os
from flask import Flask
from config.database import db
from errors.error_handlers import init_error_handlers


def create_app(config_object=None):
    app = Flask(__name__)

    # Load configuration from environment variables or a config object
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
        "DATABASE_URL", "sqlite:///passwords.db"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    # You should also configure your JWT_SECRET_KEY here, for example:
    # app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "a-super-secret-key")

    if config_object:
        app.config.from_object(config_object)

    # Initialize extensions by binding them to the app
    db.init_app(app)

    # Register blueprints
    # Note: It's good practice to import blueprints inside the factory
    from routes.passwords import passwords_bp

    app.register_blueprint(passwords_bp, url_prefix="/api")

    # Initialize error handlers
    init_error_handlers(app)

    # Add a CLI command to create database tables
    @app.cli.command("init-db")
    def init_db_command():
        """Creates the database tables."""
        db.create_all()
        print("Initialized the database.")

    return app


if __name__ == "__main__":
    app = create_app()
    # Using 'adhoc' for SSL is for development only.
    # For production, use a proper certificate from a CA.
    app.run(ssl_context="adhoc", debug=True)
