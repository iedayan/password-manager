from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from ..models.device import Device
from ..config.extensions import db

devices_bp = Blueprint('devices', __name__)

@devices_bp.route('', methods=['POST'])
@jwt_required()
def register_device():
    """Register a new device for mobile/desktop apps"""
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    if not data or not all(k in data for k in ['device_id', 'device_type', 'device_name']):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Check if device already exists
    existing_device = Device.query.filter_by(
        user_id=user_id, 
        device_id=data['device_id']
    ).first()
    
    if existing_device:
        existing_device.last_seen = datetime.utcnow()
        existing_device.is_active = True
        db.session.commit()
        return jsonify({'message': 'Device updated', 'id': existing_device.id})
    
    device = Device(
        user_id=user_id,
        device_id=data['device_id'],
        device_type=data['device_type'],  # 'mobile', 'desktop'
        device_name=data['device_name'],
        platform=data.get('platform', ''),
        app_version=data.get('app_version', '1.0.0')
    )
    
    db.session.add(device)
    db.session.commit()
    
    return jsonify({
        'message': 'Device registered successfully',
        'id': device.id,
        'sync_token': device.sync_token
    }), 201

@devices_bp.route('', methods=['GET'])
@jwt_required()
def get_devices():
    """Get all registered devices for user"""
    user_id = int(get_jwt_identity())
    devices = Device.query.filter_by(user_id=user_id, is_active=True).all()
    
    return jsonify([{
        'id': d.id,
        'device_name': d.device_name,
        'device_type': d.device_type,
        'platform': d.platform,
        'last_seen': d.last_seen.isoformat(),
        'is_trusted': d.is_trusted
    } for d in devices])

@devices_bp.route('/<int:device_id>', methods=['DELETE'])
@jwt_required()
def revoke_device(device_id):
    """Revoke device access"""
    user_id = int(get_jwt_identity())
    device = Device.query.filter_by(id=device_id, user_id=user_id).first()
    
    if not device:
        return jsonify({'error': 'Device not found'}), 404
    
    device.is_active = False
    db.session.commit()
    
    return jsonify({'message': 'Device access revoked'})