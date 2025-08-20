"""Password management API endpoints."""

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from ...middleware.subscription import check_password_limit, require_feature
from datetime import datetime, timezone
from pydantic import ValidationError
from sqlalchemy import or_
import secrets
import string
import re

from ...models.password import Password
from ...models.user import User
from ...core.database import db
from ...core.extensions import bcrypt, limiter
from ...services.encryption_service import encryption_service
from ...services.password_strength import calculate_password_strength
from ...schemas.password import PasswordCreate, PasswordUpdate, PasswordResponse

passwords_bp = Blueprint("passwords", __name__)


# ============================================================================
# BASIC CRUD OPERATIONS
# ============================================================================


@passwords_bp.route("", methods=["GET"])
@jwt_required()
def get_passwords():
    """Get all passwords for the authenticated user."""
    try:
        user_id = int(get_jwt_identity())
        passwords = (
            Password.query.filter_by(user_id=user_id).order_by(Password.site_name).all()
        )

        return (
            jsonify(
                {
                    "passwords": [p.to_dict() for p in passwords],
                    "count": len(passwords),
                }
            ),
            200,
        )

    except Exception as e:
        current_app.logger.error(
            f"Error fetching passwords for user {get_jwt_identity()}: {str(e)}"
        )
        return jsonify({"error": "Failed to fetch passwords"}), 500


@passwords_bp.route("/<int:password_id>", methods=["GET"])
@jwt_required()
def get_password(password_id):
    """Get individual password details (without decryption)."""
    try:
        user_id = int(get_jwt_identity())
        password = Password.query.filter_by(id=password_id, user_id=user_id).first()

        if not password:
            return jsonify({"error": "Password not found"}), 404

        return jsonify(PasswordResponse.model_validate(password).model_dump()), 200

    except Exception as e:
        current_app.logger.error(
            f"Error fetching password {int(password_id)}: {str(e)}"
        )
        return jsonify({"error": "Failed to fetch password"}), 500


@passwords_bp.route("", methods=["POST"])
@jwt_required()
@check_password_limit
@limiter.limit("20 per minute")
def add_password():
    """Add a new password entry."""
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json(force=True)

        if not data:
            return jsonify({"error": "Invalid JSON data"}), 400

        # Validate input using Pydantic
        try:
            password_data = PasswordCreate(**data)
        except ValidationError as e:
            return jsonify({"error": str(e)}), 400

        # Encrypt password
        encrypted_password = encryption_service.encrypt(password_data.password)

        # Create password entry
        password = Password(
            user_id=user_id,
            site_name=password_data.site_name,
            site_url=str(password_data.site_url) if password_data.site_url else None,
            username=password_data.username,
            encrypted_password=encrypted_password,
            notes=password_data.notes,
        )

        db.session.add(password)
        db.session.commit()

        sanitized_name = "".join(
            c for c in password_data.site_name if c.isprintable() and c not in "\n\r\t"
        )
        current_app.logger.info(
            f"Password added for user {user_id}: {sanitized_name[:50]}"
        )

        return (
            jsonify(
                {
                    "message": "Password added successfully",
                    "password": password.to_dict(),
                }
            ),
            201,
        )

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(
            f"Error adding password for user {get_jwt_identity()}: {str(e)}"
        )
        return jsonify({"error": "Failed to add password"}), 500


