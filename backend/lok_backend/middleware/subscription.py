"""Subscription middleware for feature access control."""

from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity
from ..models.user import User

def require_premium(f):
    """Decorator to require premium subscription."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user or not user.subscription or not user.subscription.is_premium:
            return jsonify({
                "error": "Premium subscription required",
                "upgrade_url": "/pricing"
            }), 403
            
        return f(*args, **kwargs)
    return decorated_function

def require_active_subscription(f):
    """Decorator to require active subscription."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user or not user.subscription or not user.subscription.is_active:
            return jsonify({
                "error": "Active subscription required",
                "upgrade_url": "/pricing"
            }), 403
            
        return f(*args, **kwargs)
    return decorated_function

def check_password_limit(f):
    """Decorator to check password creation limits."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user or not user.subscription:
            return jsonify({"error": "Subscription not found"}), 404
            
        # Check if user has reached password limit
        if user.subscription.password_limit > 0:  # -1 means unlimited
            current_count = len(user.passwords)
            if current_count >= user.subscription.password_limit:
                return jsonify({
                    "error": f"Password limit reached ({user.subscription.password_limit})",
                    "upgrade_url": "/pricing"
                }), 403
                
        return f(*args, **kwargs)
    return decorated_function

def require_feature(feature_name):
    """Decorator to require specific subscription feature."""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            user_id = int(get_jwt_identity())
            user = User.query.get(user_id)
            
            if not user or not user.subscription:
                return jsonify({"error": "Subscription not found"}), 404
                
            # Check feature access
            feature_map = {
                '2fa': 'can_use_2fa',
                'import_export': 'can_import_export',
                'advanced_security': 'can_use_advanced_security'
            }
            
            if feature_name in feature_map:
                if not getattr(user.subscription, feature_map[feature_name], False):
                    return jsonify({
                        "error": f"Feature '{feature_name}' requires premium subscription",
                        "upgrade_url": "/pricing"
                    }), 403
                    
            return f(*args, **kwargs)
        return decorated_function
    return decorator