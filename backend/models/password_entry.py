from datetime import datetime, timezone
from config.database import db


class PasswordEntry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    site_id = db.Column(db.Integer, db.ForeignKey("site.id"), nullable=False)
    username = db.Column(db.Text, nullable=False)  # Encrypted
    password = db.Column(db.Text, nullable=False)  # Encrypted
    notes = db.Column(db.Text)  # Encrypted
    password_group_id = db.Column(db.Integer, db.ForeignKey("password_group.id"))
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    last_used = db.Column(db.DateTime)
    is_compromised = db.Column(db.Boolean, default=False)
