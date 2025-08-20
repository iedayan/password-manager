"""User profile management tests."""

import pytest
import json

from lok_backend.models.user import User
from lok_backend.models.login_session import LoginSession
from lok_backend.core.database import db


class TestUserManagement:
    """Test user profile and session management."""

    def test_get_user_profile(self, client, auth_headers, test_user):
        """Test getting user profile."""
        response = client.get('/api/v1/user/profile', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['email'] == test_user.email
        assert 'id' in data

    def test_update_user_profile(self, client, auth_headers):
        """Test updating user profile."""
        update_data = {
            'auto_lock_timeout': 30,
            'password_strength_requirement': 'strong'
        }
        
        response = client.put('/api/v1/user/profile',
                            headers=auth_headers,
                            json=update_data)
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'Profile updated successfully' in data['message']

    def test_update_profile_invalid_data(self, client, auth_headers):
        """Test updating profile with invalid data."""
        response = client.put('/api/v1/user/profile',
                            headers=auth_headers,
                            json={'auto_lock_timeout': 9999})
        
        assert response.status_code == 200  # Invalid values are ignored

    def test_get_user_sessions(self, client, auth_headers):
        """Test getting user sessions."""
        response = client.get('/api/v1/user/sessions', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'sessions' in data
        assert 'total_sessions' in data

    def test_change_user_password(self, client, auth_headers):
        """Test changing user password."""
        response = client.post('/api/v1/user/change-password',
                             headers=auth_headers,
                             json={
                                 'current_password': 'testpass123',
                                 'new_password': 'NewSecurePass123!'
                             })
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'Password changed successfully' in data['message']

    def test_change_password_invalid_current(self, client, auth_headers):
        """Test changing password with invalid current password."""
        response = client.post('/api/v1/user/change-password',
                             headers=auth_headers,
                             json={
                                 'current_password': 'wrongpassword',
                                 'new_password': 'NewSecurePass123!'
                             })
        
        assert response.status_code == 401

    def test_change_password_weak_new(self, client, auth_headers):
        """Test changing to weak password."""
        response = client.post('/api/v1/user/change-password',
                             headers=auth_headers,
                             json={
                                 'current_password': 'testpass123',
                                 'new_password': '123'
                             })
        
        assert response.status_code == 400

    def test_delete_user_account(self, client, auth_headers):
        """Test deleting user account."""
        response = client.delete('/api/v1/user/delete',
                               headers=auth_headers,
                               json={'password': 'testpass123'})
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'Account deleted successfully' in data['message']

    def test_delete_account_invalid_password(self, client, auth_headers):
        """Test deleting account with invalid password."""
        response = client.delete('/api/v1/user/delete',
                               headers=auth_headers,
                               json={'password': 'wrongpassword'})
        
        assert response.status_code == 401

    def test_terminate_session(self, client, auth_headers, app):
        """Test terminating a specific session."""
        # Create a test session
        with app.app_context():
            session = LoginSession(
                user_id=1,
                ip_address='127.0.0.1',
                user_agent='Test Agent',
                is_active=True
            )
            db.session.add(session)
            db.session.commit()
            session_id = session.id
        
        response = client.delete(f'/api/v1/user/sessions/{session_id}',
                               headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'Session terminated successfully' in data['message']

    def test_terminate_nonexistent_session(self, client, auth_headers):
        """Test terminating non-existent session."""
        response = client.delete('/api/v1/user/sessions/99999',
                               headers=auth_headers)
        
        assert response.status_code == 404