"""Onboarding API endpoints."""

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timezone

from ...models.user import User
from ...models.password import Password
from ...core.database import db

onboarding_bp = Blueprint("onboarding", __name__)


@onboarding_bp.route("/progress", methods=["GET"])
@jwt_required()
def get_progress():
    """Get user's onboarding progress."""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Get user's passwords for analysis
        passwords = Password.query.filter_by(user_id=user_id).all()
        
        # Calculate progress
        steps = [
            {
                "id": "welcome",
                "title": "Welcome to Lok",
                "description": "Get started with your secure password manager",
                "completed": True,  # Always completed when they reach dashboard
                "required": True,
                "estimated_time": 1
            },
            {
                "id": "add_password",
                "title": "Add Your First Password",
                "description": "Store your first password securely",
                "completed": len(passwords) > 0,
                "required": True,
                "estimated_time": 2
            },
            {
                "id": "import_passwords",
                "title": "Import Existing Passwords",
                "description": "Bring passwords from other managers (optional)",
                "completed": len(passwords) >= 5,  # Assume imported if many passwords
                "required": False,
                "estimated_time": 5
            },
            {
                "id": "security_assessment",
                "title": "Run Security Analysis",
                "description": "Analyze your password security and get recommendations",
                "completed": len(passwords) >= 3,
                "required": True,
                "estimated_time": 2
            },
            {
                "id": "setup_2fa",
                "title": "Enable Two-Factor Authentication",
                "description": "Add extra security to your account",
                "completed": getattr(user, 'two_factor_enabled', False),
                "required": False,
                "estimated_time": 3
            },
            {
                "id": "master_password",
                "title": "Set Master Password",
                "description": "Create a strong master password for encryption",
                "completed": True,  # Assume set during registration
                "required": True,
                "estimated_time": 2
            },
            {
                "id": "browser_extension",
                "title": "Install Browser Extension",
                "description": "Auto-fill passwords in your browser",
                "completed": False,  # Can't detect from backend
                "required": False,
                "estimated_time": 3
            },
            {
                "id": "mobile_app",
                "title": "Download Mobile App",
                "description": "Access passwords on your phone",
                "completed": False,  # Can't detect from backend
                "required": False,
                "estimated_time": 2
            }
        ]
        
        completed_count = sum(1 for step in steps if step["completed"])
        total_steps = len(steps)
        percentage = (completed_count / total_steps) * 100
        
        # Find current step
        current_step = None
        for step in steps:
            if not step["completed"]:
                current_step = step["id"]
                break
        
        is_complete = completed_count == total_steps
        
        return jsonify({
            "progress": {
                "completed_steps": completed_count,
                "total_steps": total_steps,
                "percentage": percentage,
                "estimated_time_remaining": max(0, (total_steps - completed_count) * 2)
            },
            "current_step": current_step,
            "is_complete": is_complete,
            "steps": steps
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Onboarding progress error: {str(e)}")
        return jsonify({"error": "Failed to get progress"}), 500


@onboarding_bp.route("/security-assessment", methods=["GET"])
@jwt_required()
def get_security_assessment():
    """Get user's security assessment."""
    try:
        user_id = int(get_jwt_identity())
        passwords = Password.query.filter_by(user_id=user_id).all()
        
        if not passwords:
            return jsonify({
                "overall_score": 0,
                "risk_level": "high",
                "recommendations": [
                    "Add your first password to get started",
                    "Enable two-factor authentication",
                    "Set up a strong master password"
                ],
                "stats": {
                    "total": 0,
                    "weak": 0,
                    "medium": 0,
                    "strong": 0
                }
            }), 200
        
        # Calculate security metrics
        total = len(passwords)
        weak = sum(1 for p in passwords if (p.strength_score or 0) < 60)
        medium = sum(1 for p in passwords if 60 <= (p.strength_score or 0) < 80)
        strong = sum(1 for p in passwords if (p.strength_score or 0) >= 80)
        
        # Calculate overall score
        if total == 0:
            overall_score = 0
        else:
            overall_score = sum(p.strength_score or 0 for p in passwords) / total
        
        # Determine risk level
        if overall_score >= 80:
            risk_level = "low"
        elif overall_score >= 60:
            risk_level = "medium"
        else:
            risk_level = "high"
        
        # Generate recommendations
        recommendations = []
        if weak > 0:
            recommendations.append(f"Update {weak} weak passwords")
        if total < 5:
            recommendations.append("Add more passwords to improve security")
        
        user = User.query.get(user_id)
        if not getattr(user, 'two_factor_enabled', False):
            recommendations.append("Enable two-factor authentication")
        
        if not recommendations:
            recommendations.append("Great job! Your security is looking good")
        
        return jsonify({
            "overall_score": round(overall_score),
            "risk_level": risk_level,
            "recommendations": recommendations,
            "stats": {
                "total": total,
                "weak": weak,
                "medium": medium,
                "strong": strong
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Security assessment error: {str(e)}")
        return jsonify({"error": "Failed to get assessment"}), 500


@onboarding_bp.route("/complete", methods=["POST"])
@jwt_required()
def complete_onboarding():
    """Mark onboarding as complete."""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # You could add an onboarding_completed field to User model
        # For now, we'll just return success
        
        current_app.logger.info(f"Onboarding completed for user: {user_id}")
        
        return jsonify({"message": "Onboarding completed successfully"}), 200
        
    except Exception as e:
        current_app.logger.error(f"Complete onboarding error: {str(e)}")
        return jsonify({"error": "Failed to complete onboarding"}), 500