"""Two-Factor Authentication API endpoints."""

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
import pyotp
import qrcode
import io
import base64
from datetime import datetime, timezone

from ...models.user import User
from ...core.database import db
from ...core.extensions import limiter

two_factor_bp = Blueprint("two_factor", __name__)

@two_factor_bp.route("/setup", methods=["POST"])
@jwt_required()
@limiter.limit("3 per minute")
def setup_2fa():
    """Setup TOTP 2FA for user."""
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
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        qr_code = base64.b64encode(buffer.getvalue()).decode()
        
        # Store secret temporarily (not activated until verified)
        user.totp_secret_temp = secret
        db.session.commit()
        
        return jsonify({
            "secret": secret,
            "qr_code": f"data:image/png;base64,{qr_code}",
            "manual_entry_key": secret
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"2FA setup failed: {str(e)}")
        return jsonify({"error": "2FA setup failed"}), 500

@two_factor_bp.route("/verify", methods=["POST"])
@jwt_required()
@limiter.limit("5 per minute")
def verify_2fa():
    """Verify TOTP code and activate 2FA."""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user or not user.totp_secret_temp:
            return jsonify({"error": "No 2FA setup in progress"}), 400
            
        data = request.get_json()
        if not data or "code" not in data:
            return jsonify({"error": "TOTP code required"}), 400
            
        code = data["code"].replace(" ", "")
        
        # Verify TOTP code
        totp = pyotp.TOTP(user.totp_secret_temp)
        if totp.verify(code, valid_window=1):
            # Activate 2FA
            user.totp_secret = user.totp_secret_temp
            user.totp_secret_temp = None
            user.two_factor_enabled = True
            user.two_factor_enabled_at = datetime.now(timezone.utc)
            db.session.commit()
            
            return jsonify({
                "message": "2FA activated successfully",
                "backup_codes": []  # TODO: Generate backup codes
            }), 200
        else:
            return jsonify({"error": "Invalid TOTP code"}), 400
            
    except Exception as e:
        current_app.logger.error(f"2FA verification failed: {str(e)}")
        return jsonify({"error": "2FA verification failed"}), 500

@two_factor_bp.route("/disable", methods=["POST"])
@jwt_required()
@limiter.limit("3 per minute")
def disable_2fa():
    """Disable 2FA for user."""
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
        user.two_factor_enabled = False
        user.totp_secret = None
        user.totp_secret_temp = None
        db.session.commit()
        
        return jsonify({"message": "2FA disabled successfully"}), 200
        
    except Exception as e:
        current_app.logger.error(f"2FA disable failed: {str(e)}")
        return jsonify({"error": "Failed to disable 2FA"}), 500

@two_factor_bp.route("/status", methods=["GET"])
@jwt_required()
def get_2fa_status():
    """Get 2FA status for user."""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({"error": "User not found"}), 404
            
        return jsonify({
            "enabled": user.two_factor_enabled,
            "setup_in_progress": bool(user.totp_secret_temp)
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"2FA status check failed: {str(e)}")
        return jsonify({"error": "Failed to get 2FA status"}), 500