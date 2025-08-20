"""Test configuration and fixtures."""

import pytest
import tempfile
import os
from datetime import datetime, timezone

from lok_backend.app import create_app
from lok_backend.core.database import db
from lok_backend.models.user import User
from lok_backend.models.password import Password
from lok_backend.core.extensions import bcrypt
from lok_backend.services.encryption_service import encryption_service


@pytest.fixture
def app():
    """Create test application."""
    # Create temporary database
    db_fd, db_path = tempfile.mkstemp()
    
    app = create_app('testing')
    app.config.update({
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': f'sqlite:///{db_path}',
        'WTF_CSRF_ENABLED': False,
        'SECRET_KEY': 'test-secret-key',
        'JWT_SECRET_KEY': 'test-jwt-secret',
    })
    
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()
    
    os.close(db_fd)
    os.unlink(db_path)


@pytest.fixture
def client(app):
    """Create test client."""
    return app.test_client()


@pytest.fixture
def test_user(app):
    """Create test user."""
    with app.app_context():
        password_hash = bcrypt.generate_password_hash('testpass123').decode('utf-8')
        user = User(
            email='test@example.com',
            password_hash=password_hash,
            is_active=True,
            created_at=datetime.now(timezone.utc)
        )
        db.session.add(user)
        db.session.commit()
        return user


@pytest.fixture
def test_password(app, test_user):
    """Create test password entry."""
    with app.app_context():
        encrypted_password = encryption_service.encrypt('testpassword123')
        password = Password(
            user_id=test_user.id,
            site_name='Test Site',
            site_url='https://testsite.com',
            username='testuser',
            encrypted_password=encrypted_password,
            notes='Test notes',
            created_at=datetime.now(timezone.utc)
        )
        db.session.add(password)
        db.session.commit()
        return password


@pytest.fixture
def auth_headers(client, test_user):
    """Get authentication headers for test user."""
    response = client.post('/api/v1/auth/login', json={
        'email': test_user.email,
        'password': 'testpass123'
    })
    
    token = response.get_json()['access_token']
    return {'Authorization': f'Bearer {token}'}


@pytest.fixture
def multiple_passwords(app, test_user):
    """Create multiple test passwords."""
    with app.app_context():
        passwords = []
        for i in range(5):
            encrypted_password = encryption_service.encrypt(f'password{i}')
            password = Password(
                user_id=test_user.id,
                site_name=f'Site {i}',
                site_url=f'https://site{i}.com',
                username=f'user{i}',
                encrypted_password=encrypted_password,
                created_at=datetime.now(timezone.utc)
            )
            db.session.add(password)
            passwords.append(password)
        
        db.session.commit()
        return passwords