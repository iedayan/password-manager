"""Initialize database tables."""

from lok_backend.app import create_app
from lok_backend.core.database import db

def init_database():
    """Create all database tables."""
    app = create_app('production')
    with app.app_context():
        db.create_all()
        print("✅ Database tables created successfully!")

if __name__ == '__main__':
    init_database()