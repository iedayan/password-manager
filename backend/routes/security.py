from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from middleware.security import log_sensitive_operation, require_master_key
from services.audit_service import audit_service
from services.password_strength import password_analyzer
from services.two_factor_service import two_factor_service
from models.user import User
from models.password import Password
from config.extensions import db, bcrypt
import asyncio
import logging

security_bp = Blueprint('security', __name__)
logger = logging.getLogger(__name__)

@security_bp.route('/dashboard', methods=['GET'])
@jwt_required()
@log_sensitive_operation('security_dashboard_access')
def get_security_dashboard():
    """Get comprehensive security dashboard"""
    try:
        user_id = int(get_jwt_identity())
        dashboard_data = audit_service.get_security_dashboard(user_id)
        return jsonify(dashboard_data), 200
    except Exception as e:
        logger.error(f"Security dashboard error: {e}")
        return jsonify({'error': 'Failed to load security dashboard'}), 500

@security_bp.route('/check-weak-passwords', methods=['GET'])
@jwt_required()
@log_sensitive_operation('weak_password_check')
def check_weak_passwords():
    """Identify weak passwords that need updating"""
    try:
        user_id = int(get_jwt_identity())
        passwords = Password.query.filter_by(user_id=user_id).all()
        
        weak_passwords = []
        for password in passwords:
            if password.strength_score < 40:  # Weak threshold
                weak_passwords.append({
                    'id': password.id,
                    'site_name': password.site_name,
                    'strength_score': password.strength_score,
                    'last_updated': password.last_updated.isoformat()
                })
        
        return jsonify({
            'weak_passwords': weak_passwords,
            'count': len(weak_passwords)
        }), 200
        
    except Exception as e:
        logger.error(f"Weak password check error: {e}")
        return jsonify({'error': 'Failed to check weak passwords'}), 500

