from werkzeug.security import generate_password_hash, check_password_hash
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timezone
from config.database import db


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    master_password_hash = db.Column(db.String(255), nullable=False)
    salt = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    last_login = db.Column(db.DateTime)

    # Relationships
    password_entries = db.relationship("PasswordEntry", backref="user", lazy=True)

    def set_master_password(self, password, salt):

        self.salt = salt
        self.master_password_hash = generate_password_hash(password + salt)

    def check_master_password(self, password):
        return check_password_hash(self.master_password_hash, password + self.salt)
