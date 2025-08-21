import pytest
import json
from datetime import datetime, timedelta
from lok_backend.models.user import User
from lok_backend.models.password import Password
from lok_backend.core.database import db


class TestSecurityFeatures:
    """Test security-related functionality"""

    def test_rate_limiting(self, client):
        """Test rate limiting on login attempts"""
        login_data = {
            'email': 'test@example.com',
            'password': 'wrongpassword'
        }
        
        # Make multiple rapid requests
        responses = []
        for _ in range(10):
            response = client.post('/api/v1/auth/login', json=login_data)
            responses.append(response.status_code)
        
        # Should eventually get rate limited (429)
        assert 429 in responses

    def test_account_lockout(self, client, app):
        """Test account lockout after failed attempts"""
        with app.app_context():
            from lok_backend.core.extensions import bcrypt
            password_hash = bcrypt.generate_password_hash('correct').decode('utf-8')
            user = User(email='test@example.com', password_hash=password_hash)
            db.session.add(user)
            db.session.commit()
            user_id = user.id

        # Make 5 failed login attempts
        for _ in range(5):
            response = client.post('/api/v1/auth/login', json={
                'email': 'test@example.com',
                'password': 'wrong'
            })
            assert response.status_code == 401

        # Account should be locked
        with app.app_context():
            user = User.query.get(user_id)
            assert user.is_locked is True

        # Even correct password should fail when locked
        response = client.post('/api/v1/auth/login', json={
            'email': 'test@example.com',
            'password': 'correct'
        })
        assert response.status_code == 423  # Account locked

    def test_password_encryption(self, client, app, auth_headers):
        """Test password encryption/decryption"""
        password_data = {
            'site_name': 'Test Site',
            'site_url': 'https://test.com',
            'username': 'testuser',
            'password': 'plaintext_password'
        }
        
        # Create password
        response = client.post('/api/v1/passwords', 
                             json=password_data, 
                             headers=auth_headers)
        assert response.status_code == 201
        
        data = json.loads(response.data)
        password_id = data['id']
        
        # Verify password is encrypted in database
        with app.app_context():
            password_obj = Password.query.get(password_id)
            assert password_obj.encrypted_password != 'plaintext_password'
            assert len(password_obj.encrypted_password) > 20  # Should be encrypted

    def test_jwt_token_validation(self, client, app):
        """Test JWT token validation"""
        # Test with invalid token
        headers = {'Authorization': 'Bearer invalid_token'}
        response = client.get('/api/v1/passwords', headers=headers)
        assert response.status_code == 422  # Invalid token

        # Test with expired token (would need to mock time)
        # This is a placeholder for more complex token expiration testing

    def test_input_validation(self, client):
        """Test input validation and sanitization"""
        # Test with malicious input
        malicious_data = {
            'email': '<script>alert("xss")</script>@example.com',
            'password': 'password123'
        }
        
        response = client.post('/api/v1/auth/register', json=malicious_data)
        # Should either reject or sanitize the input
        assert response.status_code in [400, 422]

    def test_password_strength_validation(self, client, app, auth_headers):
        """Test password strength requirements"""
        weak_passwords = [
            'weak',
            '123456',
            'password',
            'abc123'
        ]
        
        for weak_password in weak_passwords:
            password_data = {
                'site_name': 'Test Site',
                'username': 'test',
                'password': weak_password
            }
            
            response = client.post('/api/v1/passwords', 
                                 json=password_data, 
                                 headers=auth_headers)
            
            # Should either warn or reject weak passwords
            if response.status_code == 201:
                data = json.loads(response.data)
                # Should include strength warning
                assert 'strength_warning' in data or 'security_score' in data

    def test_two_factor_setup(self, client, auth_headers):
        """Test 2FA setup process"""
        # Enable 2FA
        response = client.post('/api/v1/security/2fa/enable', headers=auth_headers)
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert 'qr_code' in data or 'secret' in data

    def test_session_management(self, client, app, auth_headers):
        """Test session management and cleanup"""
        # Test logout
        response = client.post('/api/v1/auth/logout', headers=auth_headers)
        assert response.status_code == 200

        # Token should be invalidated
        response = client.get('/api/v1/passwords', headers=auth_headers)
        assert response.status_code == 401