from datetime import datetime, timezone
from ..core.database import db


class Password(db.Model):
    """Password storage model with encryption"""

    __tablename__ = "passwords"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer, db.ForeignKey("users.id"), nullable=False, index=True
    )
    site_name = db.Column(db.String(100), nullable=False, index=True)
    site_url = db.Column(db.String(255), nullable=True)
    username = db.Column(db.String(100), nullable=False)
    encrypted_password = db.Column(db.Text, nullable=False)
    notes = db.Column(db.Text)
    created_at = db.Column(
        db.DateTime, default=datetime.now(timezone.utc), nullable=False
    )
    updated_at = db.Column(
        db.DateTime,
        default=datetime.now(timezone.utc),
        onupdate=datetime.now(timezone.utc),
        nullable=False,
    )
    last_accessed = db.Column(db.DateTime)
    auto_update_enabled = db.Column(db.Boolean, default=True, nullable=False)
    is_compromised = db.Column(db.Boolean, default=False, nullable=False)

    # New fields for enhanced features
    category = db.Column(db.String(50), default='Personal')
    is_favorite = db.Column(db.Boolean, default=False, nullable=False)
    tags = db.Column(db.Text)  # JSON string for tags
    
    # Indexes for better query performance
    __table_args__ = (
        db.Index("idx_user_site", "user_id", "site_name"),
        db.Index("idx_user_category", "user_id", "category"),
        db.Index("idx_user_favorite", "user_id", "is_favorite"),
    )

    def __repr__(self):
        safe_site_name = "".join(
            c for c in (self.site_name or "") if c.isprintable() and c not in "<>\"'"
        )
        safe_user_id = int(self.user_id) if self.user_id else 0
        return f"<Password {safe_site_name} for user {safe_user_id}>"

    def to_dict(self):
        """Convert password to dictionary (excluding encrypted data)"""
        from ..services.password_strength import calculate_password_strength
        from ..services.encryption_service import encryption_service
        
        # Calculate strength score if possible
        strength_score = 0
        try:
            if self.encrypted_password:
                decrypted = encryption_service.decrypt(self.encrypted_password)
                strength_score = calculate_password_strength(decrypted)
        except Exception:
            pass
            
        return {
            "id": self.id,
            "site_name": self.site_name,
            "site_url": self.site_url,
            "username": self.username,
            "strength_score": strength_score,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "last_accessed": (
                self.last_accessed.isoformat() if self.last_accessed else None
            ),
            "auto_update_enabled": self.auto_update_enabled,
            "is_compromised": self.is_compromised,
            "category": self.category or 'Personal',
            "is_favorite": self.is_favorite,
            "tags": self.tags,
        }


class PasswordUpdateLog(db.Model):
    """Log of password updates for audit trail"""

    __tablename__ = "password_update_logs"

    id = db.Column(db.Integer, primary_key=True)
    password_id = db.Column(db.Integer, db.ForeignKey("passwords.id"), nullable=False)
    old_strength = db.Column(db.Integer)
    new_strength = db.Column(db.Integer)
    update_reason = db.Column(db.String(100))
    updated_at = db.Column(
        db.DateTime, default=datetime.now(timezone.utc), nullable=False
    )
    success = db.Column(db.Boolean, default=False, nullable=False)

    def __repr__(self):
        safe_id = int(self.password_id) if self.password_id else 0
        safe_date = self.updated_at.isoformat() if self.updated_at else "None"
        return f"<PasswordUpdateLog {safe_id} at {safe_date}>"
