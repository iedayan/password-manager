"""Authentication API endpoints."""

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity,
    get_jwt,
)
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timezone
from pydantic import ValidationError
from secrets import choice
from string import ascii_letters, digits

from ...models.user import User
from ...core.database import db
from ...core.extensions import bcrypt, limiter
from ...schemas.auth import UserRegistration, UserLogin

auth_bp = Blueprint("auth", __name__)

# Token blacklist with TTL cleanup to prevent memory leaks
blacklisted_tokens = {}
TOKEN_BLACKLIST_TTL = 24 * 60 * 60  # 24 hours in seconds

def cleanup_expired_tokens():
    """Clean up expired blacklisted tokens"""
    import time
    current_time = time.time()
    expired_tokens = [token for token, expiry in blacklisted_tokens.items() if expiry < current_time]
    for token in expired_tokens:
        blacklisted_tokens.pop(token, None)


# ============================================================================
# USER REGISTRATION & LOGIN
# ============================================================================


@auth_bp.route("/register", methods=["POST"])
@limiter.limit("5 per minute")
def register():
    """Register a new user."""
    try:
        data = request.get_json(force=True)
        if not data:
            return jsonify({"error": "Invalid JSON data"}), 400
        
        # Remove debug logging to prevent information disclosure

        # Validate input using Pydantic
        try:
            user_data = UserRegistration(**data)
        except ValidationError as e:
            # Format validation errors properly
            errors = []
            for error in e.errors():
                field = error['loc'][0] if error['loc'] else 'unknown'
                message = error['msg']
                errors.append(f"{field}: {message}")
            return jsonify({"error": "; ".join(errors)}), 400

        # Check if user exists
        if User.query.filter_by(email=user_data.email).first():
            return jsonify({"error": "Email already registered"}), 409

        # Hash password
        password_hash = bcrypt.generate_password_hash(user_data.password).decode(
            "utf-8"
        )

        # Create user
        user = User(
            email=user_data.email,
            password_hash=password_hash,
        )

        db.session.add(user)
        db.session.commit()

        # Generate token
        access_token = create_access_token(identity=str(user.id))

        sanitized_email = user_data.email.split("@")[0] + "@***"
        current_app.logger.info(f"User registered successfully: {sanitized_email}")

        return (
            jsonify(
                {
                    "access_token": access_token,
                    "user_id": user.id,
                    "message": "User registered successfully",
                }
            ),
            201,
        )

    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Email already registered"}), 409
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Registration error: {type(e).__name__}: {str(e)}")
        return jsonify({"error": "Registration failed"}), 500


@auth_bp.route("/login", methods=["POST"])
@limiter.limit("10 per minute")
def login():
    """Authenticate user and return JWT token."""
    try:
        data = request.get_json(force=True)
        if not data:
            return jsonify({"error": "Invalid JSON data"}), 400
        
        # Remove debug logging to prevent information disclosure

        # Validate input using Pydantic
        try:
            login_data = UserLogin(**data)
        except ValidationError as e:
            # Format validation errors properly
            errors = []
            for error in e.errors():
                field = error['loc'][0] if error['loc'] else 'unknown'
                message = error['msg']
                errors.append(f"{field}: {message}")
            return jsonify({"error": "; ".join(errors)}), 400

        # Find user
        user = User.query.filter_by(email=login_data.email).first()

        # Check account lockout
        if user and user.is_locked:
            sanitized_email = login_data.email.split("@")[0] + "@***"
            current_app.logger.warning(
                f"Login attempt on locked account: {sanitized_email}"
            )
            return jsonify({"error": "Account temporarily locked"}), 423

        # Verify credentials
        if user and bcrypt.check_password_hash(user.password_hash, login_data.password):
            # Reset failed attempts on successful login
            user.reset_failed_login()
            user.last_login = datetime.now(timezone.utc)
            db.session.commit()

            access_token = create_access_token(identity=str(user.id))

            sanitized_email = login_data.email.split("@")[0] + "@***"
            current_app.logger.info(f"Successful login: {sanitized_email}")

            return (
                jsonify(
                    {
                        "access_token": access_token,
                        "user_id": user.id,
                        "message": "Login successful",
                    }
                ),
                200,
            )

        # Handle failed login
        if user:
            user.increment_failed_login()
            db.session.commit()

        sanitized_email = login_data.email.split("@")[0] + "@***"
        current_app.logger.warning(f"Failed login attempt: {sanitized_email}")
        return jsonify({"error": "Invalid credentials"}), 401

    except Exception as e:
        current_app.logger.error(f"Login error: {type(e).__name__}: {str(e)}")
        return jsonify({"error": "Login failed"}), 500


