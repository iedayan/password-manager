"""Password management API endpoints."""

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timezone
from pydantic import ValidationError
from sqlalchemy import or_
import secrets
import string
import re

from ...models.password import Password
from ...models.user import User
from ...core.database import db
from ...core.extensions import bcrypt, limiter
from ...services.encryption_service import encryption_service
from ...services.password_strength import calculate_password_strength
from ...schemas.password import PasswordCreate, PasswordUpdate, PasswordResponse

passwords_bp = Blueprint("passwords", __name__)


# ============================================================================
# BASIC CRUD OPERATIONS
# ============================================================================


@passwords_bp.route("", methods=["GET"])
@jwt_required()
def get_passwords():
    """Get all passwords for the authenticated user."""
    try:
        user_id = int(get_jwt_identity())
        passwords = (
            Password.query.filter_by(user_id=user_id).order_by(Password.site_name).all()
        )

        return (
            jsonify(
                {
                    "passwords": [
                        PasswordResponse.model_validate(p).model_dump()
                        for p in passwords
                    ],
                    "count": len(passwords),
                }
            ),
            200,
        )

    except Exception as e:
        current_app.logger.error(
            f"Error fetching passwords for user {get_jwt_identity()}: {str(e)}"
        )
        return jsonify({"error": "Failed to fetch passwords"}), 500


@passwords_bp.route("/<int:password_id>", methods=["GET"])
@jwt_required()
def get_password(password_id):
    """Get individual password details (without decryption)."""
    try:
        user_id = int(get_jwt_identity())
        password = Password.query.filter_by(id=password_id, user_id=user_id).first()

        if not password:
            return jsonify({"error": "Password not found"}), 404

        return jsonify(PasswordResponse.model_validate(password).model_dump()), 200

    except Exception as e:
        current_app.logger.error(
            f"Error fetching password {int(password_id)}: {str(e)}"
        )
        return jsonify({"error": "Failed to fetch password"}), 500


@passwords_bp.route("", methods=["POST"])
@jwt_required()
@limiter.limit("20 per minute")
def add_password():
    """Add a new password entry."""
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json(force=True)

        if not data:
            return jsonify({"error": "Invalid JSON data"}), 400

        # Validate input using Pydantic
        try:
            password_data = PasswordCreate(**data)
        except ValidationError as e:
            return jsonify({"error": str(e)}), 400

        # Encrypt password
        encrypted_password = encryption_service.encrypt(password_data.password)

        # Create password entry
        password = Password(
            user_id=user_id,
            site_name=password_data.site_name,
            site_url=str(password_data.site_url) if password_data.site_url else None,
            username=password_data.username,
            encrypted_password=encrypted_password,
            notes=password_data.notes,
        )

        db.session.add(password)
        db.session.commit()

        sanitized_name = "".join(
            c for c in password_data.site_name if c.isprintable() and c not in "\n\r\t"
        )
        current_app.logger.info(
            f"Password added for user {user_id}: {sanitized_name[:50]}"
        )

        return (
            jsonify(
                {
                    "message": "Password added successfully",
                    "password": PasswordResponse.model_validate(password).model_dump(),
                }
            ),
            201,
        )

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(
            f"Error adding password for user {get_jwt_identity()}: {str(e)}"
        )
        return jsonify({"error": "Failed to add password"}), 500


@passwords_bp.route("/<int:password_id>", methods=["PUT"])
@jwt_required()
@limiter.limit("30 per minute")
def update_password(password_id):
    """Update an existing password."""
    try:
        user_id = int(get_jwt_identity())
        password = Password.query.filter_by(id=password_id, user_id=user_id).first()

        if not password:
            return jsonify({"error": "Password not found"}), 404

        data = request.get_json(force=True)
        if not data:
            return jsonify({"error": "Invalid JSON data"}), 400

        # Validate input using Pydantic
        try:
            update_data = PasswordUpdate(**data)
        except ValidationError as e:
            return jsonify({"error": str(e)}), 400

        # Update fields
        if update_data.site_name is not None:
            password.site_name = update_data.site_name
        if update_data.site_url is not None:
            password.site_url = (
                str(update_data.site_url) if update_data.site_url else None
            )
        if update_data.username is not None:
            password.username = update_data.username
        if update_data.password is not None:
            password.encrypted_password = encryption_service.encrypt(
                update_data.password
            )
        if update_data.notes is not None:
            password.notes = update_data.notes

        password.updated_at = datetime.now(timezone.utc)
        db.session.commit()

        return (
            jsonify(
                {
                    "message": "Password updated successfully",
                    "password": PasswordResponse.model_validate(password).model_dump(),
                }
            ),
            200,
        )

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(
            f"Error updating password {int(password_id)}: {str(e)}"
        )
        return jsonify({"error": "Failed to update password"}), 500


