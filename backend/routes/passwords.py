from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

# Import service instances, not classes
from services.password_service import password_service
from utils.validators import validate_password_data
from utils.decorators import handle_exceptions

passwords_bp = Blueprint("passwords", __name__)


@passwords_bp.route("/passwords", methods=["GET"])
@jwt_required()
@handle_exceptions
def get_passwords():
    """Get all passwords for the authenticated user"""
    user_id = get_jwt_identity()

    # Optional query parameters
    include_compromised = (
        request.args.get("include_compromised", "true").lower() == "true"
    )

    passwords = password_service.get_all_passwords(user_id, include_compromised)
    return jsonify({"success": True, "data": passwords, "count": len(passwords)})


@passwords_bp.route("/passwords", methods=["POST"])
@jwt_required()
@handle_exceptions
def create_password():
    """Create a new password entry"""
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data:
        return jsonify({"success": False, "error": "No data provided"}), 400

    # Validate required fields
    if not validate_password_data(data):
        return jsonify({"success": False, "error": "Invalid password data"}), 400

    password_entry = password_service.create_password_entry(user_id, data)
    return (
        jsonify(
            {
                "success": True,
                "data": password_entry,
                "message": "Password created successfully",
            }
        ),
        201,
    )


@passwords_bp.route("/passwords/<int:password_id>", methods=["GET"])
@jwt_required()
@handle_exceptions
def get_password(password_id):
    """Get a specific password by ID"""
    user_id = get_jwt_identity()

    password = password_service.get_password_by_id(password_id, user_id)
    if not password:
        return jsonify({"success": False, "error": "Password not found"}), 404

    return jsonify({"success": True, "data": password})


@passwords_bp.route("/passwords/<int:password_id>", methods=["PUT"])
@jwt_required()
@handle_exceptions
def update_password(password_id):
    """Update a specific password entry"""
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data:
        return jsonify({"success": False, "error": "No data provided"}), 400

    password_entry = password_service.update_password_entry(password_id, user_id, data)
    return jsonify(
        {
            "success": True,
            "data": password_entry,
            "message": "Password updated successfully",
        }
    )


@passwords_bp.route("/passwords/<int:password_id>", methods=["DELETE"])
@jwt_required()
@handle_exceptions
def delete_password(password_id):
    """Delete a specific password entry"""
    user_id = get_jwt_identity()

    success = password_service.delete_password_entry(password_id, user_id)
    if not success:
        return jsonify({"success": False, "error": "Password not found"}), 404

    return jsonify({"success": True, "message": "Password deleted successfully"})


@passwords_bp.route("/passwords/duplicates", methods=["GET"])
@jwt_required()
@handle_exceptions
def get_duplicate_passwords():
    """Get all duplicate password groups for the user"""
    user_id = get_jwt_identity()

    duplicates = password_service.find_duplicate_passwords(user_id)
    return jsonify({"success": True, "data": duplicates, "count": len(duplicates)})


@passwords_bp.route("/passwords/update-group", methods=["PUT"])
@jwt_required()
@handle_exceptions
def update_password_group():
    """Update all passwords in a reused password group"""
    user_id = get_jwt_identity()
    data = request.get_json()

    # Validate required fields
    required_fields = ["group_id", "new_password"]
    if not data or not all(field in data for field in required_fields):
        return (
            jsonify(
                {
                    "success": False,
                    "error": "Missing required fields: group_id, new_password",
                }
            ),
            400,
        )

    # Optional: specific entries to update
    selected_entries = data.get("selected_entries")  # List of entry IDs

    result = password_service.update_reused_passwords(
        user_id=user_id,
        group_id=data["group_id"],
        new_password=data["new_password"],
        selected_entries=selected_entries,
    )

    return jsonify(result)


@passwords_bp.route("/passwords/mark-compromised", methods=["PUT"])
@jwt_required()
@handle_exceptions
def mark_passwords_compromised():
    """Mark passwords as compromised"""
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data or "password_ids" not in data:
        return (
            jsonify(
                {"success": False, "error": "Missing required field: password_ids"}
            ),
            400,
        )

    result = password_service.mark_passwords_compromised(user_id, data["password_ids"])

    return jsonify(result)


@passwords_bp.route("/passwords/statistics", methods=["GET"])
@jwt_required()
@handle_exceptions
def get_password_statistics():
    """Get password statistics and security score for the user"""
    user_id = get_jwt_identity()

    stats = password_service.get_password_statistics(user_id)
    return jsonify({"success": True, "data": stats})


@passwords_bp.route("/passwords/search", methods=["GET"])
@jwt_required()
@handle_exceptions
def search_passwords():
    """Search passwords by site domain or username"""
    user_id = get_jwt_identity()
    query = request.args.get("q", "").strip()

    if not query:
        return jsonify({"success": False, "error": "Search query is required"}), 400

    # Get all passwords and filter on the client side for now
    # In production, you might want to implement server-side search
    all_passwords = password_service.get_all_passwords(user_id)

    # Simple search in site domain and username
    filtered_passwords = [
        password
        for password in all_passwords
        if query.lower() in password["site"]["domain"].lower()
        or query.lower() in password["username"].lower()
    ]

    return jsonify(
        {
            "success": True,
            "data": filtered_passwords,
            "count": len(filtered_passwords),
            "query": query,
        }
    )
