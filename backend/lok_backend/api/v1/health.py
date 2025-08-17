"""Health check API endpoints."""

from flask import Blueprint, jsonify

health_bp = Blueprint('health', __name__)


@health_bp.route('', methods=['GET'])
def health_check():
    """Basic health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'message': 'Lok Password Manager API is running',
        'version': '1.0.0'
    }), 200