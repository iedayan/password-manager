from flask import Blueprint, jsonify, request
from lok_backend.models.user import User
from lok_backend.core.database import db
from datetime import datetime

early_bird_bp = Blueprint('early_bird', __name__)

EARLY_BIRD_LIMIT = 500

@early_bird_bp.route('/spots-remaining', methods=['GET'])
def get_spots_remaining():
    """Get remaining early bird spots"""
    try:
        # Count users with early_bird_access = True
        early_bird_count = User.query.filter_by(early_bird_access=True).count()
        spots_remaining = max(0, EARLY_BIRD_LIMIT - early_bird_count)
        
        return jsonify({
            'spotsRemaining': spots_remaining,
            'totalSpots': EARLY_BIRD_LIMIT,
            'spotsTaken': early_bird_count
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@early_bird_bp.route('/claim-spot', methods=['POST'])
def claim_early_bird_spot():
    """Claim an early bird spot for a user"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        
        if not user_id:
            return jsonify({'error': 'User ID required'}), 400
            
        # Check if spots are available
        early_bird_count = User.query.filter_by(early_bird_access=True).count()
        if early_bird_count >= EARLY_BIRD_LIMIT:
            return jsonify({'error': 'No early bird spots remaining'}), 400
            
        # Update user with early bird access
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        if user.early_bird_access:
            return jsonify({'error': 'User already has early bird access'}), 400
            
        user.early_bird_access = True
        user.early_bird_claimed_at = datetime.utcnow()
        db.session.commit()
        
        spots_remaining = max(0, EARLY_BIRD_LIMIT - early_bird_count - 1)
        
        return jsonify({
            'success': True,
            'spotsRemaining': spots_remaining,
            'message': 'Early bird spot claimed successfully'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500