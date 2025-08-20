"""Comprehensive password management tests."""

import pytest
import json

from lok_backend.models.password import Password
from lok_backend.core.database import db


class TestPasswordManagement:
    """Test password CRUD operations."""

    def test_get_passwords_empty(self, client, auth_headers):
        """Test getting passwords when vault is empty."""
        response = client.get('/api/v1/passwords', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['passwords'] == []
        assert data['count'] == 0

    def test_add_password_success(self, client, auth_headers):
        """Test adding a new password."""
        password_data = {
            'site_name': 'Example Site',
            'site_url': 'https://example.com',
            'username': 'testuser',
            'password': 'SecurePassword123!',
            'notes': 'Test notes'
        }
        
        response = client.post('/api/v1/passwords', 
                             headers=auth_headers,
                             json=password_data)
        
        assert response.status_code == 201
        data = response.get_json()
        assert 'Password added successfully' in data['message']
        assert data['password']['site_name'] == 'Example Site'

    def test_add_password_invalid_data(self, client, auth_headers):
        """Test adding password with invalid data."""
        response = client.post('/api/v1/passwords',
                             headers=auth_headers,
                             json={'site_name': ''})
        
        assert response.status_code == 400

    def test_get_passwords_with_data(self, client, auth_headers, test_password):
        """Test getting passwords when vault has data."""
        response = client.get('/api/v1/passwords', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert len(data['passwords']) == 1
        assert data['count'] == 1
        assert data['passwords'][0]['site_name'] == test_password.site_name

    def test_get_single_password(self, client, auth_headers, test_password):
        """Test getting a single password."""
        response = client.get(f'/api/v1/passwords/{test_password.id}', 
                            headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['site_name'] == test_password.site_name

    def test_get_nonexistent_password(self, client, auth_headers):
        """Test getting a non-existent password."""
        response = client.get('/api/v1/passwords/99999', headers=auth_headers)
        
        assert response.status_code == 404

    def test_update_password(self, client, auth_headers, test_password):
        """Test updating a password."""
        update_data = {
            'site_name': 'Updated Site Name',
            'username': 'updateduser'
        }
        
        response = client.put(f'/api/v1/passwords/{test_password.id}',
                            headers=auth_headers,
                            json=update_data)
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'Password updated successfully' in data['message']
        assert data['password']['site_name'] == 'Updated Site Name'

    def test_delete_password(self, client, auth_headers, test_password):
        """Test deleting a password."""
        response = client.delete(f'/api/v1/passwords/{test_password.id}',
                               headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'Password deleted successfully' in data['message']

    def test_decrypt_password(self, client, auth_headers, test_password, test_user):
        """Test decrypting a password."""
        response = client.post(f'/api/v1/passwords/{test_password.id}/decrypt',
                             headers=auth_headers,
                             json={'master_password': 'testpass123'})
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'password' in data

    def test_decrypt_password_invalid_master(self, client, auth_headers, test_password):
        """Test decrypting with invalid master password."""
        response = client.post(f'/api/v1/passwords/{test_password.id}/decrypt',
                             headers=auth_headers,
                             json={'master_password': 'wrongpassword'})
        
        assert response.status_code == 401

    def test_search_passwords(self, client, auth_headers, test_password):
        """Test password search functionality."""
        response = client.get('/api/v1/passwords/search?q=test',
                            headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'passwords' in data
        assert 'count' in data

    def test_password_stats(self, client, auth_headers, test_password):
        """Test password statistics."""
        response = client.get('/api/v1/passwords/stats', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'total' in data
        assert 'weak' in data
        assert 'strong' in data

    def test_generate_password(self, client, auth_headers):
        """Test password generation."""
        response = client.post('/api/v1/passwords/generate',
                             headers=auth_headers,
                             json={'length': 16, 'uppercase': True})
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'passwords' in data
        assert len(data['passwords']) > 0

    def test_bulk_export(self, client, auth_headers, test_password):
        """Test bulk password export."""
        response = client.post('/api/v1/passwords/bulk',
                             headers=auth_headers,
                             json={'operation': 'export'})
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'passwords' in data

    def test_bulk_delete(self, client, auth_headers, test_password):
        """Test bulk password deletion."""
        response = client.post('/api/v1/passwords/bulk',
                             headers=auth_headers,
                             json={
                                 'operation': 'delete',
                                 'password_ids': [test_password.id]
                             })
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'Deleted' in data['message']

    def test_toggle_favorite(self, client, auth_headers, test_password):
        """Test toggling password favorite status."""
        response = client.post(f'/api/v1/passwords/{test_password.id}/favorite',
                             headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'Favorite status updated' in data['message']