# ============================================================================
# TOKEN MANAGEMENT
# ============================================================================


@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    """Secure logout with token blacklisting and session cleanup."""
    try:
        user_id = int(get_jwt_identity())
        jti = get_jwt()["jti"]
        
        # Blacklist the current token with expiry
        import time
        cleanup_expired_tokens()
        blacklisted_tokens[jti] = time.time() + TOKEN_BLACKLIST_TTL
        
        # Update user's last logout time
        user = User.query.get(user_id)
        if user:
            user.last_logout = datetime.now(timezone.utc)
            db.session.commit()
        
        # Clear any active sessions (if session management is implemented)
        from ...models.login_session import LoginSession
        active_sessions = LoginSession.query.filter_by(user_id=user_id, is_active=True).all()
        for session in active_sessions:
            session.is_active = False
            session.ended_at = datetime.now(timezone.utc)
        
        db.session.commit()
        
        current_app.logger.info(f"User logged out successfully: {user_id}")
        
        return jsonify({
            "message": "Successfully logged out",
            "logged_out_at": datetime.now(timezone.utc).isoformat()
        }), 200

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Logout error: {str(e)}")
        return jsonify({"error": "Logout failed"}), 500


@auth_bp.route("/verify", methods=["GET"])
@jwt_required()
def verify_token():
    """Verify JWT token validity."""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)

        if not user or not user.is_active:
            return jsonify({"error": "Invalid user"}), 401

        return jsonify({"valid": True, "user_id": user.id, "email": user.email}), 200

    except Exception as e:
        current_app.logger.error(f"Token verification error: {str(e)}")
        return jsonify({"error": "Token verification failed"}), 401


@auth_bp.route("/refresh", methods=["POST"])
@jwt_required()
def refresh_token():
    """Refresh JWT token."""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)

        if not user or not user.is_active:
            return jsonify({"error": "Invalid user"}), 401

        # Blacklist old token with expiry
        jti = get_jwt()["jti"]
        import time
        cleanup_expired_tokens()
        blacklisted_tokens[jti] = time.time() + TOKEN_BLACKLIST_TTL

        # Create new token
        new_token = create_access_token(identity=str(user.id))

        return (
            jsonify(
                {"access_token": new_token, "message": "Token refreshed successfully"}
            ),
            200,
        )

    except Exception as e:
        current_app.logger.error(f"Token refresh error: {str(e)}")
        return jsonify({"error": "Token refresh failed"}), 500


# ============================================================================
# PASSWORD MANAGEMENT
# ============================================================================


@auth_bp.route("/change-password", methods=["POST"])
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

        current_app.logger.info(f"Password changed for user: {user_id}")

        return jsonify({"message": "Password changed successfully"}), 200

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Password change error: {str(e)}")
        return jsonify({"error": "Password change failed"}), 500


@auth_bp.route("/reset-password", methods=["POST"])
@limiter.limit("3 per minute")
def reset_password():
    """Initiate password reset (placeholder for email-based reset)."""
    try:
        data = request.get_json(force=True)
        if not data:
            return jsonify({"error": "Invalid JSON data"}), 400

        email = data.get("email")
        if not email:
            return jsonify({"error": "Email required"}), 400

        user = User.query.filter_by(email=email).first()

        # Always return success to prevent email enumeration
        sanitized_email = email.split("@")[0] + "@***"
        current_app.logger.info(f"Password reset requested for: {sanitized_email}")

        # TODO: Implement email-based password reset
        # For now, just log the request

        return (
            jsonify({"message": "If the email exists, a reset link has been sent"}),
            200,
        )

    except Exception as e:
        current_app.logger.error(f"Password reset error: {str(e)}")
        return jsonify({"error": "Password reset failed"}), 500


