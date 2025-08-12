from flask import Blueprint, jsonify
from config.extensions import db
from datetime import datetime
import logging

health_bp = Blueprint('health', __name__)
logger = logging.getLogger(__name__)

@health_bp.route('/health', methods=['GET'])
def health_check():
    """Comprehensive health check endpoint"""
    try:
        # Check database connectivity
        db.session.execute('SELECT 1')
        db_status = 'healthy'
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        db_status = 'unhealthy'
    
    # Basic application health
    app_status = 'healthy'
    
    health_data = {
        'status': 'healthy' if db_status == 'healthy' else 'unhealthy',
        'timestamp': datetime.utcnow().isoformat(),
        'services': {
            'database': db_status,
            'application': app_status
        },
        'version': '1.0.0'
    }
    
    status_code = 200 if health_data['status'] == 'healthy' else 503
    return jsonify(health_data), status_code

@health_bp.route('/ready', methods=['GET'])
def readiness_check():
    """Kubernetes readiness probe"""
    try:
        # More thorough checks for readiness
        db.session.execute('SELECT COUNT(*) FROM users LIMIT 1')
        return jsonify({'status': 'ready'}), 200
    except Exception as e:
        logger.error(f"Readiness check failed: {e}")
        return jsonify({'status': 'not ready', 'error': str(e)}), 503

@health_bp.route('/live', methods=['GET'])
def liveness_check():
    """Kubernetes liveness probe"""
    return jsonify({'status': 'alive'}), 200