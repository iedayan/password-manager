"""Admin API endpoints for database management."""

from flask import Blueprint, jsonify, current_app
from sqlalchemy import text
from ...core.database import db

admin_bp = Blueprint("admin", __name__)

@admin_bp.route("/setup-database", methods=["POST"])
def setup_database():
    """Force database table creation."""
    try:
        # Import all models
        from ...models.user import User
        from ...models.password import Password, PasswordUpdateLog
        from ...models.login_session import LoginSession
        from ...models.device import Device
        
        current_app.logger.info("Creating database tables...")
        
        # Create all tables
        db.create_all()
        
        # Verify tables exist (works for both SQLite and PostgreSQL)
        with db.engine.connect() as conn:
            db_url = str(db.engine.url)
            if 'postgresql' in db_url or 'postgres' in db_url:
                result = conn.execute(text("SELECT tablename FROM pg_tables WHERE schemaname = 'public'"))
            else:
                result = conn.execute(text("SELECT name FROM sqlite_master WHERE type='table'"))
            tables = [row[0] for row in result.fetchall()]
        
        current_app.logger.info(f"Tables created: {tables}")
        
        return jsonify({
            "success": True,
            "message": "Database setup completed",
            "database_type": "PostgreSQL" if 'postgresql' in db_url else "SQLite",
            "tables": tables,
            "count": len(tables)
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Database setup failed: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@admin_bp.route("/database-status", methods=["GET"])
def database_status():
    """Check database connection and table status."""
    try:
        # Test connection and detect database type
        with db.engine.connect() as conn:
            db_url = str(db.engine.url)
            
            # Detect database type
            if 'postgresql' in db_url or 'postgres' in db_url:
                # PostgreSQL queries
                version_result = conn.execute(text("SELECT version()"))
                version = version_result.fetchone()[0]
                tables_result = conn.execute(text("SELECT tablename FROM pg_tables WHERE schemaname = 'public'"))
                tables = [row[0] for row in tables_result.fetchall()]
            else:
                # SQLite queries
                version = "SQLite (not PostgreSQL!)"
                tables_result = conn.execute(text("SELECT name FROM sqlite_master WHERE type='table'"))
                tables = [row[0] for row in tables_result.fetchall()]
            
            # Get table row counts
            table_counts = {}
            for table in tables:
                try:
                    count_result = conn.execute(text(f"SELECT COUNT(*) FROM {table}"))
                    table_counts[table] = count_result.fetchone()[0]
                except Exception as e:
                    table_counts[table] = f"Error: {e}"
        
        return jsonify({
            "success": True,
            "database_type": "PostgreSQL" if 'postgresql' in db_url else "SQLite",
            "database_url": db_url.split('@')[0] + '@***' if '@' in db_url else db_url,
            "database_version": version,
            "tables": tables,
            "table_counts": table_counts,
            "total_tables": len(tables)
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500