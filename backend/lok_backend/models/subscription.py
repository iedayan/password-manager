"""Subscription model for payment management."""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Numeric
from sqlalchemy.orm import relationship, backref
from ..core.database import db

class Subscription(db.Model):
    """User subscription model."""
    __tablename__ = 'subscriptions'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    stripe_customer_id = Column(String(255), unique=True)
    stripe_subscription_id = Column(String(255), unique=True)
    
    # Subscription details
    tier = Column(String(50), default='free')  # free, premium, business
    status = Column(String(50), default='active')  # active, canceled, past_due
    current_period_start = Column(DateTime(timezone=True))
    current_period_end = Column(DateTime(timezone=True))
    
    # Limits
    password_limit = Column(Integer, default=50)
    can_use_2fa = Column(Boolean, default=False)
    can_import_export = Column(Boolean, default=False)
    can_use_advanced_security = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    user = relationship("User", backref="subscription")
    
    def __repr__(self):
        return f'<Subscription {self.user_id}:{self.tier}>'
    
    @property
    def is_premium(self):
        return self.tier in ['personal', 'family', 'enterprise']
    
    @property
    def is_active(self):
        return self.status == 'active' and (
            not self.current_period_end or 
            self.current_period_end > datetime.now(timezone.utc)
        )
    
    def update_limits_for_tier(self):
        """Update subscription limits based on tier."""
        if self.tier == 'free':
            self.password_limit = 50
            self.can_use_2fa = False
            self.can_import_export = False
            self.can_use_advanced_security = False
        elif self.tier == 'personal':
            self.password_limit = -1  # unlimited
            self.can_use_2fa = True
            self.can_import_export = True
            self.can_use_advanced_security = True
        elif self.tier == 'family':
            self.password_limit = -1  # unlimited
            self.can_use_2fa = True
            self.can_import_export = True
            self.can_use_advanced_security = True
        elif self.tier == 'enterprise':
            self.password_limit = -1  # unlimited
            self.can_use_2fa = True
            self.can_import_export = True
            self.can_use_advanced_security = True