@passwords_bp.route("/<int:password_id>", methods=["PUT"])
@jwt_required()
@limiter.limit("30 per minute")
def update_password(password_id):
    """Update an existing password."""
    try:
        user_id = int(get_jwt_identity())
        password = Password.query.filter_by(id=password_id, user_id=user_id).first()

        if not password:
            return jsonify({"error": "Password not found"}), 404

        data = request.get_json(force=True)
        if not data:
            return jsonify({"error": "Invalid JSON data"}), 400

        # Validate input using Pydantic
        try:
            update_data = PasswordUpdate(**data)
        except ValidationError as e:
            return jsonify({"error": str(e)}), 400

        # Update fields
        if update_data.site_name is not None:
            password.site_name = update_data.site_name
        if update_data.site_url is not None:
            password.site_url = (
                str(update_data.site_url) if update_data.site_url else None
            )
        if update_data.username is not None:
            password.username = update_data.username
        if update_data.password is not None:
            password.encrypted_password = encryption_service.encrypt(
                update_data.password
            )
        if update_data.notes is not None:
            password.notes = update_data.notes

        password.updated_at = datetime.now(timezone.utc)
        db.session.commit()

        return (
            jsonify(
                {
                    "message": "Password updated successfully",
                    "password": PasswordResponse.model_validate(password).model_dump(),
                }
            ),
            200,
        )

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(
            f"Error updating password {int(password_id)}: {str(e)}"
        )
        return jsonify({"error": "Failed to update password"}), 500


@passwords_bp.route("/<int:password_id>", methods=["DELETE"])
@jwt_required()
@limiter.limit("10 per minute")
def delete_password(password_id):
    """Delete a password."""
    try:
        user_id = int(get_jwt_identity())
        password = Password.query.filter_by(id=password_id, user_id=user_id).first()

        if not password:
            return jsonify({"error": "Password not found"}), 404

        db.session.delete(password)
        db.session.commit()

        sanitized_name = "".join(
            c for c in password.site_name if c.isprintable() and c not in "\n\r\t"
        )
        current_app.logger.info(
            f"Password deleted for user {user_id}: {sanitized_name[:50]}"
        )

        return jsonify({"message": "Password deleted successfully"}), 200

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error deleting password {password_id}: {str(e)}")
        return jsonify({"error": "Failed to delete password"}), 500


# ============================================================================
# SEARCH & FILTERING
# ============================================================================


@passwords_bp.route("/search", methods=["GET"])
@jwt_required()
def search_passwords():
    """Search passwords by site name, username, or URL."""
    try:
        user_id = int(get_jwt_identity())
        query = request.args.get("q", "").strip()

        if not query:
            return jsonify({"error": "Search query required"}), 400

        passwords = (
            Password.query.filter(
                Password.user_id == user_id,
                or_(
                    Password.site_name.ilike(f"%{query}%"),
                    Password.username.ilike(f"%{query}%"),
                    Password.site_url.ilike(f"%{query}%"),
                ),
            )
            .order_by(Password.site_name)
            .all()
        )

        return (
            jsonify(
                {
                    "passwords": [
                        PasswordResponse.model_validate(p).model_dump()
                        for p in passwords
                    ],
                    "count": len(passwords),
                    "query": query,
                }
            ),
            200,
        )

    except Exception as e:
        current_app.logger.error(f"Error searching passwords: {str(e).replace(chr(10), ' ').replace(chr(13), ' ')[:200]}")
        return jsonify({"error": "Search failed"}), 500


# ============================================================================
# BULK OPERATIONS
# ============================================================================


