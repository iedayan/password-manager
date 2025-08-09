from datetime import datetime, timezone
from config.database import db


class PasswordGroup(db.Model):
    """Groups passwords that share the same plaintext value"""

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)  # Hash for grouping
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))

    # Relationships
    password_entries = db.relationship(
        "PasswordEntry", backref="password_group", lazy=True
    )