@passwords_bp.route("/<int:password_id>", methods=["DELETE"])
@jwt_required()
@limiter.limit("10 per minute")
def delete_password(password_id):
    """Delete a password."""
    try:
        user_id = int(get_jwt_identity())
        password = Password.query.filter_by(id=password_id, user_id=user_id).first()

        if not password:
            return jsonify({"error": "Password not found"}), 404

        db.session.delete(password)
        db.session.commit()

        sanitized_name = "".join(
            c for c in password.site_name if c.isprintable() and c not in "\n\r\t"
        )
        current_app.logger.info(
            f"Password deleted for user {user_id}: {sanitized_name[:50]}"
        )

        return jsonify({"message": "Password deleted successfully"}), 200

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error deleting password {password_id}: {str(e)}")
        return jsonify({"error": "Failed to delete password"}), 500


# ============================================================================
# SEARCH & FILTERING
# ============================================================================


@passwords_bp.route("/search", methods=["GET"])
@jwt_required()
def search_passwords():
    """Search passwords by site name, username, or URL."""
    try:
        user_id = int(get_jwt_identity())
        query = request.args.get("q", "").strip()

        if not query:
            return jsonify({"error": "Search query required"}), 400

        passwords = (
            Password.query.filter(
                Password.user_id == user_id,
                or_(
                    Password.site_name.ilike(f"%{query}%"),
                    Password.username.ilike(f"%{query}%"),
                    Password.site_url.ilike(f"%{query}%"),
                ),
            )
            .order_by(Password.site_name)
            .all()
        )

        return (
            jsonify(
                {
                    "passwords": [
                        PasswordResponse.model_validate(p).model_dump()
                        for p in passwords
                    ],
                    "count": len(passwords),
                    "query": query,
                }
            ),
            200,
        )

    except Exception as e:
        current_app.logger.error(f"Error searching passwords: {str(e).replace(chr(10), ' ').replace(chr(13), ' ')[:200]}")
        return jsonify({"error": "Search failed"}), 500


# ============================================================================
# BULK OPERATIONS
# ============================================================================


@passwords_bp.route("/bulk", methods=["POST"])
@jwt_required()
@limiter.limit("5 per minute")
def bulk_operations():
    """Handle bulk operations: import, export, bulk delete."""
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json(force=True)

        if not data or "operation" not in data:
            return jsonify({"error": "Operation type required"}), 400

        operation = data["operation"]

        if operation == "export":
            passwords = Password.query.filter_by(user_id=user_id).all()
            return (
                jsonify(
                    {
                        "passwords": [
                            PasswordResponse.model_validate(p).model_dump()
                            for p in passwords
                        ],
                        "exported_at": datetime.now(timezone.utc).isoformat(),
                    }
                ),
                200,
            )

        elif operation == "import":
            if "passwords" not in data:
                return jsonify({"error": "Passwords data required"}), 400

            imported_count = 0
            for pwd_data in data["passwords"]:
                try:
                    password_data = PasswordCreate(**pwd_data)
                    password = Password(
                        user_id=user_id,
                        site_name=password_data.site_name,
                        site_url=(
                            str(password_data.site_url)
                            if password_data.site_url
                            else None
                        ),
                        username=password_data.username,
                        encrypted_password=encryption_service.encrypt(
                            password_data.password
                        ),
                        notes=password_data.notes,
                    )
                    db.session.add(password)
                    imported_count += 1
                except Exception:
                    continue

            db.session.commit()
            return jsonify({"message": f"Imported {imported_count} passwords"}), 201

        elif operation == "delete":
            if "password_ids" not in data:
                return jsonify({"error": "Password IDs required"}), 400

            deleted_count = Password.query.filter(
                Password.user_id == user_id, Password.id.in_(data["password_ids"])
            ).delete(synchronize_session=False)

            db.session.commit()
            return jsonify({"message": f"Deleted {deleted_count} passwords"}), 200

        return jsonify({"error": "Invalid operation"}), 400

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error in bulk operation: {str(e)}")
        return jsonify({"error": "Bulk operation failed"}), 500


# ============================================================================
# SECURITY & ENCRYPTION
# ============================================================================


