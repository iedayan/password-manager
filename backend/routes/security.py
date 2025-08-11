from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from models.password import Password

security_bp = Blueprint('security', __name__)

@security_bp.route('/check-weak-passwords', methods=['GET'])
@jwt_required()
def check_weak_passwords():
    user_id = int(get_jwt_identity())
    weak_passwords = Password.query.filter_by(user_id=user_id).filter(Password.strength_score < 60).all()
    
    return jsonify([{
        'id': p.id,
        'site_name': p.site_name,
        'strength_score': p.strength_score,
        'last_updated': p.last_updated.isoformat()
    } for p in weak_passwords])

@security_bp.route('/auto-update-status', methods=['GET'])
@jwt_required()
def auto_update_status():
    user_id = int(get_jwt_identity())
    total_passwords = Password.query.filter_by(user_id=user_id).count()
    auto_update_enabled = Password.query.filter_by(user_id=user_id, auto_update_enabled=True).count()
    weak_passwords = Password.query.filter_by(user_id=user_id).filter(Password.strength_score < 60).count()
    
    return jsonify({
        'total_passwords': total_passwords,
        'auto_update_enabled': auto_update_enabled,
        'weak_passwords': weak_passwords,
        'last_scan': datetime.utcnow().isoformat()
    })