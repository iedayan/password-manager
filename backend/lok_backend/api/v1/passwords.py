"""Password management API endpoints."""

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timezone
from pydantic import ValidationError

from ...models.password import Password
from ...models.user import User
from ...core.database import db
from ...core.extensions import bcrypt, limiter
from ...services.encryption_service import encryption_service
from ...schemas.password import PasswordCreate, PasswordUpdate, PasswordResponse

passwords_bp = Blueprint('passwords', __name__)


@passwords_bp.route('', methods=['GET'])
@jwt_required()
def get_passwords():
    """Get all passwords for the authenticated user."""
    try:
        user_id = int(get_jwt_identity())
        passwords = Password.query.filter_by(user_id=user_id).order_by(Password.site_name).all()
        
        return jsonify({
            'passwords': [PasswordResponse.from_orm(p).dict() for p in passwords],
            'count': len(passwords)
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error fetching passwords for user {get_jwt_identity()}: {str(e)}")
        return jsonify({'error': 'Failed to fetch passwords'}), 500


@passwords_bp.route('', methods=['POST'])
@jwt_required()
@limiter.limit("20 per minute")
def add_password():
    """Add a new password entry."""
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json(force=True)
        
        if not data:
            return jsonify({'error': 'Invalid JSON data'}), 400
        
        # Validate input using Pydantic
        try:
            password_data = PasswordCreate(**data)
        except ValidationError as e:
            return jsonify({'error': str(e)}), 400
        
        # Encrypt password
        encrypted_password = encryption_service.encrypt(password_data.password)
        
        # Create password entry
        password = Password(
            user_id=user_id,
            site_name=password_data.site_name,
            site_url=str(password_data.site_url) if password_data.site_url else None,
            username=password_data.username,
            encrypted_password=encrypted_password,
            notes=password_data.notes
        )
        
        db.session.add(password)
        db.session.commit()
        
        sanitized_name = password_data.site_name.replace('\n', '').replace('\r', '')
        current_app.logger.info(f"Password added for user {user_id}: {sanitized_name}")
        
        return jsonify({
            'message': 'Password added successfully',
            'password': PasswordResponse.from_orm(password).dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error adding password for user {get_jwt_identity()}: {str(e)}")
        return jsonify({'error': 'Failed to add password'}), 500


@passwords_bp.route('/<int:password_id>', methods=['PUT'])
@jwt_required()
@limiter.limit("30 per minute")
def update_password(password_id):
    """Update an existing password."""
    try:
        user_id = int(get_jwt_identity())
        password = Password.query.filter_by(id=password_id, user_id=user_id).first()
        
        if not password:
            return jsonify({'error': 'Password not found'}), 404
        
        data = request.get_json(force=True)
        if not data:
            return jsonify({'error': 'Invalid JSON data'}), 400
        
        # Validate input using Pydantic
        try:
            update_data = PasswordUpdate(**data)
        except ValidationError as e:
            return jsonify({'error': str(e)}), 400
        
        # Update fields
        if update_data.site_name is not None:
            password.site_name = update_data.site_name
        if update_data.site_url is not None:
            password.site_url = str(update_data.site_url) if update_data.site_url else None
        if update_data.username is not None:
            password.username = update_data.username
        if update_data.password is not None:
            password.encrypted_password = encryption_service.encrypt(update_data.password)
        if update_data.notes is not None:
            password.notes = update_data.notes
        
        password.updated_at = datetime.now(timezone.utc)
        db.session.commit()
        
        return jsonify({
            'message': 'Password updated successfully',
            'password': PasswordResponse.from_orm(password).dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating password {password_id}: {str(e)}")
        return jsonify({'error': 'Failed to update password'}), 500


@passwords_bp.route('/<int:password_id>', methods=['DELETE'])
@jwt_required()
@limiter.limit("10 per minute")
def delete_password(password_id):
    """Delete a password."""
    try:
        user_id = int(get_jwt_identity())
        password = Password.query.filter_by(id=password_id, user_id=user_id).first()
        
        if not password:
            return jsonify({'error': 'Password not found'}), 404
        
        db.session.delete(password)
        db.session.commit()
        
        sanitized_name = password.site_name.replace('\n', '').replace('\r', '')
        current_app.logger.info(f"Password deleted for user {user_id}: {sanitized_name}")
        
        return jsonify({'message': 'Password deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error deleting password {password_id}: {str(e)}")
        return jsonify({'error': 'Failed to delete password'}), 500


@passwords_bp.route('/<int:password_id>/decrypt', methods=['POST'])
@jwt_required()
@limiter.limit("50 per minute")
def decrypt_password(password_id):
    """Decrypt a password with master password verification."""
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
        
        master_password = data.get('master_password')
        if not master_password:
            return jsonify({'error': 'Master password is required'}), 400
        
        # Verify master password
        user = User.query.get(user_id)
        if not user or not bcrypt.check_password_hash(user.password_hash, master_password):
            current_app.logger.warning(f"Invalid master password attempt for user {user_id}")
            return jsonify({'error': 'Invalid master password'}), 401
        
        # Decrypt password
        decrypted_password = encryption_service.decrypt(password.encrypted_password)
        
        sanitized_name = password.site_name.replace('\n', '').replace('\r', '')
        current_app.logger.info(f"Password decrypted for user {user_id}: {sanitized_name}")
        
        return jsonify({
            'password': decrypted_password,
            'site_name': password.site_name,
            'username': password.username
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error decrypting password {password_id}: {str(e)}")
        return jsonify({'error': 'Failed to decrypt password'}), 500