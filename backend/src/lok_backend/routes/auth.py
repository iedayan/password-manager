"""Authentication routes for user registration and login."""

import re
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token
from sqlalchemy.exc import IntegrityError
from datetime import datetime

from ..models.user import User
from ..config.extensions import db, bcrypt, limiter

auth_bp = Blueprint("auth", __name__)

# Email validation regex
EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')

def validate_email(email: str) -> bool:
    """Validate email format."""
    return bool(email and EMAIL_REGEX.match(email) and len(email) <= 254)

def validate_password(password: str) -> tuple[bool, str]:
    """Validate password strength."""
    if not password or len(password) < 8:
        return False, "Password must be at least 8 characters long"
    if len(password) > 128:
        return False, "Password must be less than 128 characters"
    return True, ""


@auth_bp.route("/register", methods=["POST"])
@limiter.limit("5 per minute")
def register():
    """Register a new user with validation and security checks."""
    try:
        data = request.get_json(force=True)
        if not data:
            return jsonify({"error": "Invalid JSON data"}), 400

        # Input validation
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")
        master_key = data.get("master_key", password)

        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400

        if not validate_email(email):
            return jsonify({"error": "Invalid email format"}), 400

        is_valid, error_msg = validate_password(password)
        if not is_valid:
            return jsonify({"error": error_msg}), 400

        # Check if user exists
        if User.query.filter_by(email=email).first():
            return jsonify({"error": "Email already registered"}), 409

        # Hash passwords securely
        password_hash = bcrypt.generate_password_hash(password).decode("utf-8")
        master_key_hash = bcrypt.generate_password_hash(master_key).decode("utf-8")

        # Create user
        user = User(
            email=email,
            password_hash=password_hash,
            master_key_hash=master_key_hash,
        )

        db.session.add(user)
        db.session.commit()

        # Generate token
        access_token = create_access_token(identity=str(user.id))

        current_app.logger.info(f"User registered successfully: {email}")
        
        return jsonify({
            "access_token": access_token,
            "user_id": user.id,
            "message": "User registered successfully",
        }), 201

    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Email already registered"}), 409
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Registration error: {type(e).__name__}: {str(e)}")
        return jsonify({"error": "Registration failed"}), 500


@auth_bp.route("/login", methods=["POST"])
@limiter.limit("10 per minute")
def login():
    """Authenticate user with security checks and return JWT token."""
    try:
        data = request.get_json(force=True)
        if not data:
            return jsonify({"error": "Invalid JSON data"}), 400

        # Input validation
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")

        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400

        if not validate_email(email):
            return jsonify({"error": "Invalid email format"}), 400

        # Find user
        user = User.query.filter_by(email=email).first()
        
        # Check account lockout
        if user and user.is_locked:
            current_app.logger.warning(f"Login attempt on locked account: {email}")
            return jsonify({"error": "Account temporarily locked"}), 423

        # Verify credentials
        if user and bcrypt.check_password_hash(user.password_hash, password):
            # Reset failed attempts on successful login
            user.reset_failed_login()
            user.last_login = datetime.utcnow()
            db.session.commit()
            
            access_token = create_access_token(identity=str(user.id))
            
            current_app.logger.info(f"Successful login: {email}")
            
            return jsonify({
                "access_token": access_token,
                "user_id": user.id,
                "message": "Login successful",
            }), 200
        
        # Handle failed login
        if user:
            user.increment_failed_login()
            db.session.commit()
            
        current_app.logger.warning(f"Failed login attempt: {email}")
        return jsonify({"error": "Invalid credentials"}), 401

    except Exception as e:
        current_app.logger.error(f"Login error: {type(e).__name__}: {str(e)}")
        return jsonify({"error": "Login failed"}), 500
