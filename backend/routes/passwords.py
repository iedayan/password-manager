from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_bcrypt import Bcrypt
from datetime import datetime
from models.password import Password, PasswordUpdateLog
from models.user import User
from config.extensions import db
from services.encryption_service import encryption_service
from utils.password_utils import calculate_password_strength
from middleware.security import log_sensitive_operation, require_master_key

passwords_bp = Blueprint('passwords', __name__)
bcrypt = Bcrypt()

@passwords_bp.route('', methods=['GET'])
@jwt_required()
def get_passwords():
    user_id = int(get_jwt_identity())
    passwords = Password.query.filter_by(user_id=user_id).all()
    
    return jsonify([{
        'id': p.id,
        'site_name': p.site_name,
        'site_url': p.site_url,
        'username': p.username,
        'strength_score': p.strength_score,
        'last_updated': p.last_updated.isoformat(),
        'auto_update_enabled': p.auto_update_enabled,
        'is_compromised': p.is_compromised
    } for p in passwords])

@passwords_bp.route('', methods=['POST'])
@jwt_required()
@log_sensitive_operation('password_add')
def add_password():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    if not data or not all(k in data for k in ['site_name', 'site_url', 'username', 'password']):
        return jsonify({'error': 'Missing required fields'}), 400
    
    encrypted_password = encryption_service.encrypt(data['password'])
    
    password = Password(
        user_id=user_id,
        site_name=data['site_name'],
        site_url=data['site_url'],
        username=data['username'],
        encrypted_password=encrypted_password,
        strength_score=calculate_password_strength(data['password'])
    )
    
    db.session.add(password)
    db.session.commit()
    
    return jsonify({
        'message': 'Password added successfully', 
        'id': password.id,
        'site_name': password.site_name,
        'username': password.username,
        'strength_score': password.strength_score
    }), 201

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
@require_master_key
@log_sensitive_operation('password_decrypt')
def decrypt_password(password_id):
    user_id = int(get_jwt_identity())
    password = Password.query.filter_by(id=password_id, user_id=user_id).first()
    
    if not password:
        return jsonify({'error': 'Password not found'}), 404
    
    data = request.get_json()
    user = User.query.get(user_id)
    
    master_key = data.get('master_key')
    if not master_key or not bcrypt.check_password_hash(user.master_key_hash, master_key):
        return jsonify({'error': 'Invalid master key'}), 401
    
    try:
        decrypted_password = encryption_service.decrypt(password.encrypted_password)
        
        # Update last accessed
        password.last_accessed = datetime.utcnow()
        db.session.commit()
        
        return jsonify({'password': decrypted_password})
    except Exception as e:
        return jsonify({'error': 'Failed to decrypt password'}), 500