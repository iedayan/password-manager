"""Custom exceptions for the application."""


class LokException(Exception):
    """Base exception for Lok Password Manager."""
    pass


class AuthenticationError(LokException):
    """Raised when authentication fails."""
    pass


class AuthorizationError(LokException):
    """Raised when user lacks permission."""
    pass


class ValidationError(LokException):
    """Raised when input validation fails."""
    pass


class EncryptionError(LokException):
    """Raised when encryption/decryption fails."""
    pass


class PasswordStrengthError(ValidationError):
    """Raised when password doesn't meet strength requirements."""
    pass