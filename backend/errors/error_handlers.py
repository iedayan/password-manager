from errors import *
from werkzeug.exceptions import HTTPException
import traceback
from flask import jsonify, current_app


# Custom error handler for APIError
@errors_bp.app_errorhandler(APIError)
def handle_api_error(error):
    """Handle custom API errors"""
    response = {
        "success": False,
        "error": error.error_code or "API_ERROR",
        "message": error.message,
    }

    if error.details:
        response["details"] = error.details

    # Log error in production
    if current_app.config.get("ENV") == "production":
        current_app.logger.error(
            f"API Error: {error.message}",
            extra={
                "error_code": error.error_code,
                "status_code": error.status_code,
                "details": error.details,
            },
        )

    return jsonify(response), error.status_code


# HTTP error handlers
@errors_bp.app_errorhandler(400)
def bad_request(error):
    """Handle 400 Bad Request errors"""
    message = str(error.description) if hasattr(error, "description") else "Bad request"

    return jsonify({"success": False, "error": "BAD_REQUEST", "message": message}), 400


@errors_bp.app_errorhandler(401)
def unauthorized(error):
    """Handle 401 Unauthorized errors"""
    return (
        jsonify(
            {
                "success": False,
                "error": "UNAUTHORIZED",
                "message": "Authentication required",
            }
        ),
        401,
    )


@errors_bp.app_errorhandler(403)
def forbidden(error):
    """Handle 403 Forbidden errors"""
    return (
        jsonify(
            {"success": False, "error": "FORBIDDEN", "message": "Access forbidden"}
        ),
        403,
    )


@errors_bp.app_errorhandler(404)
def not_found(error):
    """Handle 404 Not Found errors"""
    return (
        jsonify(
            {
                "success": False,
                "error": "NOT_FOUND",
                "message": "The requested resource was not found",
            }
        ),
        404,
    )


@errors_bp.app_errorhandler(405)
def method_not_allowed(error):
    """Handle 405 Method Not Allowed errors"""
    return (
        jsonify(
            {
                "success": False,
                "error": "METHOD_NOT_ALLOWED",
                "message": "Method not allowed for this endpoint",
            }
        ),
        405,
    )


@errors_bp.app_errorhandler(422)
def unprocessable_entity(error):
    """Handle 422 Unprocessable Entity errors"""
    return (
        jsonify(
            {
                "success": False,
                "error": "UNPROCESSABLE_ENTITY",
                "message": "The request was well-formed but contains semantic errors",
            }
        ),
        422,
    )


@errors_bp.app_errorhandler(429)
def rate_limit_exceeded(error):
    """Handle 429 Too Many Requests errors"""
    return (
        jsonify(
            {
                "success": False,
                "error": "RATE_LIMIT_EXCEEDED",
                "message": "Rate limit exceeded. Please try again later.",
            }
        ),
        429,
    )


@errors_bp.app_errorhandler(500)
def internal_error(error):
    """Handle 500 Internal Server Error"""
    # Log the full traceback for debugging
    if current_app.config.get("DEBUG"):
        current_app.logger.error("Internal Server Error", exc_info=True)
        return (
            jsonify(
                {
                    "success": False,
                    "error": "INTERNAL_SERVER_ERROR",
                    "message": "An unexpected error occurred",
                    "traceback": traceback.format_exc(),  # Only in debug mode
                }
            ),
            500,
        )
    else:
        current_app.logger.error("Internal Server Error", exc_info=True)
        return (
            jsonify(
                {
                    "success": False,
                    "error": "INTERNAL_SERVER_ERROR",
                    "message": "An unexpected error occurred",
                }
            ),
            500,
        )


@errors_bp.app_errorhandler(503)
def service_unavailable(error):
    """Handle 503 Service Unavailable errors"""
    return (
        jsonify(
            {
                "success": False,
                "error": "SERVICE_UNAVAILABLE",
                "message": "Service temporarily unavailable",
            }
        ),
        503,
    )


# Generic handler for all HTTP exceptions
@errors_bp.app_errorhandler(HTTPException)
def handle_http_exception(error):
    """Handle any other HTTP exceptions not specifically handled"""
    return (
        jsonify(
            {
                "success": False,
                "error": f"HTTP_{error.code}",
                "message": error.description or f"HTTP {error.code} error occurred",
            }
        ),
        error.code,
    )


# JWT error handlers (if using Flask-JWT-Extended)
def register_jwt_error_handlers(jwt_manager):
    """Register JWT-specific error handlers"""

    @jwt_manager.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return (
            jsonify(
                {
                    "success": False,
                    "error": "TOKEN_EXPIRED",
                    "message": "Token has expired",
                }
            ),
            401,
        )

    @jwt_manager.invalid_token_loader
    def invalid_token_callback(error_string):
        return (
            jsonify(
                {"success": False, "error": "INVALID_TOKEN", "message": "Invalid token"}
            ),
            401,
        )

    @jwt_manager.unauthorized_loader
    def missing_token_callback(error_string):
        return (
            jsonify(
                {
                    "success": False,
                    "error": "MISSING_TOKEN",
                    "message": "Authorization token is required",
                }
            ),
            401,
        )

    @jwt_manager.needs_fresh_token_loader
    def token_not_fresh_callback(jwt_header, jwt_payload):
        return (
            jsonify(
                {
                    "success": False,
                    "error": "FRESH_TOKEN_REQUIRED",
                    "message": "Fresh token required",
                }
            ),
            401,
        )

    @jwt_manager.revoked_token_loader
    def revoked_token_callback(jwt_header, jwt_payload):
        return (
            jsonify(
                {
                    "success": False,
                    "error": "TOKEN_REVOKED",
                    "message": "Token has been revoked",
                }
            ),
            401,
        )


def init_error_handlers(app):
    """Initialize error handlers for the Flask app"""
    # Register the errors blueprint
    app.register_blueprint(errors_bp)

    # If using Flask-JWT-Extended, register JWT error handlers
    try:
        from flask_jwt_extended import JWTManager

        jwt = app.extensions.get("flask-jwt-extended")
        if jwt:
            register_jwt_error_handlers(jwt)
    except ImportError:
        pass  # JWT extension not installed

    return app
