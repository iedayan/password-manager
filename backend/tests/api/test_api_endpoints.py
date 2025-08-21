import pytest
import json
from ...models.user import User
from ...models.password import Password
from ...core.database import db


class TestAPIEndpoints:
    """Test core API endpoints"""

    def test_health_endpoint(self, client):
        """Test health check endpoint"""
        response = client.get('/api/v1/health/status')
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert data['status'] == 'healthy'
        assert 'timestamp' in data

    def test_auth_register_success(self, client):
        """Test successful user registration"""
        user_data = {
            'email': 'newuser@example.com',
            'password': 'SecurePassword123!'
        }
        
        response = client.post('/api/v1/auth/register', json=user_data)
        assert response.status_code == 201
        
        data = json.loads(response.data)
        assert 'access_token' in data
        assert data['user']['email'] == 'newuser@example.com'

    def test_auth_register_duplicate_email(self, client, app):
        """Test registration with duplicate email"""
        with app.app_context():
            # Create existing user
            user = User(email='existing@example.com', password_hash='hash')
            db.session.add(user)
            db.session.commit()

        user_data = {
            'email': 'existing@example.com',
            'password': 'SecurePassword123!'
        }
        
        response = client.post('/api/v1/auth/register', json=user_data)
        assert response.status_code == 400

    def test_auth_login_success(self, client, app):
        """Test successful login"""
        with app.app_context():
            from lok_backend.core.extensions import bcrypt
            password_hash = bcrypt.generate_password_hash('SecurePassword123!').decode('utf-8')
            user = User(email='test@example.com', password_hash=password_hash)
            db.session.add(user)
            db.session.commit()

        login_data = {
            'email': 'test@example.com',
            'password': 'SecurePassword123!'
        }
        
        response = client.post('/api/v1/auth/login', json=login_data)
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert 'access_token' in data
        assert data['user']['email'] == 'test@example.com'

    def test_auth_login_invalid_credentials(self, client, app):
        """Test login with invalid credentials"""
        with app.app_context():
            from lok_backend.core.extensions import bcrypt
            password_hash = bcrypt.generate_password_hash('SecurePassword123!').decode('utf-8')
            user = User(email='test@example.com', password_hash=password_hash)
            db.session.add(user)
            db.session.commit()

        login_data = {
            'email': 'test@example.com',
            'password': 'WrongPassword'
        }
        
        response = client.post('/api/v1/auth/login', json=login_data)
        assert response.status_code == 401

    def test_passwords_crud(self, client, app, auth_headers):
        """Test password CRUD operations"""
        # Create password
        password_data = {
            'site_name': 'Example Site',
            'site_url': 'https://example.com',
            'username': 'testuser',
            'password': 'encrypted_password_data'
        }
        
        response = client.post('/api/v1/passwords', 
                             json=password_data, 
                             headers=auth_headers)
        assert response.status_code == 201
        
        data = json.loads(response.data)
        password_id = data['id']
        assert data['site_name'] == 'Example Site'

        # Get passwords
        response = client.get('/api/v1/passwords', headers=auth_headers)
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert len(data) >= 1

        # Update password
        update_data = {'site_name': 'Updated Site'}
        response = client.put(f'/api/v1/passwords/{password_id}', 
                            json=update_data, 
                            headers=auth_headers)
        assert response.status_code == 200

        # Delete password
        response = client.delete(f'/api/v1/passwords/{password_id}', 
                               headers=auth_headers)
        assert response.status_code == 200

    def test_unauthorized_access(self, client):
        """Test unauthorized access to protected endpoints"""
        response = client.get('/api/v1/passwords')
        assert response.status_code == 401

        response = client.post('/api/v1/passwords', json={})
        assert response.status_code == 401

    def test_security_analysis(self, client, auth_headers):
        """Test security analysis endpoint"""
        response = client.get('/api/v1/security/analysis', headers=auth_headers)
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert 'password_strength' in data
        assert 'security_score' in data
        assert 'recommendations' in data