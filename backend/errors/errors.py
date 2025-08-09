"""
Error handlers for the Flask application
"""

from flask import Blueprint


errors_bp = Blueprint("errors", __name__)


class APIError(Exception):
    """Custom API error class for consistent error responses"""

    def __init__(self, message, status_code=400, error_code=None, details=None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.error_code = error_code
        self.details = details or {}


class ValidationError(APIError):
    """Error for validation failures"""

    def __init__(self, message, details=None):
        super().__init__(
            message, status_code=400, error_code="VALIDATION_ERROR", details=details
        )


class NotFoundError(APIError):
    """Error for resource not found"""

    def __init__(self, message="Resource not found"):
        super().__init__(message, status_code=404, error_code="NOT_FOUND")


class UnauthorizedError(APIError):
    """Error for unauthorized access"""

    def __init__(self, message="Unauthorized access"):
        super().__init__(message, status_code=401, error_code="UNAUTHORIZED")


class ForbiddenError(APIError):
    """Error for forbidden access"""

    def __init__(self, message="Access forbidden"):
        super().__init__(message, status_code=403, error_code="FORBIDDEN")


class EncryptionError(APIError):
    """Error for encryption/decryption failures"""

    def __init__(self, message="Encryption error occurred"):
        super().__init__(message, status_code=500, error_code="ENCRYPTION_ERROR")


class DatabaseError(APIError):
    """Error for database operations"""

    def __init__(self, message="Database operation failed"):
        super().__init__(message, status_code=500, error_code="DATABASE_ERROR")
