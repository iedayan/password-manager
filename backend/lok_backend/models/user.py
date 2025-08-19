from datetime import datetime, timezone
from ..core.database import db
from uuid import uuid4


class User(db.Model):
    """Enhanced user model with security features"""

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
    backup_codes = db.Column(db.Text)  # JSON array of backup codes
    
    # Two-Factor Authentication (additional fields)
    is_2fa_enabled = db.Column(db.Boolean, default=False, nullable=False)
    totp_secret = db.Column(db.String(32))  # Base32 encoded secret
    totp_secret_temp = db.Column(db.String(32))  # Temporary secret during setup
    
    # Biometric Authentication
    biometric_enabled = db.Column(db.Boolean, default=False, nullable=False)
    biometric_credential_id = db.Column(db.String(64))  # WebAuthn credential ID

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
    last_login = db.Column(db.DateTime)
    last_logout = db.Column(db.DateTime)
    last_sync = db.Column(db.DateTime)
    last_password_change = db.Column(db.DateTime, default=datetime.now(timezone.utc))

    # Status
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    email_verified = db.Column(db.Boolean, default=False, nullable=False)

    # Preferences
    auto_lock_timeout = db.Column(db.Integer, default=15)  # minutes
    password_strength_requirement = db.Column(db.String(20), default="strong")

    # Relationships
    passwords = db.relationship(
        "Password", backref="user", lazy=True, cascade="all, delete-orphan"
    )
    login_sessions = db.relationship(
        "LoginSession", backref="user", lazy=True, cascade="all, delete-orphan"
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
            "last_login": self.last_login.isoformat() if self.last_login else None,
            "is_active": self.is_active,
            "email_verified": self.email_verified,
            "two_factor_enabled": self.two_factor_enabled,
            "is_2fa_enabled": self.is_2fa_enabled,
            "auto_lock_timeout": self.auto_lock_timeout,
            "password_strength_requirement": self.password_strength_requirement,
        }
