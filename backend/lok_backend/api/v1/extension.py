"""Extension-specific API endpoints."""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from urllib.parse import urlparse

from ...models.password import Password
from ...models.user import User
from ...core.database import db

extension_bp = Blueprint('extension', __name__)


@extension_bp.route('/credentials', methods=['GET'])
@jwt_required()
def get_credentials_for_domain():
    """Get credentials for a specific domain."""
    try:
        domain = request.args.get('domain')
        if not domain:
            return jsonify({'error': 'Domain parameter required'}), 400

        user_id = get_jwt_identity()
        
        # Find passwords matching the domain
        passwords = Password.query.filter_by(
            user_id=user_id,
            is_deleted=False
        ).all()
        
        matching_credentials = []
        for password in passwords:
            if password.site_url:
                try:
                    parsed_url = urlparse(password.site_url)
                    site_domain = parsed_url.netloc.lower()
                    
                    # Match exact domain or subdomain
                    if (site_domain == domain.lower() or 
                        site_domain.endswith('.' + domain.lower()) or
                        domain.lower().endswith('.' + site_domain)):
                        
                        matching_credentials.append({
                            'id': password.id,
                            'site_name': password.site_name,
                            'site_url': password.site_url,
                            'username': password.username,
                            'password': password.password  # Will be encrypted
                        })
                except:
                    continue
        
        return jsonify({
            'success': True,
            'credentials': matching_credentials,
            'count': len(matching_credentials)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@extension_bp.route('/save', methods=['POST'])
@jwt_required()
def save_credential():
    """Save a new credential from extension."""
    try:
        data = request.get_json()
        user_id = get_jwt_identity()
        
        password = Password(
            user_id=user_id,
            site_name=data.get('site_name'),
            site_url=data.get('site_url'),
            username=data.get('username'),
            password=data.get('password')
        )
        
        db.session.add(password)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Credential saved successfully',
            'id': password.id
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@extension_bp.route('/health', methods=['GET'])
def extension_health():
    """Health check for extension."""
    return jsonify({
        'status': 'healthy',
        'version': '1.0.0',
        'features': [
            'auto_fill',
            'password_generation',
            'breach_detection',
            'smart_suggestions'
        ]
    })