@security_bp.route('/analyze-password', methods=['POST'])
@jwt_required()
def analyze_password_strength():
    """Analyze password strength without storing it"""
    try:
        data = request.get_json()
        if not data or 'password' not in data:
            return jsonify({'error': 'Password required'}), 400
        
        analysis = password_analyzer.analyze_password(data['password'])
        
        # Remove the actual analysis details for security
        response = {
            'score': analysis['score'],
            'strength': analysis['strength'],
            'issues': analysis['issues'],
            'recommendations': analysis['recommendations']
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        logger.error(f"Password analysis error: {e}")
        return jsonify({'error': 'Failed to analyze password'}), 500

@security_bp.route('/check-breaches', methods=['POST'])
@jwt_required()
@require_master_key
@log_sensitive_operation('breach_check')
async def check_password_breaches():
    """Check if passwords have been breached"""
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json()
        
        # Verify master key
        user = User.query.get(user_id)
        if not bcrypt.check_password_hash(user.master_key_hash, data['master_key']):
            return jsonify({'error': 'Invalid master key'}), 401
        
        passwords = Password.query.filter_by(user_id=user_id).all()
        breached_passwords = []
        
        for password in passwords:
            try:
                # Decrypt and check breach status
                from services.encryption_service import encryption_service
                decrypted_password = encryption_service.decrypt(password.encrypted_password)
                
                is_breached = await password_analyzer.check_breach_status(decrypted_password)
                
                if is_breached:
                    breached_passwords.append({
                        'id': password.id,
                        'site_name': password.site_name,
                        'site_url': password.site_url
                    })
                    
                    # Update breach status
                    password.is_compromised = True
                    
            except Exception as e:
                logger.error(f"Error checking breach for password {password.id}: {e}")
                continue
        
        db.session.commit()
        
        return jsonify({
            'breached_passwords': breached_passwords,
            'count': len(breached_passwords)
        }), 200
        
    except Exception as e:
        logger.error(f"Breach check error: {e}")
        return jsonify({'error': 'Failed to check breaches'}), 500

@security_bp.route('/2fa/setup', methods=['POST'])
@jwt_required()
@log_sensitive_operation('2fa_setup_start')
def setup_2fa():
    """Start 2FA setup process"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if user.two_factor_enabled:
            return jsonify({'error': '2FA is already enabled'}), 400
        
        # Generate secret and QR code
        secret = two_factor_service.generate_secret()
        qr_code = two_factor_service.generate_qr_code(user.email, secret)
        
        # Store secret temporarily (not enabled yet)
        user.two_factor_secret = secret
        db.session.commit()
        
        return jsonify({
            'qr_code': qr_code,
            'secret': secret,  # For manual entry
            'message': 'Scan QR code with authenticator app and verify with TOTP token'
        }), 200
        
    except Exception as e:
        logger.error(f"2FA setup error: {e}")
        return jsonify({'error': 'Failed to setup 2FA'}), 500

@security_bp.route('/2fa/enable', methods=['POST'])
@jwt_required()
@log_sensitive_operation('2fa_enable')
def enable_2fa():
    """Enable 2FA after verifying TOTP token"""
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json()
        
        if not data or 'totp_token' not in data:
            return jsonify({'error': 'TOTP token required'}), 400
        
        success, backup_codes = two_factor_service.enable_2fa(user_id, data['totp_token'])
        
        if success:
            return jsonify({
                'message': '2FA enabled successfully',
                'backup_codes': backup_codes
            }), 200
        else:
            return jsonify({'error': 'Invalid TOTP token'}), 400
            
    except Exception as e:
        logger.error(f"2FA enable error: {e}")
        return jsonify({'error': 'Failed to enable 2FA'}), 500

@security_bp.route('/2fa/disable', methods=['POST'])
@jwt_required()
@require_master_key
@log_sensitive_operation('2fa_disable')
def disable_2fa():
    """Disable 2FA"""
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json()
        
        # Verify master key
        user = User.query.get(user_id)
        if not bcrypt.check_password_hash(user.master_key_hash, data['master_key']):
            return jsonify({'error': 'Invalid master key'}), 401
        
        success = two_factor_service.disable_2fa(user_id)
        
        if success:
            return jsonify({'message': '2FA disabled successfully'}), 200
        else:
            return jsonify({'error': 'Failed to disable 2FA'}), 500
            
    except Exception as e:
        logger.error(f"2FA disable error: {e}")
        return jsonify({'error': 'Failed to disable 2FA'}), 500

@security_bp.route('/2fa/backup-codes/regenerate', methods=['POST'])
@jwt_required()
@require_master_key
@log_sensitive_operation('backup_codes_regenerate')
def regenerate_backup_codes():
    """Regenerate 2FA backup codes"""
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json()
        
        # Verify master key
        user = User.query.get(user_id)
        if not bcrypt.check_password_hash(user.master_key_hash, data['master_key']):
            return jsonify({'error': 'Invalid master key'}), 401
        
        backup_codes = two_factor_service.regenerate_backup_codes(user_id)
        
        if backup_codes:
            return jsonify({
                'backup_codes': backup_codes,
                'message': 'Backup codes regenerated successfully'
            }), 200
        else:
            return jsonify({'error': 'Failed to regenerate backup codes'}), 500
            
    except Exception as e:
        logger.error(f"Backup codes regeneration error: {e}")
        return jsonify({'error': 'Failed to regenerate backup codes'}), 500

@security_bp.route('/activity', methods=['GET'])
@jwt_required()
def get_user_activity():
    """Get user activity summary"""
    try:
        user_id = int(get_jwt_identity())
        days = request.args.get('days', 30, type=int)
        
        activity = audit_service.get_user_activity_summary(user_id, days)
        return jsonify(activity), 200
        
    except Exception as e:
        logger.error(f"Activity summary error: {e}")
        return jsonify({'error': 'Failed to get activity summary'}), 500