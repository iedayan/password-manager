from flask_sqlalchemy import SQLAlchemy

# Initialize the SQLAlchemy extension.
# This instance is not yet associated with a Flask app.
# It will be connected to the app in the app factory.
db = SQLAlchemy()
