from datetime import datetime
from ..config.extensions import db

class Password(db.Model):
    """Password storage model with encryption"""
    __tablename__ = 'passwords'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    site_name = db.Column(db.String(100), nullable=False)
    site_url = db.Column(db.String(255), nullable=False)
    username = db.Column(db.String(100), nullable=False)
    encrypted_password = db.Column(db.Text, nullable=False)
    strength_score = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    last_accessed = db.Column(db.DateTime)
    auto_update_enabled = db.Column(db.Boolean, default=True, nullable=False)
    is_compromised = db.Column(db.Boolean, default=False, nullable=False)
    
    # Indexes for better query performance
    __table_args__ = (
        db.Index('idx_user_site', 'user_id', 'site_name'),
        db.Index('idx_strength_score', 'strength_score'),
    )
    
    def __repr__(self):
        return f'<Password {self.site_name} for user {self.user_id}>'
    
    def to_dict(self):
        """Convert password to dictionary (excluding encrypted data)"""
        return {
            'id': self.id,
            'site_name': self.site_name,
            'site_url': self.site_url,
            'username': self.username,
            'strength_score': self.strength_score,
            'created_at': self.created_at.isoformat(),
            'last_updated': self.last_updated.isoformat(),
            'last_accessed': self.last_accessed.isoformat() if self.last_accessed else None,
            'auto_update_enabled': self.auto_update_enabled,
            'is_compromised': self.is_compromised
        }

class PasswordUpdateLog(db.Model):
    """Log of password updates for audit trail"""
    __tablename__ = 'password_update_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    password_id = db.Column(db.Integer, db.ForeignKey('passwords.id'), nullable=False)
    old_strength = db.Column(db.Integer)
    new_strength = db.Column(db.Integer)
    update_reason = db.Column(db.String(100))
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    success = db.Column(db.Boolean, default=False, nullable=False)
    
    def __repr__(self):
        return f'<PasswordUpdateLog {self.password_id} at {self.updated_at}>'