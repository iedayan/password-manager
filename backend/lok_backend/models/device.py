from datetime import datetime
from ..config.extensions import db
import uuid

class Device(db.Model):
    """Device model for mobile/desktop app management"""
    
    __tablename__ = 'devices'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    device_id = db.Column(db.String(255), nullable=False, index=True)
    device_name = db.Column(db.String(100), nullable=False)
    device_type = db.Column(db.String(20), nullable=False)  # mobile, desktop
    platform = db.Column(db.String(50))  # iOS, Android, Windows, macOS, Linux
    app_version = db.Column(db.String(20))
    
    # Security
    sync_token = db.Column(db.String(36), unique=True, default=lambda: str(uuid.uuid4()))
    is_trusted = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_seen = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        safe_name = ''.join(c for c in self.device_name if c.isprintable() and c not in '<>"\'')
        return f'<Device {safe_name} ({self.device_type})>'