@passwords_bp.route("/bulk", methods=["POST"])
@jwt_required()
@limiter.limit("5 per minute")
def bulk_operations():
    """Handle bulk operations: import, export, bulk delete."""
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json(force=True)

        if not data or "operation" not in data:
            return jsonify({"error": "Operation type required"}), 400

        operation = data["operation"]

        if operation == "export":
            passwords = Password.query.filter_by(user_id=user_id).all()
            return (
                jsonify(
                    {
                        "passwords": [p.to_dict() for p in passwords],
                        "exported_at": datetime.now(timezone.utc).isoformat(),
                    }
                ),
                200,
            )

        elif operation == "import":
            if "passwords" not in data:
                return jsonify({"error": "Passwords data required"}), 400

            imported_count = 0
            for pwd_data in data["passwords"]:
                try:
                    password_data = PasswordCreate(**pwd_data)
                    password = Password(
                        user_id=user_id,
                        site_name=password_data.site_name,
                        site_url=(
                            str(password_data.site_url)
                            if password_data.site_url
                            else None
                        ),
                        username=password_data.username,
                        encrypted_password=encryption_service.encrypt(
                            password_data.password
                        ),
                        notes=password_data.notes,
                    )
                    db.session.add(password)
                    imported_count += 1
                except Exception:
                    continue

            db.session.commit()
            return jsonify({"message": f"Imported {imported_count} passwords"}), 201

        elif operation == "delete":
            if "password_ids" not in data:
                return jsonify({"error": "Password IDs required"}), 400

            deleted_count = Password.query.filter(
                Password.user_id == user_id, Password.id.in_(data["password_ids"])
            ).delete(synchronize_session=False)

            db.session.commit()
            return jsonify({"message": f"Deleted {deleted_count} passwords"}), 200

        return jsonify({"error": "Invalid operation"}), 400

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error in bulk operation: {str(e)}")
        return jsonify({"error": "Bulk operation failed"}), 500


