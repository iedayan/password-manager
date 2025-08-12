import logging
import logging.handlers
import os
from datetime import datetime

def setup_logging(app):
    """Configure comprehensive logging for security and monitoring"""
    
    # Create logs directory if it doesn't exist
    log_dir = os.path.join(os.path.dirname(app.root_path), 'logs')
    os.makedirs(log_dir, exist_ok=True)
    
    # Configure root logger
    log_level = getattr(logging, app.config.get('LOG_LEVEL', 'INFO').upper())
    logging.basicConfig(level=log_level)
    
    # Security events logger
    security_logger = logging.getLogger('security')
    security_handler = logging.handlers.RotatingFileHandler(
        os.path.join(log_dir, 'security.log'),
        maxBytes=10*1024*1024,  # 10MB
        backupCount=5
    )
    security_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    security_handler.setFormatter(security_formatter)
    security_logger.addHandler(security_handler)
    security_logger.setLevel(logging.INFO)
    
    # Application logger
    app_handler = logging.handlers.RotatingFileHandler(
        os.path.join(log_dir, 'app.log'),
        maxBytes=10*1024*1024,
        backupCount=5
    )
    app_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(funcName)s:%(lineno)d - %(message)s'
    )
    app_handler.setFormatter(app_formatter)
    app.logger.addHandler(app_handler)
    app.logger.setLevel(log_level)
    
    # Error logger for critical issues
    error_handler = logging.handlers.RotatingFileHandler(
        os.path.join(log_dir, 'errors.log'),
        maxBytes=10*1024*1024,
        backupCount=10
    )
    error_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(pathname)s:%(lineno)d - %(message)s'
    )
    error_handler.setFormatter(error_formatter)
    error_handler.setLevel(logging.ERROR)
    
    # Add error handler to root logger
    logging.getLogger().addHandler(error_handler)
    
    return {
        'security': security_logger,
        'app': app.logger,
        'error': logging.getLogger('error')
    }

def log_security_event(event_type, user_id=None, ip_address=None, details=None):
    """Log security-related events"""
    security_logger = logging.getLogger('security')
    
    event_data = {
        'timestamp': datetime.utcnow().isoformat(),
        'event_type': event_type,
        'user_id': user_id,
        'ip_address': ip_address,
        'details': details or {}
    }
    
    security_logger.info(f"SECURITY_EVENT: {event_data}")