"""Comprehensive integration tests."""

import pytest
import json
from datetime import datetime, timezone


class TestIntegrationWorkflows:
    """Test complete user workflows and integrations."""

    def test_complete_user_registration_workflow(self, client):
        """Test complete user registration and setup workflow."""
        # 1. Register user
        response = client.post('/api/v1/auth/register', json={
            'email': 'integration@example.com',
            'password': 'SecurePass123!'
        })
        assert response.status_code == 201
        
        token = response.get_json()['access_token']
        headers = {'Authorization': f'Bearer {token}'}
        
        # 2. Add first password
        response = client.post('/api/v1/passwords', 
                             headers=headers,
                             json={
                                 'site_name': 'Gmail',
                                 'site_url': 'https://gmail.com',
                                 'username': 'user@gmail.com',
                                 'password': 'GmailPass123!'
                             })
        assert response.status_code == 201
        password_id = response.get_json()['password']['id']
        
        # 3. Setup 2FA
        response = client.post('/api/v1/security/2fa/setup', headers=headers)
        assert response.status_code == 200
        
        # 4. Run security scan
        response = client.post('/api/v1/security/scan', headers=headers)
        assert response.status_code == 200
        
        # 5. Get security dashboard
        response = client.get('/api/v1/security/dashboard', headers=headers)
        assert response.status_code == 200
        dashboard = response.get_json()
        assert dashboard['total_passwords'] == 1

    def test_password_management_workflow(self, client, auth_headers):
        """Test complete password management workflow."""
        # 1. Add multiple passwords
        passwords = []
        for i in range(3):
            response = client.post('/api/v1/passwords',
                                 headers=auth_headers,
                                 json={
                                     'site_name': f'Site {i}',
                                     'username': f'user{i}',
                                     'password': f'Password{i}123!'
                                 })
            assert response.status_code == 201
            passwords.append(response.get_json()['password']['id'])
        
        # 2. Search passwords
        response = client.get('/api/v1/passwords/search?q=Site',
                            headers=auth_headers)
        assert response.status_code == 200
        assert response.get_json()['count'] == 3
        
        # 3. Get password stats
        response = client.get('/api/v1/passwords/stats', headers=auth_headers)
        assert response.status_code == 200
        stats = response.get_json()
        assert stats['total'] == 3
        
        # 4. Update password
        response = client.put(f'/api/v1/passwords/{passwords[0]}',
                            headers=auth_headers,
                            json={'site_name': 'Updated Site'})
        assert response.status_code == 200
        
        # 5. Bulk export
        response = client.post('/api/v1/passwords/bulk',
                             headers=auth_headers,
                             json={'operation': 'export'})
        assert response.status_code == 200
        export_data = response.get_json()
        assert len(export_data['passwords']) == 3

    def test_security_analysis_workflow(self, client, auth_headers, test_password):
        """Test security analysis and recommendations workflow."""
        # 1. Add weak password
        response = client.post('/api/v1/passwords',
                             headers=auth_headers,
                             json={
                                 'site_name': 'Weak Site',
                                 'username': 'user',
                                 'password': '123456'  # Weak password
                             })
        assert response.status_code == 201
        weak_password_id = response.get_json()['password']['id']
        
        # 2. Run health check
        response = client.get('/api/v1/security/health-check', headers=auth_headers)
        assert response.status_code == 200
        health = response.get_json()
        assert len(health['weak_passwords']) > 0
        
        # 3. Get AI recommendations
        response = client.get('/api/v1/security/ai/recommendations',
                            headers=auth_headers)
        assert response.status_code == 200
        recommendations = response.get_json()
        assert len(recommendations['recommendations']) > 0
        
        # 4. Generate strong password
        response = client.post('/api/v1/passwords/generate',
                             headers=auth_headers,
                             json={'length': 20, 'symbols': True})
        assert response.status_code == 200
        generated = response.get_json()
        assert len(generated['passwords']) > 0
        
        # 5. Update weak password with strong one
        strong_password = generated['passwords'][0]['password']
        response = client.put(f'/api/v1/passwords/{weak_password_id}',
                            headers=auth_headers,
                            json={'password': strong_password})
        assert response.status_code == 200

    def test_user_profile_management_workflow(self, client, auth_headers, test_user):
        """Test user profile and session management workflow."""
        # 1. Get current profile
        response = client.get('/api/v1/user/profile', headers=auth_headers)
        assert response.status_code == 200
        profile = response.get_json()
        assert profile['email'] == test_user.email
        
        # 2. Update profile settings
        response = client.put('/api/v1/user/profile',
                            headers=auth_headers,
                            json={
                                'auto_lock_timeout': 15,
                                'password_strength_requirement': 'strong'
                            })
        assert response.status_code == 200
        
        # 3. Get active sessions
        response = client.get('/api/v1/user/sessions', headers=auth_headers)
        assert response.status_code == 200
        sessions = response.get_json()
        assert 'sessions' in sessions
        
        # 4. Change password
        response = client.post('/api/v1/user/change-password',
                             headers=auth_headers,
                             json={
                                 'current_password': 'testpass123',
                                 'new_password': 'NewSecurePass123!'
                             })
        assert response.status_code == 200

    def test_import_export_workflow(self, client, auth_headers):
        """Test password import/export workflow."""
        # 1. Add test passwords
        test_passwords = [
            {'site_name': 'Facebook', 'username': 'user1', 'password': 'FBPass123!'},
            {'site_name': 'Twitter', 'username': 'user2', 'password': 'TwitterPass123!'},
            {'site_name': 'LinkedIn', 'username': 'user3', 'password': 'LinkedInPass123!'}
        ]
        
        for pwd in test_passwords:
            response = client.post('/api/v1/passwords',
                                 headers=auth_headers,
                                 json=pwd)
            assert response.status_code == 201
        
        # 2. Export passwords
        response = client.post('/api/v1/passwords/bulk',
                             headers=auth_headers,
                             json={'operation': 'export'})
        assert response.status_code == 200
        exported = response.get_json()
        assert len(exported['passwords']) == 3
        
        # 3. Delete all passwords
        password_ids = [pwd['id'] for pwd in exported['passwords']]
        response = client.post('/api/v1/passwords/bulk',
                             headers=auth_headers,
                             json={
                                 'operation': 'delete',
                                 'password_ids': password_ids
                             })
        assert response.status_code == 200
        
        # 4. Verify deletion
        response = client.get('/api/v1/passwords', headers=auth_headers)
        assert response.status_code == 200
        assert response.get_json()['count'] == 0
        
        # 5. Re-import passwords
        response = client.post('/api/v1/passwords/bulk',
                             headers=auth_headers,
                             json={
                                 'operation': 'import',
                                 'passwords': test_passwords
                             })
        assert response.status_code == 201

    def test_error_handling_workflow(self, client, auth_headers):
        """Test error handling across different endpoints."""
        # 1. Test invalid password creation
        response = client.post('/api/v1/passwords',
                             headers=auth_headers,
                             json={'site_name': ''})  # Invalid data
        assert response.status_code == 400
        
        # 2. Test accessing non-existent password
        response = client.get('/api/v1/passwords/99999', headers=auth_headers)
        assert response.status_code == 404
        
        # 3. Test invalid master password
        response = client.post('/api/v1/passwords/1/decrypt',
                             headers=auth_headers,
                             json={'master_password': 'wrong'})
        assert response.status_code == 401 or response.status_code == 404
        
        # 4. Test unauthorized access
        response = client.get('/api/v1/passwords')  # No auth header
        assert response.status_code == 401

    def test_rate_limiting_workflow(self, client, auth_headers):
        """Test rate limiting on sensitive endpoints."""
        # Test multiple password generation requests
        for i in range(3):
            response = client.post('/api/v1/passwords/generate',
                                 headers=auth_headers,
                                 json={'length': 12})
            # Should succeed within rate limit
            assert response.status_code == 200