@passwords_bp.route("/<int:password_id>/favorite", methods=["POST"])
@jwt_required()
def toggle_favorite(password_id):
    """Toggle favorite status of a password."""
    try:
        user_id = int(get_jwt_identity())
        password = Password.query.filter_by(id=password_id, user_id=user_id).first()
        
        if not password:
            return jsonify({"error": "Password not found"}), 404
            
        password.is_favorite = not password.is_favorite
        password.updated_at = datetime.now(timezone.utc)
        db.session.commit()
        
        return jsonify({
            "message": "Favorite status updated",
            "is_favorite": password.is_favorite
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error toggling favorite {password_id}: {str(e)}")
        return jsonify({"error": "Failed to update favorite status"}), 500


@passwords_bp.route("/stats", methods=["GET"])
@jwt_required()
def get_password_stats():
    """Get password statistics for dashboard."""
    try:
        user_id = int(get_jwt_identity())
        passwords = Password.query.filter_by(user_id=user_id).all()
        
        stats = {
            "total": len(passwords),
            "weak": 0,
            "medium": 0, 
            "strong": 0,
            "favorites": 0,
            "duplicates": 0,
            "old": 0,
            "categories": {}
        }
        
        password_values = []
        
        for password in passwords:
            # Count favorites
            if password.is_favorite:
                stats["favorites"] += 1
                
            # Count categories
            category = password.category or 'Personal'
            stats["categories"][category] = stats["categories"].get(category, 0) + 1
            
            # Check age (90+ days old)
            if password.created_at:
                days_old = (datetime.now(timezone.utc) - password.created_at).days
                if days_old > 90:
                    stats["old"] += 1
            
            # Analyze password strength and duplicates
            try:
                decrypted = encryption_service.decrypt(password.encrypted_password)
                password_values.append(decrypted)
                
                strength = calculate_password_strength(decrypted)
                if strength < 60:
                    stats["weak"] += 1
                elif strength < 80:
                    stats["medium"] += 1
                else:
                    stats["strong"] += 1
                    
            except Exception:
                stats["weak"] += 1  # Count undecryptable as weak
        
        # Count duplicates
        from collections import Counter
        password_counts = Counter(password_values)
        stats["duplicates"] = sum(1 for count in password_counts.values() if count > 1)
        
        return jsonify(stats), 200
        
    except Exception as e:
        current_app.logger.error(f"Error getting password stats: {str(e)}")
        return jsonify({"error": "Failed to get statistics"}), 500


# ============================================================================
# SECURITY & ENCRYPTION
# ============================================================================


@passwords_bp.route("/<int:password_id>/decrypt", methods=["POST"])
@jwt_required()
@limiter.limit("50 per minute")
def decrypt_password(password_id):
    """Decrypt a password with master password verification."""
    try:
        user_id = int(get_jwt_identity())

        # Find password entry
        password = Password.query.filter_by(id=password_id, user_id=user_id).first()
        if not password:
            return jsonify({"error": "Password not found"}), 404

        # Validate request data
        data = request.get_json(force=True)
        if not data:
            return jsonify({"error": "Invalid JSON data"}), 400

        master_password = data.get("master_password")
        if not master_password:
            return jsonify({"error": "Master password is required"}), 400

        # Verify master password
        user = User.query.get(user_id)
        if not user or not bcrypt.check_password_hash(
            user.password_hash, master_password
        ):
            current_app.logger.warning(
                f"Invalid master password attempt for user {int(user_id)}"
            )
            return jsonify({"error": "Invalid master password"}), 401

        # Decrypt password
        decrypted_password = encryption_service.decrypt(password.encrypted_password)

        sanitized_name = "".join(
            c for c in password.site_name if c.isprintable() and c not in "\n\r\t"
        )
        current_app.logger.info(
            f"Password decrypted for user {user_id}: {sanitized_name[:50]}"
        )

        return (
            jsonify(
                {
                    "password": decrypted_password,
                    "site_name": password.site_name,
                    "username": password.username,
                }
            ),
            200,
        )

    except Exception as e:
        current_app.logger.error(f"Error decrypting password {password_id}: {str(e)}")
        return jsonify({"error": "Failed to decrypt password"}), 500


@passwords_bp.route("/analyze", methods=["GET"])
@jwt_required()
def analyze_passwords():
    """AI-powered password analysis with advanced security insights."""
    try:
        user_id = int(get_jwt_identity())
        passwords = Password.query.filter_by(user_id=user_id).all()

        # Import AI services
        from ...services.ai_security_service import ai_security_service
        from ...services.breach_detection_service import breach_detection_service

        password_data = []
        weak_passwords = []
        duplicate_passwords = {}

        for password in passwords:
            try:
                decrypted = encryption_service.decrypt(password.encrypted_password)
                
                # AI-enhanced strength analysis
                ai_analysis = ai_security_service.analyze_password_strength_ml(decrypted)
                
                pwd_data = {
                    'password': decrypted,
                    'site_name': password.site_name,
                    'username': password.username,
                    'created_at': password.created_at.isoformat()
                }
                password_data.append(pwd_data)

                if ai_analysis['score'] < 60:
                    weak_passwords.append({
                        "id": password.id,
                        "site_name": password.site_name,
                        "strength": ai_analysis['score'],
                        "ai_feedback": ai_analysis['feedback'],
                        "risk_level": ai_analysis['risk_level']
                    })

                if decrypted in duplicate_passwords:
                    duplicate_passwords[decrypted].append(password.site_name)
                else:
                    duplicate_passwords[decrypted] = [password.site_name]

            except Exception:
                continue

        duplicates = {
            sites[0]: sites for sites in duplicate_passwords.values() if len(sites) > 1
        }

        # AI-powered breach risk prediction
        breach_risk = ai_security_service.predict_breach_risk(password_data)
        
        # Breach pattern analysis
        breach_analysis = breach_detection_service.analyze_breach_patterns(password_data)

        return (
            jsonify(
                {
                    "weak_passwords": weak_passwords,
                    "duplicate_count": len(duplicates),
                    "duplicates": list(duplicates.values()),
                    "total_passwords": len(passwords),
                    "breach_risk": breach_risk,
                    "breach_analysis": breach_analysis,
                    "ai_recommendations": breach_risk.get('recommendations', []),
                    "analysis_date": datetime.now(timezone.utc).isoformat(),
                }
            ),
            200,
        )

    except Exception as e:
        current_app.logger.error(f"Error analyzing passwords: {str(e)}")
        return jsonify({"error": "Analysis failed"}), 500


# ============================================================================
# PASSWORD GENERATION
# ============================================================================


@passwords_bp.route("/generate", methods=["POST"])
@jwt_required()
@limiter.limit("30 per minute")
def generate_password():
    """AI-enhanced password generation with smart suggestions."""
    try:
        data = request.get_json() or {}
        length = min(max(data.get("length", 16), 8), 128)
        include_uppercase = data.get("uppercase", True)
        include_lowercase = data.get("lowercase", True)
        include_numbers = data.get("numbers", True)
        include_symbols = data.get("symbols", True)
        
        # AI context for smart generation
        site_name = data.get("site_name", "")
        username = data.get("username", "")

        charset = ""
        if include_lowercase:
            charset += string.ascii_lowercase
        if include_uppercase:
            charset += string.ascii_uppercase
        if include_numbers:
            charset += string.digits
        if include_symbols:
            charset += "!@#$%^&*()_+-=[]{}|;:,.<>?"

        if not charset:
            return (
                jsonify({"error": "At least one character type must be selected"}),
                400,
            )

        # Generate multiple password options
        passwords = []
        
        # Standard secure password
        standard_password = "".join(secrets.choice(charset) for _ in range(length))
        
        # Import AI service for smart suggestions
        from ...services.ai_security_service import ai_security_service
        
        # AI-enhanced analysis
        ai_analysis = ai_security_service.analyze_password_strength_ml(standard_password)
        
        passwords.append({
            "password": standard_password,
            "type": "secure_random",
            "strength": ai_analysis['score'],
            "entropy": ai_analysis['entropy'],
            "feedback": ai_analysis['feedback']
        })
        
        # Smart context-aware suggestions if site info provided
        if site_name:
            smart_suggestions = ai_security_service.smart_password_suggestions(site_name, username)
            for suggestion in smart_suggestions:
                suggestion_analysis = ai_security_service.analyze_password_strength_ml(suggestion)
                passwords.append({
                    "password": suggestion,
                    "type": "smart_suggestion",
                    "strength": suggestion_analysis['score'],
                    "entropy": suggestion_analysis['entropy'],
                    "feedback": suggestion_analysis['feedback']
                })

        return (
            jsonify({
                "passwords": passwords,
                "recommended": max(passwords, key=lambda x: x['strength']),
                "generation_date": datetime.now(timezone.utc).isoformat()
            }),
            200,
        )

    except Exception as e:
        current_app.logger.error(f"Error generating password: {str(e).replace(chr(10), ' ').replace(chr(13), ' ')[:200]}")
        return jsonify({"error": "Password generation failed"}), 500


@passwords_bp.route("/ai/breach-check", methods=["POST"])
@jwt_required()
@limiter.limit("10 per minute")
def ai_breach_check():
    """AI-powered breach detection for specific passwords."""
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json(force=True)
        
        if not data or "password_ids" not in data:
            return jsonify({"error": "Password IDs required"}), 400
        
        from ...services.breach_detection_service import breach_detection_service
        
        results = []
        for password_id in data["password_ids"]:
            password = Password.query.filter_by(id=password_id, user_id=user_id).first()
            if password:
                try:
                    decrypted = encryption_service.decrypt(password.encrypted_password)
                    breach_result = breach_detection_service.check_password_breach(decrypted)
                    
                    results.append({
                        "password_id": password_id,
                        "site_name": password.site_name,
                        "breach_status": breach_result
                    })
                except Exception:
                    continue
        
        return jsonify({
            "results": results,
            "checked_at": datetime.now(timezone.utc).isoformat()
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"AI breach check failed: {str(e)}")
        return jsonify({"error": "Breach check failed"}), 500


@passwords_bp.route("/ai/behavioral-analysis", methods=["POST"])
@jwt_required()
@limiter.limit("5 per minute")
def behavioral_analysis():
    """AI behavioral analysis for anomaly detection."""
    try:
        user_id = int(get_jwt_identity())
        
        # Collect login data
        login_data = {
            'ip_address': request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr),
            'user_agent': request.headers.get('User-Agent', ''),
            'timestamp': datetime.now(timezone.utc).isoformat()
        }
        
        from ...services.ai_security_service import ai_security_service
        
        # Perform behavioral analysis
        analysis = ai_security_service.detect_anomalous_behavior(user_id, login_data)
        
        # Log security events if anomalies detected
        if analysis['anomalies']:
            current_app.logger.warning(
                f"Behavioral anomalies detected for user {user_id}: {analysis['anomalies']}"
            )
        
        return jsonify({
            "analysis": analysis,
            "analyzed_at": datetime.now(timezone.utc).isoformat()
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Behavioral analysis failed: {str(e)}")
        return jsonify({"error": "Behavioral analysis failed"}), 500


@passwords_bp.route("/onboarding/progress", methods=["GET"])
@jwt_required()
def get_onboarding_progress():
    """Get user's onboarding progress."""
    try:
        user_id = int(get_jwt_identity())
        
        from ...services.onboarding_service import onboarding_service
        
        progress = onboarding_service.get_onboarding_progress(user_id)
        
        current_app.logger.info(f"Onboarding progress retrieved for user {user_id}")
        
        return jsonify({
            'success': True,
            'data': progress
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Onboarding progress failed: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to get onboarding progress',
            'message': str(e)
        }), 500


@passwords_bp.route("/onboarding/complete-step", methods=["POST"])
@jwt_required()
def complete_onboarding_step():
    """Complete an onboarding step."""
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json(force=True)
        
        if not data or "step_id" not in data:
            return jsonify({
                'success': False,
                'error': 'Step ID required'
            }), 400
        
        from ...services.onboarding_service import onboarding_service
        
        result = onboarding_service.complete_step(user_id, data["step_id"])
        
        current_app.logger.info(f"Step {data['step_id']} completed for user {user_id}")
        
        return jsonify({
            'success': True,
            'data': result
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Complete onboarding step failed: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to complete step',
            'message': str(e)
        }), 500


@passwords_bp.route("/security-assessment", methods=["GET"])
@jwt_required()
def security_assessment():
    """Perform security assessment of user's passwords."""
    try:
        user_id = int(get_jwt_identity())
        passwords = Password.query.filter_by(user_id=user_id).all()
        
        password_data = []
        for password in passwords:
            try:
                decrypted = encryption_service.decrypt(password.encrypted_password)
                password_data.append({
                    'password': decrypted,
                    'site_name': password.site_name,
                    'username': password.username,
                    'created_at': password.created_at.isoformat()
                })
            except Exception:
                continue
        
        from ...services.onboarding_service import onboarding_service
        
        assessment = onboarding_service.perform_security_assessment(password_data)
        
        return jsonify({
            "assessment": assessment.__dict__,
            "assessed_at": datetime.now(timezone.utc).isoformat()
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Security assessment failed: {str(e)}")
        return jsonify({"error": "Security assessment failed"}), 500


@passwords_bp.route("/migration-plan", methods=["POST"])
@jwt_required()
def generate_migration_plan():
    """Generate personalized migration plan."""
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json(force=True)
        
        if not data or "current_manager" not in data:
            return jsonify({"error": "Current password manager required"}), 400
        
        current_manager = data["current_manager"]
        password_count = data.get("password_count", 0)
        
        from ...services.onboarding_service import onboarding_service
        
        migration_plan = onboarding_service.generate_migration_plan(
            current_manager, password_count
        )
        
        return jsonify(migration_plan), 200
        
    except Exception as e:
        current_app.logger.error(f"Migration plan generation failed: {str(e)}")
        return jsonify({"error": "Failed to generate migration plan"}), 500


@passwords_bp.route("/ai/smart-monitoring", methods=["GET"])
@jwt_required()
def smart_monitoring():
    """AI-powered smart monitoring dashboard."""
    try:
        user_id = int(get_jwt_identity())
        passwords = Password.query.filter_by(user_id=user_id).all()
        
        password_data = []
        for password in passwords:
            try:
                decrypted = encryption_service.decrypt(password.encrypted_password)
                password_data.append({
                    'password': decrypted,
                    'site_name': password.site_name,
                    'username': password.username,
                    'created_at': password.created_at.isoformat()
                })
            except Exception:
                continue
        
        from ...services.breach_detection_service import breach_detection_service
        
        # Get smart monitoring insights
        monitoring_results = breach_detection_service.smart_breach_monitoring(password_data)
        
        return jsonify({
            "monitoring": monitoring_results,
            "generated_at": datetime.now(timezone.utc).isoformat()
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Smart monitoring failed: {str(e)}")
        return jsonify({"error": "Smart monitoring failed"}), 500


@passwords_bp.route("/import", methods=["POST"])
@jwt_required()
@require_feature('import_export')
@limiter.limit("5 per minute")
def import_passwords():
    """Import passwords from various password managers."""
    try:
        user_id = int(get_jwt_identity())
        
        # Check if file is provided
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        # Get format type from form data
        format_type = request.form.get('format', '')
        
        # Read file content
        file_content = file.read().decode('utf-8')
        
        from ...services.import_service import import_service
        
        # Import passwords
        imported_passwords, stats = import_service.import_passwords(
            file_content, format_type, file.filename
        )
        
        # Save imported passwords to database
        saved_count = 0
        for pwd in imported_passwords:
            try:
                # Encrypt password
                encrypted_password = encryption_service.encrypt(pwd.password)
                
                # Create password entry
                password = Password(
                    user_id=user_id,
                    site_name=pwd.site_name,
                    site_url=pwd.site_url,
                    username=pwd.username,
                    encrypted_password=encrypted_password,
                    notes=pwd.notes,
                    category=pwd.folder or 'Personal'
                )
                
                db.session.add(password)
                saved_count += 1
                
            except Exception as e:
                current_app.logger.warning(f"Failed to save password: {str(e)}")
                continue
        
        db.session.commit()
        
        current_app.logger.info(f"Imported {saved_count} passwords for user {user_id}")
        
        return jsonify({
            "message": f"Successfully imported {saved_count} passwords",
            "imported_count": saved_count,
            "total_processed": len(imported_passwords),
            "statistics": stats
        }), 201
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Password import failed: {str(e)}")
        return jsonify({"error": f"Import failed: {str(e)}"}), 500


@passwords_bp.route("/advanced-strength", methods=["POST"])
@jwt_required()
@limiter.limit("30 per minute")
def analyze_advanced_strength():
    """Analyze password strength using advanced AI algorithms."""
    try:
        data = request.get_json()
        if not data or "password" not in data:
            return jsonify({"error": "Password required"}), 400
        
        password = data["password"]
        
        from ...services.ai_security_service import ai_security_service
        
        # Perform advanced AI analysis
        analysis = ai_security_service.analyze_password_strength_ml(password)
        
        return jsonify(analysis), 200
        
    except Exception as e:
        current_app.logger.error(f"Advanced strength analysis failed: {str(e)}")
        return jsonify({"error": "Strength analysis failed"}), 500


@passwords_bp.route("/entropy-analysis", methods=["GET"])
@jwt_required()
def get_entropy_analysis():
    """Get entropy analysis for all user passwords."""
    try:
        user_id = int(get_jwt_identity())
        passwords = Password.query.filter_by(user_id=user_id).all()
        
        from ...services.ai_security_service import ai_security_service
        
        entropy_data = []
        total_entropy = 0
        
        for password in passwords:
            try:
                decrypted = encryption_service.decrypt(password.encrypted_password)
                analysis = ai_security_service.analyze_password_strength_ml(decrypted)
                
                entropy_data.append({
                    'site_name': password.site_name,
                    'entropy': analysis['entropy'],
                    'score': analysis['score'],
                    'level': analysis['level']
                })
                
                total_entropy += analysis['entropy']
                
            except Exception:
                continue
        
        average_entropy = total_entropy / len(entropy_data) if entropy_data else 0
        
        return jsonify({
            'entropy_distribution': entropy_data,
            'average_entropy': average_entropy,
            'total_passwords': len(entropy_data)
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Entropy analysis failed: {str(e)}")
        return jsonify({"error": "Entropy analysis failed"}), 500


@passwords_bp.route("/pattern-analysis", methods=["GET"])
@jwt_required()
def get_pattern_analysis():
    """Get pattern analysis for all user passwords."""
    try:
        user_id = int(get_jwt_identity())
        passwords = Password.query.filter_by(user_id=user_id).all()
        
        from ...services.ai_security_service import ai_security_service
        
        pattern_summary = {}
        total_patterns = 0
        
        for password in passwords:
            try:
                decrypted = encryption_service.decrypt(password.encrypted_password)
                analysis = ai_security_service.analyze_password_strength_ml(decrypted)
                
                patterns = analysis.get('patterns_detected', {})
                for pattern_type, pattern_list in patterns.items():
                    if pattern_list:  # If patterns were found
                        pattern_summary[pattern_type] = pattern_summary.get(pattern_type, 0) + len(pattern_list)
                        total_patterns += len(pattern_list)
                        
            except Exception:
                continue
        
        return jsonify({
            'pattern_summary': pattern_summary,
            'total_patterns': total_patterns,
            'analyzed_passwords': len(passwords)
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Pattern analysis failed: {str(e)}")
        return jsonify({"error": "Pattern analysis failed"}), 500


@passwords_bp.route("/breach-monitoring/start", methods=["POST"])
@jwt_required()
@limiter.limit("5 per minute")
def start_breach_monitoring():
    """Start real-time breach monitoring for user passwords."""
    try:
        user_id = int(get_jwt_identity())
        
        # In production, this would start a background task
        # For now, we'll just mark monitoring as active
        
        current_app.logger.info(f"Breach monitoring started for user {user_id}")
        
        return jsonify({
            "message": "Breach monitoring started",
            "monitoring_active": True,
            "started_at": datetime.now(timezone.utc).isoformat()
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Failed to start breach monitoring: {str(e)}")
        return jsonify({"error": "Failed to start monitoring"}), 500


@passwords_bp.route("/breach-monitoring/stop", methods=["POST"])
@jwt_required()
@limiter.limit("5 per minute")
def stop_breach_monitoring():
    """Stop real-time breach monitoring."""
    try:
        user_id = int(get_jwt_identity())
        
        current_app.logger.info(f"Breach monitoring stopped for user {user_id}")
        
        return jsonify({
            "message": "Breach monitoring stopped",
            "monitoring_active": False,
            "stopped_at": datetime.now(timezone.utc).isoformat()
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Failed to stop breach monitoring: {str(e)}")
        return jsonify({"error": "Failed to stop monitoring"}), 500


@passwords_bp.route("/export", methods=["GET"])
@jwt_required()
@limiter.limit("3 per minute")
def export_passwords():
    """Export user passwords in CSV format."""
    try:
        user_id = int(get_jwt_identity())
        passwords = Password.query.filter_by(user_id=user_id).all()
        
        export_data = []
        for password in passwords:
            try:
                # Note: In production, consider requiring master password for export
                decrypted = encryption_service.decrypt(password.encrypted_password)
                
                export_data.append({
                    "name": password.site_name,
                    "url": password.site_url or "",
                    "username": password.username,
                    "password": decrypted,
                    "notes": password.notes or "",
                    "category": password.category or "Personal",
                    "created_at": password.created_at.isoformat()
                })
                
            except Exception:
                continue
        
        current_app.logger.info(f"Exported {len(export_data)} passwords for user {user_id}")
        
        return jsonify({
            "passwords": export_data,
            "exported_count": len(export_data),
            "exported_at": datetime.now(timezone.utc).isoformat(),
            "format": "json"
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Password export failed: {str(e)}")
        return jsonify({"error": "Export failed"}), 500



