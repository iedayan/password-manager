"""Authentication API endpoints."""

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timezone
from pydantic import ValidationError

from ...models.user import User
from ...core.database import db
from ...core.extensions import bcrypt, limiter
from ...schemas.auth import UserRegistration, UserLogin, AuthResponse

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
@limiter.limit("5 per minute")
def register():
    """Register a new user."""
    try:
        data = request.get_json(force=True)
        if not data:
            return jsonify({"error": "Invalid JSON data"}), 400

        # Validate input using Pydantic
        try:
            user_data = UserRegistration(**data)
        except ValidationError as e:
            return jsonify({"error": str(e)}), 400

        # Check if user exists
        if User.query.filter_by(email=user_data.email).first():
            return jsonify({"error": "Email already registered"}), 409

        # Hash password
        password_hash = bcrypt.generate_password_hash(user_data.password).decode("utf-8")

        # Create user
        user = User(
            email=user_data.email,
            password_hash=password_hash,
        )

        db.session.add(user)
        db.session.commit()

        # Generate token
        access_token = create_access_token(identity=str(user.id))

        current_app.logger.info(f"User registered successfully: {user_data.email}")
        
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
    """Authenticate user and return JWT token."""
    try:
        data = request.get_json(force=True)
        if not data:
            return jsonify({"error": "Invalid JSON data"}), 400

        # Validate input using Pydantic
        try:
            login_data = UserLogin(**data)
        except ValidationError as e:
            return jsonify({"error": str(e)}), 400

        # Find user
        user = User.query.filter_by(email=login_data.email).first()
        
        # Check account lockout
        if user and user.is_locked:
            current_app.logger.warning(f"Login attempt on locked account: {login_data.email}")
            return jsonify({"error": "Account temporarily locked"}), 423

        # Verify credentials
        if user and bcrypt.check_password_hash(user.password_hash, login_data.password):
            # Reset failed attempts on successful login
            user.reset_failed_login()
            user.last_login = datetime.now(timezone.utc)
            db.session.commit()
            
            access_token = create_access_token(identity=str(user.id))
            
            current_app.logger.info(f"Successful login: {login_data.email}")
            
            return jsonify({
                "access_token": access_token,
                "user_id": user.id,
                "message": "Login successful",
            }), 200
        
        # Handle failed login
        if user:
            user.increment_failed_login()
            db.session.commit()
            
        current_app.logger.warning(f"Failed login attempt: {login_data.email}")
        return jsonify({"error": "Invalid credentials"}), 401

    except Exception as e:
        current_app.logger.error(f"Login error: {type(e).__name__}: {str(e)}")
        return jsonify({"error": "Login failed"}), 500