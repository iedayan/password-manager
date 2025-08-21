from functools import wraps
from flask import request, jsonify, current_app
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
import time
import os
from collections import defaultdict, deque
from datetime import datetime, timedelta
import logging

security_logger = logging.getLogger("security")

from ...core.redis_client import redis_client

# Rate limiting with Redis support and fallback
request_counts = defaultdict(list)  # Fallback
failed_attempts = defaultdict(int)  # Fallback
blocked_ips = {}  # Fallback

# Configuration constants
BLOCK_DURATION_HOURS = int(os.environ.get('BLOCK_DURATION_HOURS', 1))
ATTACK_PATTERNS = os.environ.get('ATTACK_PATTERNS', 'sqlmap,nikto,nmap').split(',')
MAX_REQUEST_HISTORY = 1000  # Prevent memory bloat


def rate_limit(max_requests=100, window_minutes=60):
    """Advanced rate limiting decorator"""

    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            client_ip = request.environ.get("HTTP_X_FORWARDED_FOR", request.remote_addr)
            # Sanitize IP for logging
            client_ip = str(client_ip).replace("\n", "").replace("\r", "")[:45] if client_ip else "unknown"

            # Check if IP is blocked
            if client_ip in blocked_ips:
                if datetime.utcnow() < blocked_ips[client_ip]:
                    security_logger.warning(f"Blocked IP attempted access: {client_ip}")
                    return jsonify({"error": "IP temporarily blocked"}), 429
                else:
                    del blocked_ips[client_ip]

            # Clean old requests and limit memory usage
            cutoff_time = time.time() - (window_minutes * 60)
            recent_requests = [req_time for req_time in request_counts[client_ip] if req_time > cutoff_time]
            # Limit memory usage
            if len(recent_requests) > MAX_REQUEST_HISTORY:
                recent_requests = recent_requests[-MAX_REQUEST_HISTORY:]
            request_counts[client_ip] = recent_requests

            # Check rate limit
            if len(request_counts[client_ip]) >= max_requests:
                # Block IP for configured duration
                blocked_ips[client_ip] = datetime.utcnow() + timedelta(hours=BLOCK_DURATION_HOURS)
                security_logger.warning(
                    f"IP blocked for rate limit violation: {client_ip}"
                )
                return jsonify({"error": "Rate limit exceeded. IP blocked."}), 429

            # Record request
            request_counts[client_ip].append(time.time())

            return f(*args, **kwargs)

        return decorated_function

    return decorator


def require_master_key(f):
    """Decorator to require master key verification for sensitive operations"""

    @wraps(f)
    def decorated_function(*args, **kwargs):
        verify_jwt_in_request()
        user_id = get_jwt_identity()

        try:
            data = request.get_json()
            if not data or "master_key" not in data:
                security_logger.warning(
                    f"Master key required but not provided - User: {user_id}"
                )
                return jsonify({"error": "Master key required"}), 401
        except Exception:
            security_logger.warning(f"Invalid JSON in master key request - User: {user_id}")
            return jsonify({"error": "Invalid request format"}), 400

        # Verify master key in the route handler
        return f(*args, **kwargs)

    return decorated_function


def log_sensitive_operation(operation_type):
    """Decorator to log sensitive operations"""

    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            client_ip = request.environ.get("HTTP_X_FORWARDED_FOR", request.remote_addr)
            # Sanitize IP for logging
            client_ip = str(client_ip).replace("\n", "").replace("\r", "")[:45] if client_ip else "unknown"

            security_logger.info(
                f"SENSITIVE_OPERATION: {operation_type} - "
                f"User: {user_id}, IP: {client_ip}, "
                f"Endpoint: {request.endpoint}"
            )

            try:
                result = f(*args, **kwargs)
            except Exception as e:
                security_logger.error(
                    f"OPERATION_EXCEPTION: {operation_type} - "
                    f"User: {user_id}, Error: Operation failed"
                )
                raise

            # Log success/failure based on response
            if hasattr(result, "status_code") and result.status_code >= 400:
                security_logger.warning(
                    f"OPERATION_FAILED: {operation_type} - "
                    f"User: {user_id}, Status: {result.status_code}"
                )
            else:
                security_logger.info(
                    f"OPERATION_SUCCESS: {operation_type} - User: {user_id}"
                )

            return result

        return decorated_function

    return decorator


def validate_request_integrity(f):
    """Validate request integrity and detect tampering"""

    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Check for common attack patterns
        user_agent = request.headers.get("User-Agent", "")
        if any(
            pattern.strip().lower() in user_agent.lower() for pattern in ATTACK_PATTERNS
        ):
            # Sanitize user agent for logging to prevent log injection
            sanitized_ua = (
                user_agent.replace("\n", "").replace("\r", "").replace("\t", " ")[:200]
            )
            security_logger.warning(f"Suspicious user agent detected: {sanitized_ua}")
            return jsonify({"error": "Request blocked"}), 403

        # Validate content type for POST/PUT requests
        if request.method in ["POST", "PUT"]:
            if not request.content_type or "application/json" not in request.content_type:
                return jsonify({"error": "Content-Type must be application/json"}), 400
            
            # Check content length
            if request.content_length and request.content_length > 1024 * 1024:  # 1MB limit
                return jsonify({"error": "Request too large"}), 413

        return f(*args, **kwargs)

    return decorated_function


class SecurityHeaders:
    """Add security headers to responses"""

    @staticmethod
    def init_app(app):
        @app.after_request
        def add_security_headers(response):
            # Prevent clickjacking
            response.headers["X-Frame-Options"] = "DENY"

            # Prevent MIME type sniffing
            response.headers["X-Content-Type-Options"] = "nosniff"

            # XSS protection
            response.headers["X-XSS-Protection"] = "1; mode=block"

            # Strict transport security (HTTPS only)
            if request.is_secure:
                response.headers["Strict-Transport-Security"] = (
                    "max-age=31536000; includeSubDomains"
                )

            # Content Security Policy
            response.headers["Content-Security-Policy"] = (
                "default-src 'self'; "
                "script-src 'self'; "
                "style-src 'self'; "
                "img-src 'self' data: https:; "
                "connect-src 'self'"
            )

            # Referrer policy
            response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

            return response
