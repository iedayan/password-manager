"""Comprehensive authentication tests."""

import pytest
import json
from datetime import datetime, timezone

from lok_backend.models.user import User
from lok_backend.core.database import db


class TestAuthentication:
    """Test authentication endpoints."""

    def test_user_registration_success(self, client):
        """Test successful user registration."""
        response = client.post('/api/v1/auth/register', json={
            'email': 'test@example.com',
            'password': 'SecurePass123!'
        })
        
        assert response.status_code == 201
        data = response.get_json()
        assert 'access_token' in data
        assert 'user_id' in data
        assert data['message'] == 'User registered successfully'

    def test_user_registration_duplicate_email(self, client, test_user):
        """Test registration with duplicate email."""
        response = client.post('/api/v1/auth/register', json={
            'email': test_user.email,
            'password': 'SecurePass123!'
        })
        
        assert response.status_code == 409
        data = response.get_json()
        assert 'Email already registered' in data['error']

    def test_user_registration_invalid_data(self, client):
        """Test registration with invalid data."""
        response = client.post('/api/v1/auth/register', json={
            'email': 'invalid-email',
            'password': '123'
        })
        
        assert response.status_code == 400

    def test_user_login_success(self, client, test_user):
        """Test successful login."""
        response = client.post('/api/v1/auth/login', json={
            'email': test_user.email,
            'password': 'testpass123'
        })
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'access_token' in data
        assert data['user_id'] == test_user.id

    def test_user_login_invalid_credentials(self, client, test_user):
        """Test login with invalid credentials."""
        response = client.post('/api/v1/auth/login', json={
            'email': test_user.email,
            'password': 'wrongpassword'
        })
        
        assert response.status_code == 401
        data = response.get_json()
        assert 'Invalid credentials' in data['error']

    def test_token_verification(self, client, auth_headers):
        """Test JWT token verification."""
        response = client.get('/api/v1/auth/verify', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['valid'] is True

    def test_logout(self, client, auth_headers):
        """Test user logout."""
        response = client.post('/api/v1/auth/logout', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'Successfully logged out' in data['message']

    def test_change_password(self, client, auth_headers, test_user):
        """Test password change."""
        response = client.post('/api/v1/auth/change-password', 
                             headers=auth_headers,
                             json={
                                 'current_password': 'testpass123',
                                 'new_password': 'NewSecurePass123!'
                             })
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'Password changed successfully' in data['message']

    def test_change_password_invalid_current(self, client, auth_headers):
        """Test password change with invalid current password."""
        response = client.post('/api/v1/auth/change-password',
                             headers=auth_headers,
                             json={
                                 'current_password': 'wrongpassword',
                                 'new_password': 'NewSecurePass123!'
                             })
        
        assert response.status_code == 401
        data = response.get_json()
        assert 'Invalid current password' in data['error']