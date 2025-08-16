"""Password management routes with encryption and security."""

from typing import Dict, Any
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

from ..models.password import Password, PasswordUpdateLog
from ..models.user import User
from ..config.extensions import db, bcrypt
from ..services.encryption_service import encryption_service
from ..utils.password_utils import calculate_password_strength
from ..middleware.security import log_sensitive_operation, require_master_key

passwords_bp = Blueprint('passwords', __name__)

def validate_password_data(data: Dict[str, Any]) -> tuple[bool, str]:
    """Validate password creation/update data."""
    required_fields = ['site_name', 'site_url', 'username', 'password']
    
    for field in required_fields:
        if not data.get(field):
            return False, f"Missing required field: {field}"
    
    if len(data['site_name']) > 255:
        return False, "Site name too long (max 255 characters)"
    
    if len(data['username']) > 255:
        return False, "Username too long (max 255 characters)"
    
    if len(data['password']) > 1000:
        return False, "Password too long (max 1000 characters)"
    
    return True, ""

@passwords_bp.route('', methods=['GET'])
@jwt_required()
def get_passwords():
    """Get all passwords for the authenticated user."""
    try:
        user_id = int(get_jwt_identity())
        passwords = Password.query.filter_by(user_id=user_id).order_by(Password.site_name).all()
        
        return jsonify({
            'passwords': [{
                'id': p.id,
                'site_name': p.site_name,
                'site_url': p.site_url,
                'username': p.username,
                'strength_score': p.strength_score,
                'last_updated': p.last_updated.isoformat() if p.last_updated else None,
                'auto_update_enabled': p.auto_update_enabled,
                'is_compromised': p.is_compromised,
                'created_at': p.created_at.isoformat() if p.created_at else None
            } for p in passwords],
            'count': len(passwords)
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error fetching passwords for user {get_jwt_identity()}: {str(e)}")
        return jsonify({'error': 'Failed to fetch passwords'}), 500

@passwords_bp.route('', methods=['POST'])
@jwt_required()
@log_sensitive_operation('password_add')
def add_password():
    """Add a new password entry for the authenticated user."""
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json(force=True)
        
        if not data:
            return jsonify({'error': 'Invalid JSON data'}), 400
        
        # Validate input data
        is_valid, error_msg = validate_password_data(data)
        if not is_valid:
            return jsonify({'error': error_msg}), 400
        
        # Encrypt password
        encrypted_password = encryption_service.encrypt(data['password'])
        
        # Create password entry
        password = Password(
            user_id=user_id,
            site_name=data['site_name'].strip(),
            site_url=data['site_url'].strip(),
            username=data['username'].strip(),
            encrypted_password=encrypted_password,
            strength_score=calculate_password_strength(data['password'])
        )
        
        db.session.add(password)
        db.session.commit()
        
        current_app.logger.info(f"Password added for user {user_id}: {data['site_name']}")
        
        return jsonify({
            'message': 'Password added successfully',
            'password': {
                'id': password.id,
                'site_name': password.site_name,
                'site_url': password.site_url,
                'username': password.username,
                'strength_score': password.strength_score,
                'created_at': password.created_at.isoformat() if password.created_at else None
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error adding password for user {get_jwt_identity()}: {str(e)}")
        return jsonify({'error': 'Failed to add password'}), 500

@passwords_bp.route('/<int:password_id>', methods=['PUT'])
@jwt_required()
@log_sensitive_operation('password_update')
def update_password(password_id):
    user_id = int(get_jwt_identity())
    password = Password.query.filter_by(id=password_id, user_id=user_id).first()
    
    if not password:
        return jsonify({'error': 'Password not found'}), 404
    
    data = request.get_json()
    old_strength = password.strength_score
    
    if 'password' in data:
        encrypted_password = encryption_service.encrypt(data['password'])
        password.encrypted_password = encrypted_password
        password.strength_score = calculate_password_strength(data['password'])
        password.last_updated = datetime.utcnow()
        
        log = PasswordUpdateLog(
            password_id=password.id,
            old_strength=old_strength,
            new_strength=password.strength_score,
            update_reason=data.get('reason', 'Manual update'),
            success=True
        )
        db.session.add(log)
    
    if 'auto_update_enabled' in data:
        password.auto_update_enabled = data['auto_update_enabled']
    
    db.session.commit()
    return jsonify({'message': 'Password updated successfully'})

@passwords_bp.route('/<int:password_id>', methods=['DELETE'])
@jwt_required()
@log_sensitive_operation('password_delete')
def delete_password(password_id):
    user_id = int(get_jwt_identity())
    password = Password.query.filter_by(id=password_id, user_id=user_id).first()
    
    if not password:
        return jsonify({'error': 'Password not found'}), 404
    
    db.session.delete(password)
    db.session.commit()
    
    return jsonify({'message': 'Password deleted successfully'})

@passwords_bp.route('/<int:password_id>/decrypt', methods=['POST'])
@jwt_required()
@log_sensitive_operation('password_decrypt')
def decrypt_password(password_id: int):
    """Decrypt a password with master key verification."""
    try:
        user_id = int(get_jwt_identity())
        
        # Find password entry
        password = Password.query.filter_by(id=password_id, user_id=user_id).first()
        if not password:
            return jsonify({'error': 'Password not found'}), 404
        
        # Validate request data
        data = request.get_json(force=True)
        if not data:
            return jsonify({'error': 'Invalid JSON data'}), 400
        
        master_key = data.get('master_key')
        if not master_key:
            return jsonify({'error': 'Master key is required'}), 400
        
        # Verify master key
        user = User.query.get(user_id)
        if not user or not bcrypt.check_password_hash(user.master_key_hash, master_key):
            current_app.logger.warning(f"Invalid master key attempt for user {user_id}")
            return jsonify({'error': 'Invalid master key'}), 401
        
        # Decrypt password
        decrypted_password = encryption_service.decrypt(password.encrypted_password)
        
        # Update last accessed timestamp
        password.last_accessed = datetime.utcnow()
        db.session.commit()
        
        current_app.logger.info(f"Password decrypted for user {user_id}: {password.site_name}")
        
        return jsonify({
            'password': decrypted_password,
            'site_name': password.site_name,
            'username': password.username
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error decrypting password {password_id} for user {get_jwt_identity()}: {str(e)}")
        return jsonify({'error': 'Failed to decrypt password'}), 500