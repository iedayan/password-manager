import pytest
import tempfile
import os
from lok_backend.app import create_app
from lok_backend.core.database import db
from lok_backend.models.user import User
from lok_backend.core.extensions import bcrypt


@pytest.fixture
def app():
    """Create application for testing"""
    # Create temporary database
    db_fd, db_path = tempfile.mkstemp()
    
    app = create_app('testing')
    app.config.update({
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': f'sqlite:///{db_path}',
        'WTF_CSRF_ENABLED': False,
        'JWT_SECRET_KEY': 'test-secret-key'
    })
    
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()
    
    os.close(db_fd)
    os.unlink(db_path)


@pytest.fixture
def client(app):
    """Create test client"""
    return app.test_client()


@pytest.fixture
def runner(app):
    """Create test CLI runner"""
    return app.test_cli_runner()


@pytest.fixture
def test_user(app):
    """Create test user"""
    with app.app_context():
        password_hash = bcrypt.generate_password_hash('testpassword123').decode('utf-8')
        user = User(
            email='testuser@example.com',
            password_hash=password_hash,
            is_active=True,
            email_verified=True
        )
        db.session.add(user)
        db.session.commit()
        return user


@pytest.fixture
def auth_headers(client, app):
    """Get authentication headers for test requests"""
    with app.app_context():
        # Create test user
        password_hash = bcrypt.generate_password_hash('testpassword123').decode('utf-8')
        user = User(
            email='authuser@example.com',
            password_hash=password_hash,
            is_active=True,
            email_verified=True
        )
        db.session.add(user)
        db.session.commit()
    
    # Login to get token
    response = client.post('/api/v1/auth/login', json={
        'email': 'authuser@example.com',
        'password': 'testpassword123'
    })
    
    if response.status_code == 200:
        import json
        data = json.loads(response.data)
        token = data['access_token']
        return {'Authorization': f'Bearer {token}'}
    else:
        # Return empty headers if login fails
        return {}


@pytest.fixture
def early_bird_user(app):
    """Create user with early bird access"""
    with app.app_context():
        user = User(
            email='earlybird@example.com',
            password_hash='hash',
            early_bird_access=True
        )
        db.session.add(user)
        db.session.commit()
        return user


@pytest.fixture
def multiple_users(app):
    """Create multiple test users"""
    with app.app_context():
        users = []
        for i in range(5):
            user = User(
                email=f'user{i}@example.com',
                password_hash=f'hash{i}',
                early_bird_access=(i < 3)  # First 3 have early bird access
            )
            users.append(user)
        
        db.session.add_all(users)
        db.session.commit()
        return users