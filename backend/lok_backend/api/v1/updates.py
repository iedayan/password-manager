"""Real-time updates API endpoints."""

from flask import Blueprint, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timezone

from ...models.user import User
from ...models.password import Password

updates_bp = Blueprint("updates", __name__)

@updates_bp.route("/check", methods=["GET"])
@jwt_required()
def check_updates():
    """Check for updates since last sync."""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Get last sync time from user session or default to 1 hour ago
        last_sync = user.last_sync or datetime.now(timezone.utc)
        
        # Check for password updates
        updated_passwords = Password.query.filter(
            Password.user_id == user_id,
            Password.updated_at > last_sync
        ).count()
        
        # Update last sync time
        user.last_sync = datetime.now(timezone.utc)
        from ...core.database import db
        db.session.commit()
        
        return jsonify({
            "has_updates": updated_passwords > 0,
            "updated_passwords": updated_passwords,
            "last_sync": last_sync.isoformat(),
            "server_time": datetime.now(timezone.utc).isoformat()
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Update check failed: {str(e)}")
        return jsonify({"error": "Update check failed"}), 500


@updates_bp.route("/sync", methods=["POST"])
@jwt_required()
def sync_data():
    """Sync all user data."""
    try:
        user_id = int(get_jwt_identity())
        
        # Get all passwords
        passwords = Password.query.filter_by(user_id=user_id).all()
        
        password_data = []
        for password in passwords:
            password_data.append({
                "id": password.id,
                "site_name": password.site_name,
                "site_url": password.site_url,
                "username": password.username,
                "category": password.category,
                "is_favorite": password.is_favorite,
                "strength_score": password.strength_score,
                "created_at": password.created_at.isoformat(),
                "updated_at": password.updated_at.isoformat()
            })
        
        return jsonify({
            "passwords": password_data,
            "sync_time": datetime.now(timezone.utc).isoformat()
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Data sync failed: {str(e)}")
        return jsonify({"error": "Data sync failed"}), 500