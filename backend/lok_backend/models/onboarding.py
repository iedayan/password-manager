"""Onboarding progress model."""

from datetime import datetime, timezone
from ..core.database import db

class OnboardingProgress(db.Model):
    """User onboarding progress tracking."""
    
    __tablename__ = "onboarding_progress"
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, unique=True)
    completed_steps = db.Column(db.Text)  # JSON string of completed step IDs
    current_step = db.Column(db.String(50))
    is_complete = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc), nullable=False)
    
    def __repr__(self):
        return f"<OnboardingProgress user_id={self.user_id} complete={self.is_complete}>"