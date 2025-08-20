"""User profile management API endpoints."""

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timezone
from pydantic import ValidationError

from ...models.user import User
from ...models.login_session import LoginSession
from ...core.database import db
from ...core.extensions import bcrypt, limiter

user_bp = Blueprint("user", __name__)


@user_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    """Get user profile information."""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)

        if not user:
            return jsonify({"error": "User not found"}), 404

        return jsonify(user.to_dict()), 200

    except Exception as e:
        current_app.logger.error(f"Profile fetch error: {str(e)}")
        return jsonify({"error": "Failed to fetch profile"}), 500


@user_bp.route("/profile", methods=["PUT"])
@jwt_required()
@limiter.limit("10 per minute")
def update_profile():
    """Update user profile settings."""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)

        if not user:
            return jsonify({"error": "User not found"}), 404

        data = request.get_json(force=True)
        if not data:
            return jsonify({"error": "Invalid JSON data"}), 400

        # Update allowed fields
        if "auto_lock_timeout" in data:
            timeout = data["auto_lock_timeout"]
            if isinstance(timeout, int) and 1 <= timeout <= 1440:
                user.auto_lock_timeout = timeout

        if "password_strength_requirement" in data:
            strength = data["password_strength_requirement"]
            if strength in ["weak", "medium", "strong"]:
                user.password_strength_requirement = strength

        user.updated_at = datetime.now(timezone.utc)
        db.session.commit()

        return jsonify({
            "message": "Profile updated successfully",
            "profile": user.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Profile update error: {str(e)}")
        return jsonify({"error": "Profile update failed"}), 500


@user_bp.route("/sessions", methods=["GET"])
@jwt_required()
def get_sessions():
    """Get user's active sessions."""
    try:
        user_id = int(get_jwt_identity())
        
        sessions = LoginSession.query.filter_by(user_id=user_id, is_active=True).all()
        
        session_data = []
        for session in sessions:
            session_data.append({
                "id": session.id,
                "ip_address": session.ip_address,
                "user_agent": session.user_agent[:100] if session.user_agent else None,
                "created_at": session.created_at.isoformat(),
                "last_activity": session.last_activity.isoformat() if session.last_activity else None
            })
        
        return jsonify({
            "sessions": session_data,
            "total_sessions": len(session_data)
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Get sessions error: {str(e)}")
        return jsonify({"error": "Failed to get sessions"}), 500


@user_bp.route("/sessions/<int:session_id>", methods=["DELETE"])
@jwt_required()
@limiter.limit("10 per minute")
def terminate_session(session_id):
    """Terminate a specific session."""
    try:
        user_id = int(get_jwt_identity())
        
        session = LoginSession.query.filter_by(
            id=session_id, 
            user_id=user_id, 
            is_active=True
        ).first()
        
        if not session:
            return jsonify({"error": "Session not found"}), 404
        
        session.is_active = False
        session.ended_at = datetime.now(timezone.utc)
        db.session.commit()
        
        return jsonify({"message": "Session terminated successfully"}), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Terminate session error: {str(e)}")
        return jsonify({"error": "Failed to terminate session"}), 500


@user_bp.route("/change-password", methods=["POST"])
@jwt_required()
@limiter.limit("5 per minute")
def change_password():
    """Change user password."""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)

        if not user:
            return jsonify({"error": "User not found"}), 404

        data = request.get_json(force=True)
        if not data:
            return jsonify({"error": "Invalid JSON data"}), 400

        current_password = data.get("current_password")
        new_password = data.get("new_password")

        if not current_password or not new_password:
            return jsonify({"error": "Current and new passwords required"}), 400

        # Verify current password
        if not bcrypt.check_password_hash(user.password_hash, current_password):
            return jsonify({"error": "Invalid current password"}), 401

        # Validate new password strength
        if len(new_password) < 8:
            return jsonify({"error": "Password must be at least 8 characters"}), 400

        # Update password
        user.password_hash = bcrypt.generate_password_hash(new_password).decode("utf-8")
        user.last_password_change = datetime.now(timezone.utc)
        db.session.commit()

        return jsonify({"message": "Password changed successfully"}), 200

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Password change error: {str(e)}")
        return jsonify({"error": "Password change failed"}), 500


@user_bp.route("/delete", methods=["DELETE"])
@jwt_required()
@limiter.limit("2 per minute")
def delete_account():
    """Delete user account."""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)

        if not user:
            return jsonify({"error": "User not found"}), 404

        data = request.get_json(force=True)
        if not data:
            return jsonify({"error": "Invalid JSON data"}), 400

        password = data.get("password")
        if not password:
            return jsonify({"error": "Password required for account deletion"}), 400

        # Verify password
        if not bcrypt.check_password_hash(user.password_hash, password):
            return jsonify({"error": "Invalid password"}), 401

        # Delete user and cascade to passwords
        db.session.delete(user)
        db.session.commit()

        return jsonify({"message": "Account deleted successfully"}), 200

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Account deletion error: {str(e)}")
        return jsonify({"error": "Account deletion failed"}), 500