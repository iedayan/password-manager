from datetime import datetime, timezone
from ..core.database import db
from uuid import uuid4


class User(db.Model):
    """Temporary safe user model without new columns"""

    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    uuid = db.Column(
        db.String(36),
        unique=True,
        nullable=False,
        default=lambda: str(uuid4()),
        index=True,
    )
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(128), nullable=False)

    # Security fields
    failed_login_attempts = db.Column(db.Integer, default=0, nullable=False)
    locked_until = db.Column(db.DateTime)
    two_factor_enabled = db.Column(db.Boolean, default=False, nullable=False)
    two_factor_secret = db.Column(db.String(32))
    backup_codes = db.Column(db.Text)

    # Timestamps
    created_at = db.Column(
        db.DateTime, default=datetime.now(timezone.utc), nullable=False
    )
    updated_at = db.Column(
        db.DateTime,
        default=datetime.now(timezone.utc),
        onupdate=datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    passwords = db.relationship(
        "Password", backref="user", lazy=True, cascade="all, delete-orphan"
    )

    def __repr__(self):
        safe_email = "".join(
            c for c in (self.email or "") if c.isprintable() and c not in "<>\"'"
        )
        return f"<User {safe_email}>"

    @property
    def is_locked(self):
        """Check if user account is locked"""
        if self.locked_until:
            return datetime.now(timezone.utc) < self.locked_until
        return False

    def lock_account(self, duration_minutes=30):
        """Lock user account for specified duration"""
        from datetime import timedelta

        self.locked_until = datetime.now(timezone.utc) + timedelta(
            minutes=duration_minutes
        )
        db.session.commit()

    def unlock_account(self):
        """Unlock user account"""
        self.failed_login_attempts = 0
        self.locked_until = None
        db.session.commit()

    def increment_failed_login(self):
        """Increment failed login attempts and lock if necessary"""
        self.failed_login_attempts += 1
        if self.failed_login_attempts >= 5:
            self.lock_account()
        db.session.commit()

    def reset_failed_login(self):
        """Reset failed login attempts"""
        self.failed_login_attempts = 0
        db.session.commit()

    def to_dict(self):
        """Convert user to dictionary (excluding sensitive data)"""
        return {
            "id": self.id,
            "uuid": self.uuid,
            "email": self.email,
            "created_at": self.created_at.isoformat(),
            "two_factor_enabled": self.two_factor_enabled,
        }