@passwords_bp.route("/<int:password_id>/decrypt", methods=["POST"])
@jwt_required()
@limiter.limit("50 per minute")
def decrypt_password(password_id):
    """Decrypt a password with master password verification."""
    try:
        user_id = int(get_jwt_identity())

        # Find password entry
        password = Password.query.filter_by(id=password_id, user_id=user_id).first()
        if not password:
            return jsonify({"error": "Password not found"}), 404

        # Validate request data
        data = request.get_json(force=True)
        if not data:
            return jsonify({"error": "Invalid JSON data"}), 400

        master_password = data.get("master_password")
        if not master_password:
            return jsonify({"error": "Master password is required"}), 400

        # Verify master password
        user = User.query.get(user_id)
        if not user or not bcrypt.check_password_hash(
            user.password_hash, master_password
        ):
            current_app.logger.warning(
                f"Invalid master password attempt for user {int(user_id)}"
            )
            return jsonify({"error": "Invalid master password"}), 401

        # Decrypt password
        decrypted_password = encryption_service.decrypt(password.encrypted_password)

        sanitized_name = "".join(
            c for c in password.site_name if c.isprintable() and c not in "\n\r\t"
        )
        current_app.logger.info(
            f"Password decrypted for user {user_id}: {sanitized_name[:50]}"
        )

        return (
            jsonify(
                {
                    "password": decrypted_password,
                    "site_name": password.site_name,
                    "username": password.username,
                }
            ),
            200,
        )

    except Exception as e:
        current_app.logger.error(f"Error decrypting password {password_id}: {str(e)}")
        return jsonify({"error": "Failed to decrypt password"}), 500


@passwords_bp.route("/analyze", methods=["GET"])
@jwt_required()
def analyze_passwords():
    """Analyze password strength and security issues."""
    try:
        user_id = int(get_jwt_identity())
        passwords = Password.query.filter_by(user_id=user_id).all()

        weak_passwords = []
        duplicate_passwords = {}

        for password in passwords:
            try:
                decrypted = encryption_service.decrypt(password.encrypted_password)
                strength = calculate_password_strength(decrypted)

                if strength < 60:
                    weak_passwords.append(
                        {
                            "id": password.id,
                            "site_name": password.site_name,
                            "strength": strength,
                        }
                    )

                if decrypted in duplicate_passwords:
                    duplicate_passwords[decrypted].append(password.site_name)
                else:
                    duplicate_passwords[decrypted] = [password.site_name]

            except Exception:
                continue

        duplicates = {
            sites[0]: sites for sites in duplicate_passwords.values() if len(sites) > 1
        }

        return (
            jsonify(
                {
                    "weak_passwords": weak_passwords,
                    "duplicate_count": len(duplicates),
                    "duplicates": list(duplicates.values()),
                    "total_passwords": len(passwords),
                    "analysis_date": datetime.now(timezone.utc).isoformat(),
                }
            ),
            200,
        )

    except Exception as e:
        current_app.logger.error(f"Error analyzing passwords: {str(e)}")
        return jsonify({"error": "Analysis failed"}), 500


# ============================================================================
# PASSWORD GENERATION
# ============================================================================


@passwords_bp.route("/generate", methods=["POST"])
@jwt_required()
@limiter.limit("30 per minute")
def generate_password():
    """Generate secure password with custom rules."""
    try:
        data = request.get_json() or {}
        length = min(max(data.get("length", 16), 8), 128)
        include_uppercase = data.get("uppercase", True)
        include_lowercase = data.get("lowercase", True)
        include_numbers = data.get("numbers", True)
        include_symbols = data.get("symbols", True)

        charset = ""
        if include_lowercase:
            charset += string.ascii_lowercase
        if include_uppercase:
            charset += string.ascii_uppercase
        if include_numbers:
            charset += string.digits
        if include_symbols:
            charset += "!@#$%^&*()_+-=[]{}|;:,.<>?"

        if not charset:
            return (
                jsonify({"error": "At least one character type must be selected"}),
                400,
            )

        password = "".join(secrets.choice(charset) for _ in range(length))
        strength = calculate_password_strength(password)

        return (
            jsonify({"password": password, "strength": strength, "length": length}),
            200,
        )

    except Exception as e:
        current_app.logger.error(f"Error generating password: {str(e).replace(chr(10), ' ').replace(chr(13), ' ')[:200]}")
        return jsonify({"error": "Password generation failed"}), 500



