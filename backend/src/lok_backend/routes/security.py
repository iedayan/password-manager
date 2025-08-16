"""Security routes for dashboard, 2FA, and password analysis."""

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

from ..models.user import User
from ..models.password import Password
from ..config.extensions import db, bcrypt
from ..services.password_strength import calculate_password_strength
from ..middleware.security import log_sensitive_operation

security_bp = Blueprint("security", __name__)


@security_bp.route("/dashboard", methods=["GET"])
@jwt_required()
@log_sensitive_operation("security_dashboard_access")
def get_security_dashboard():
    """Get security dashboard with password health metrics."""
    try:
        user_id = int(get_jwt_identity())
        passwords = Password.query.filter_by(user_id=user_id).all()

        # Calculate security metrics
        total_passwords = len(passwords)
        weak_passwords = sum(1 for p in passwords if p.strength_score < 60)
        strong_passwords = sum(1 for p in passwords if p.strength_score >= 80)
        compromised_passwords = sum(1 for p in passwords if p.is_compromised)

        # Calculate overall security score
        if total_passwords == 0:
            security_score = 100
        else:
            security_score = max(
                0, 100 - (weak_passwords * 20) - (compromised_passwords * 30)
            )

        dashboard_data = {
            "security_score": security_score,
            "total_passwords": total_passwords,
            "weak_passwords": weak_passwords,
            "strong_passwords": strong_passwords,
            "compromised_passwords": compromised_passwords,
            "last_updated": datetime.utcnow().isoformat(),
        }

        return jsonify(dashboard_data), 200

    except Exception as e:
        current_app.logger.error(f"Security dashboard error: {str(e)}")
        return jsonify({"error": "Failed to load security dashboard"}), 500


@security_bp.route("/check-weak-passwords", methods=["GET"])
@jwt_required()
@log_sensitive_operation("weak_password_check")
def check_weak_passwords():
    """Identify weak passwords that need updating."""
    try:
        user_id = int(get_jwt_identity())
        passwords = Password.query.filter_by(user_id=user_id).all()

        weak_passwords = []
        for password in passwords:
            if password.strength_score < 60:  # Weak threshold
                weak_passwords.append(
                    {
                        "id": password.id,
                        "site_name": password.site_name,
                        "strength_score": password.strength_score,
                        "last_updated": (
                            password.last_updated.isoformat()
                            if password.last_updated
                            else None
                        ),
                    }
                )

        return (
            jsonify({"weak_passwords": weak_passwords, "count": len(weak_passwords)}),
            200,
        )

    except Exception as e:
        current_app.logger.error(f"Weak password check error: {str(e)}")
        return jsonify({"error": "Failed to check weak passwords"}), 500


@security_bp.route("/analyze-password", methods=["POST"])
@jwt_required()
def analyze_password_strength():
    """Analyze password strength without storing it."""
    try:
        data = request.get_json(force=True)
        if not data or "password" not in data:
            return jsonify({"error": "Password required"}), 400

        password = data["password"]
        score = calculate_password_strength(password)

        # Determine strength level
        if score >= 80:
            strength = "Strong"
        elif score >= 60:
            strength = "Medium"
        else:
            strength = "Weak"

        # Basic recommendations
        recommendations = []
        if len(password) < 12:
            recommendations.append("Use at least 12 characters")
        if not any(c.isupper() for c in password):
            recommendations.append("Include uppercase letters")
        if not any(c.islower() for c in password):
            recommendations.append("Include lowercase letters")
        if not any(c.isdigit() for c in password):
            recommendations.append("Include numbers")
        if not any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password):
            recommendations.append("Include special characters")

        response = {
            "score": score,
            "strength": strength,
            "recommendations": recommendations,
        }

        return jsonify(response), 200

    except Exception as e:
        current_app.logger.error(f"Password analysis error: {str(e)}")
        return jsonify({"error": "Failed to analyze password"}), 500


@security_bp.route("/check-breaches", methods=["POST"])
@jwt_required()
@log_sensitive_operation("breach_check")
def check_password_breaches():
    """Check if passwords have been breached (placeholder implementation)."""
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json(force=True)

        if not data or "master_key" not in data:
            return jsonify({"error": "Master key required"}), 400

        # Verify master key
        user = User.query.get(user_id)
        if not user or not bcrypt.check_password_hash(
            user.master_key_hash, data["master_key"]
        ):
            return jsonify({"error": "Invalid master key"}), 401

        passwords = Password.query.filter_by(user_id=user_id).all()

        # Placeholder: Return compromised passwords based on existing flag
        breached_passwords = [
            {
                "id": password.id,
                "site_name": password.site_name,
                "site_url": password.site_url,
            }
            for password in passwords
            if password.is_compromised
        ]

        return (
            jsonify(
                {
                    "breached_passwords": breached_passwords,
                    "count": len(breached_passwords),
                    "message": "Breach check completed",
                }
            ),
            200,
        )

    except Exception as e:
        current_app.logger.error(f"Breach check error: {str(e)}")
        return jsonify({"error": "Failed to check breaches"}), 500


@security_bp.route("/2fa/status", methods=["GET"])
@jwt_required()
def get_2fa_status():
    """Get 2FA status for the user."""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)

        if not user:
            return jsonify({"error": "User not found"}), 404

        return (
            jsonify(
                {
                    "two_factor_enabled": user.two_factor_enabled,
                    "message": "2FA status retrieved successfully",
                }
            ),
            200,
        )

    except Exception as e:
        current_app.logger.error(f"2FA status error: {str(e)}")
        return jsonify({"error": "Failed to get 2FA status"}), 500


@security_bp.route("/2fa/setup", methods=["POST"])
@jwt_required()
@log_sensitive_operation("2fa_setup_start")
def setup_2fa():
    """Start 2FA setup process (placeholder implementation)."""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)

        if not user:
            return jsonify({"error": "User not found"}), 404

        if user.two_factor_enabled:
            return jsonify({"error": "2FA is already enabled"}), 400

        # Placeholder implementation - in production, integrate with TOTP library
        return (
            jsonify(
                {"message": "2FA setup not yet implemented", "status": "coming_soon"}
            ),
            501,
        )

    except Exception as e:
        current_app.logger.error(f"2FA setup error: {str(e)}")
        return jsonify({"error": "Failed to setup 2FA"}), 500
