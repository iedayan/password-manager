"""Security and 2FA API endpoints."""

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timezone
import pyotp
import qrcode
import io
import base64
import secrets
from typing import Dict, List

from ...models.user import User
from ...models.password import Password
from ...core.database import db
from ...core.extensions import limiter
from ...services.encryption_service import encryption_service
from ...utils.password_utils import analyze_password_health

security_bp = Blueprint("security", __name__)

# ============================================================================
# TWO-FACTOR AUTHENTICATION
# ============================================================================

@security_bp.route("/2fa/setup", methods=["POST"])
@jwt_required()
@limiter.limit("5 per minute")
def setup_2fa():
    """Setup two-factor authentication for user."""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Generate secret key
        secret = pyotp.random_base32()
        
        # Create TOTP URI
        totp_uri = pyotp.totp.TOTP(secret).provisioning_uri(
            name=user.email,
            issuer_name="Lok Password Manager"
        )
        
        # Generate QR code
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(totp_uri)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        img_buffer = io.BytesIO()
        img.save(img_buffer, format='PNG')
        img_str = base64.b64encode(img_buffer.getvalue()).decode()
        
        # Store secret temporarily (not yet enabled)
        user.totp_secret_temp = secret
        db.session.commit()
        
        return jsonify({
            "secret": secret,
            "qr_code": f"data:image/png;base64,{img_str}",
            "totp_uri": totp_uri
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"2FA setup failed: {str(e)}")
        return jsonify({"error": "2FA setup failed"}), 500


@security_bp.route("/2fa/verify", methods=["POST"])
@jwt_required()
@limiter.limit("10 per minute")
def verify_2fa():
    """Verify and enable 2FA with TOTP code."""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user or not user.totp_secret_temp:
            return jsonify({"error": "No 2FA setup in progress"}), 400
        
        data = request.get_json()
        if not data or "code" not in data:
            return jsonify({"error": "Verification code required"}), 400
        
        code = data["code"].strip()
        if len(code) != 6 or not code.isdigit():
            return jsonify({"error": "Invalid code format"}), 400
        
        # Verify TOTP code
        totp = pyotp.TOTP(user.totp_secret_temp)
        if not totp.verify(code, valid_window=1):
            return jsonify({"error": "Invalid verification code"}), 400
        
        # Enable 2FA
        user.totp_secret = user.totp_secret_temp
        user.totp_secret_temp = None
        user.is_2fa_enabled = True
        
        # Generate backup codes
        backup_codes = [secrets.token_hex(4).upper() for _ in range(8)]
        user.backup_codes = ",".join(backup_codes)
        
        db.session.commit()
        
        current_app.logger.info(f"2FA enabled for user {user_id}")
        
        return jsonify({
            "message": "2FA enabled successfully",
            "backup_codes": backup_codes
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"2FA verification failed: {str(e)}")
        return jsonify({"error": "2FA verification failed"}), 500


@security_bp.route("/2fa/disable", methods=["POST"])
@jwt_required()
@limiter.limit("5 per minute")
def disable_2fa():
    """Disable two-factor authentication."""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        data = request.get_json()
        if not data or "password" not in data:
            return jsonify({"error": "Password required"}), 400
        
        # Verify password
        from ...core.extensions import bcrypt
        if not bcrypt.check_password_hash(user.password_hash, data["password"]):
            return jsonify({"error": "Invalid password"}), 401
        
        # Disable 2FA
        user.totp_secret = None
        user.totp_secret_temp = None
        user.is_2fa_enabled = False
        user.backup_codes = None
        
        db.session.commit()
        
        current_app.logger.info(f"2FA disabled for user {user_id}")
        
        return jsonify({"message": "2FA disabled successfully"}), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"2FA disable failed: {str(e)}")
        return jsonify({"error": "Failed to disable 2FA"}), 500


@security_bp.route("/2fa/status", methods=["GET"])
@jwt_required()
def get_2fa_status():
    """Get 2FA status for user."""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        return jsonify({
            "is_enabled": user.is_2fa_enabled or False,
            "has_backup_codes": bool(user.backup_codes)
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"2FA status check failed: {str(e)}")
        return jsonify({"error": "Failed to get 2FA status"}), 500


@security_bp.route("/2fa/backup-codes", methods=["POST"])
@jwt_required()
@limiter.limit("3 per minute")
def regenerate_backup_codes():
    """Regenerate backup codes for 2FA."""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user or not user.is_2fa_enabled:
            return jsonify({"error": "2FA not enabled"}), 400
        
        data = request.get_json()
        if not data or "password" not in data:
            return jsonify({"error": "Password required"}), 400
        
        # Verify password
        from ...core.extensions import bcrypt
        if not bcrypt.check_password_hash(user.password_hash, data["password"]):
            return jsonify({"error": "Invalid password"}), 401
        
        # Generate new backup codes
        backup_codes = [secrets.token_hex(4).upper() for _ in range(8)]
        user.backup_codes = ",".join(backup_codes)
        
        db.session.commit()
        
        current_app.logger.info(f"Backup codes regenerated for user {user_id}")
        
        return jsonify({
            "backup_codes": backup_codes,
            "message": "Backup codes regenerated successfully"
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Backup codes regeneration failed: {str(e)}")
        return jsonify({"error": "Failed to regenerate backup codes"}), 500


# ============================================================================
# PASSWORD HEALTH & SECURITY ANALYSIS
# ============================================================================

@security_bp.route("/health-check", methods=["GET"])
@jwt_required()
def password_health_check():
    """Comprehensive password health analysis."""
    try:
        user_id = int(get_jwt_identity())
        passwords = Password.query.filter_by(user_id=user_id).all()
        
        if not passwords:
            return jsonify({
                "total_passwords": 0,
                "weak_passwords": [],
                "reused_passwords": [],
                "old_passwords": [],
                "compromised_passwords": [],
                "overall_score": 100,
                "recommendations": []
            }), 200
        
        # Decrypt and analyze passwords
        password_data = []
        for password in passwords:
            try:
                decrypted = encryption_service.decrypt(password.encrypted_password)
                password_data.append({
                    "id": password.id,
                    "site_name": password.site_name,
                    "username": password.username,
                    "password": decrypted,
                    "created_at": password.created_at,
                    "updated_at": password.updated_at
                })
            except Exception:
                continue
        
        # Perform health analysis
        health_analysis = analyze_password_health(password_data)
        
        return jsonify(health_analysis), 200
        
    except Exception as e:
        current_app.logger.error(f"Password health check failed: {str(e)}")
        return jsonify({"error": "Health check failed"}), 500


@security_bp.route("/dashboard", methods=["GET"])
@jwt_required()
def security_dashboard():
    """Get comprehensive security dashboard data."""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        passwords = Password.query.filter_by(user_id=user_id).all()
        
        # Basic metrics
        total_passwords = len(passwords)
        weak_count = 0
        strong_count = 0
        duplicates = {}
        old_count = 0
        
        # Analyze passwords
        for password in passwords:
            try:
                decrypted = encryption_service.decrypt(password.encrypted_password)
                
                # Strength analysis
                from ...services.password_strength import calculate_password_strength
                strength = calculate_password_strength(decrypted)
                
                if strength < 60:
                    weak_count += 1
                elif strength >= 80:
                    strong_count += 1
                
                # Check for duplicates
                if decrypted in duplicates:
                    duplicates[decrypted] += 1
                else:
                    duplicates[decrypted] = 1
                
                # Check age (90+ days)
                if password.created_at:
                    days_old = (datetime.now(timezone.utc) - password.created_at).days
                    if days_old > 90:
                        old_count += 1
                        
            except Exception:
                weak_count += 1  # Count undecryptable as weak
        
        duplicate_count = sum(1 for count in duplicates.values() if count > 1)
        
        # Calculate overall score
        issues = weak_count + duplicate_count + old_count
        overall_score = max(0, 100 - (issues / max(total_passwords, 1)) * 100)
        
        # Security level
        if overall_score >= 90:
            security_level = "Excellent"
        elif overall_score >= 75:
            security_level = "Good"
        elif overall_score >= 60:
            security_level = "Fair"
        else:
            security_level = "Poor"
        
        # Recent activity (mock data for now)
        recent_activity = [
            {
                "action": "Password added",
                "details": "New password for example.com",
                "timestamp": datetime.now(timezone.utc).isoformat()
            },
            {
                "action": "Security scan completed",
                "details": f"Analyzed {total_passwords} passwords",
                "timestamp": (datetime.now(timezone.utc)).isoformat()
            }
        ]
        
        return jsonify({
            "overall_score": round(overall_score),
            "security_level": security_level,
            "total_passwords": total_passwords,
            "weak_passwords": weak_count,
            "strong_passwords": strong_count,
            "duplicate_passwords": duplicate_count,
            "old_passwords": old_count,
            "is_2fa_enabled": user.is_2fa_enabled or False,
            "last_login": user.last_login.isoformat() if user.last_login else None,
            "recent_activity": recent_activity,
            "recommendations": [
                f"Update {weak_count} weak passwords" if weak_count > 0 else None,
                f"Replace {duplicate_count} reused passwords" if duplicate_count > 0 else None,
                f"Refresh {old_count} old passwords" if old_count > 0 else None,
                "Enable two-factor authentication" if not user.is_2fa_enabled else None
            ]
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Security dashboard failed: {str(e)}")
        return jsonify({"error": "Dashboard data unavailable"}), 500


# ============================================================================
# BREACH MONITORING
# ============================================================================

@security_bp.route("/breach-check", methods=["POST"])
@jwt_required()
@limiter.limit("10 per minute")
def breach_check():
    """Check passwords against known breaches."""
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json()
        
        if not data or "password_ids" not in data:
            return jsonify({"error": "Password IDs required"}), 400
        
        results = []
        for password_id in data["password_ids"]:
            password = Password.query.filter_by(id=password_id, user_id=user_id).first()
            if password:
                try:
                    decrypted = encryption_service.decrypt(password.encrypted_password)
                    
                    # Mock breach check (in production, use HaveIBeenPwned API)
                    is_breached = decrypted.lower() in [
                        'password', '123456', 'qwerty', 'abc123', 'password123'
                    ]
                    
                    results.append({
                        "password_id": password_id,
                        "site_name": password.site_name,
                        "is_breached": is_breached,
                        "breach_count": 1 if is_breached else 0,
                        "last_breach": "2023-01-01" if is_breached else None
                    })
                except Exception:
                    continue
        
        return jsonify({
            "results": results,
            "checked_at": datetime.now(timezone.utc).isoformat()
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Breach check failed: {str(e)}")
        return jsonify({"error": "Breach check failed"}), 500


# ============================================================================
# EXPORT WITH SECURITY
# ============================================================================

@security_bp.route("/export", methods=["POST"])
@jwt_required()
@limiter.limit("3 per minute")
def secure_export():
    """Export passwords with master password verification."""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        data = request.get_json()
        if not data:
            return jsonify({"error": "Request data required"}), 400
        
        export_format = data.get("format", "json")
        include_passwords = data.get("include_passwords", False)
        master_password = data.get("master_password")
        
        # Verify master password if including actual passwords
        if include_passwords:
            if not master_password:
                return jsonify({"error": "Master password required"}), 400
            
            from ...core.extensions import bcrypt
            if not bcrypt.check_password_hash(user.password_hash, master_password):
                return jsonify({"error": "Invalid master password"}), 401
        
        # Get passwords
        passwords = Password.query.filter_by(user_id=user_id).all()
        export_data = []
        
        for password in passwords:
            try:
                password_value = "[HIDDEN]"
                if include_passwords:
                    password_value = encryption_service.decrypt(password.encrypted_password)
                
                export_data.append({
                    "site_name": password.site_name,
                    "site_url": password.site_url or "",
                    "username": password.username,
                    "password": password_value,
                    "notes": password.notes or "",
                    "category": password.category or "Personal",
                    "created_at": password.created_at.isoformat(),
                    "updated_at": password.updated_at.isoformat()
                })
            except Exception:
                continue
        
        current_app.logger.info(f"Data exported for user {user_id}: {len(export_data)} entries")
        
        return jsonify({
            "passwords": export_data,
            "exported_count": len(export_data),
            "exported_at": datetime.now(timezone.utc).isoformat(),
            "format": export_format,
            "includes_passwords": include_passwords
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Secure export failed: {str(e)}")
        return jsonify({"error": "Export failed"}), 500