@auth_bp.route("/logout-all", methods=["POST"])
@jwt_required()
def logout_all_sessions():
    """Logout from all devices/sessions."""
    try:
        user_id = int(get_jwt_identity())
        
        # Get all user's tokens (in production, store JTIs in database)
        # For now, we'll clear all sessions
        from ...models.login_session import LoginSession
        
        # Deactivate all user sessions
        active_sessions = LoginSession.query.filter_by(user_id=user_id, is_active=True).all()
        session_count = len(active_sessions)
        
        for session in active_sessions:
            session.is_active = False
            session.ended_at = datetime.now(timezone.utc)
        
        # Update user logout time
        user = User.query.get(user_id)
        if user:
            user.last_logout = datetime.now(timezone.utc)
        
        db.session.commit()
        
        current_app.logger.info(f"User logged out from all sessions: {user_id} ({session_count} sessions)")
        
        return jsonify({
            "message": f"Successfully logged out from {session_count} sessions",
            "sessions_terminated": session_count,
            "logged_out_at": datetime.now(timezone.utc).isoformat()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Logout all sessions error: {str(e)}")
        return jsonify({"error": "Failed to logout from all sessions"}), 500


@auth_bp.route("/sessions", methods=["GET"])
@jwt_required()
def get_active_sessions():
    """Get user's active sessions."""
    try:
        user_id = int(get_jwt_identity())
        
        from ...models.login_session import LoginSession
        
        sessions = LoginSession.query.filter_by(user_id=user_id, is_active=True).all()
        
        session_data = []
        for session in sessions:
            session_data.append({
                "id": session.id,
                "ip_address": session.ip_address,
                "user_agent": session.user_agent[:100] if session.user_agent else None,
                "created_at": session.created_at.isoformat(),
                "last_activity": session.last_activity.isoformat() if session.last_activity else None,
                "is_current": session.jti == get_jwt()["jti"]
            })
        
        return jsonify({
            "sessions": session_data,
            "total_sessions": len(session_data)
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Get sessions error: {str(e)}")
        return jsonify({"error": "Failed to get sessions"}), 500


# ============================================================================
# ACCOUNT MANAGEMENT
# ============================================================================


@auth_bp.route("/profile", methods=["GET"])
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


@auth_bp.route("/profile", methods=["PUT"])
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
            if isinstance(timeout, int) and 1 <= timeout <= 1440:  # 1 min to 24 hours
                user.auto_lock_timeout = timeout

        if "password_strength_requirement" in data:
            strength = data["password_strength_requirement"]
            if strength in ["weak", "medium", "strong"]:
                user.password_strength_requirement = strength

        user.updated_at = datetime.now(timezone.utc)
        db.session.commit()

        current_app.logger.info(f"Profile updated for user: {user_id}")

        return (
            jsonify(
                {"message": "Profile updated successfully", "profile": user.to_dict()}
            ),
            200,
        )

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Profile update error: {str(e)}")
        return jsonify({"error": "Profile update failed"}), 500


@auth_bp.route("/deactivate", methods=["POST"])
@jwt_required()
@limiter.limit("2 per minute")
def deactivate_account():
    """Deactivate user account."""
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
            return jsonify({"error": "Password required for account deactivation"}), 400

        # Verify password
        if not bcrypt.check_password_hash(user.password_hash, password):
            return jsonify({"error": "Invalid password"}), 401

        # Deactivate account
        user.is_active = False
        user.updated_at = datetime.now(timezone.utc)
        db.session.commit()

        # Blacklist current token with expiry
        jti = get_jwt()["jti"]
        import time
        cleanup_expired_tokens()
        blacklisted_tokens[jti] = time.time() + TOKEN_BLACKLIST_TTL

        current_app.logger.info(f"Account deactivated for user: {user_id}")

        return jsonify({"message": "Account deactivated successfully"}), 200

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Account deactivation error: {str(e)}")
        return jsonify({"error": "Account deactivation failed"}), 500


# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================


def check_if_token_revoked(jwt_header, jwt_payload):
    """Check if JWT token is blacklisted."""
    jti = jwt_payload["jti"]
    cleanup_expired_tokens()
    import time
    if jti in blacklisted_tokens:
        return blacklisted_tokens[jti] > time.time()
    return False


def generate_secure_token(length=32):
    """Generate cryptographically secure random token."""
    alphabet = ascii_letters + digits
    return "".join(choice(alphabet) for _ in range(length))
