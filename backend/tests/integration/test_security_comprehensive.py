"""Comprehensive security tests."""

import pytest
import json
from unittest.mock import patch

from lok_backend.models.user import User
from lok_backend.core.database import db


class TestSecurityFeatures:
    """Test security dashboard and 2FA functionality."""

    def test_security_dashboard(self, client, auth_headers, test_password):
        """Test security dashboard endpoint."""
        response = client.get('/api/v1/security/dashboard', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'total_passwords' in data
        assert 'weak_passwords' in data
        assert 'overall_score' in data

    def test_security_scan(self, client, auth_headers, test_password):
        """Test comprehensive security scan."""
        response = client.post('/api/v1/security/scan', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'scan_timestamp' in data
        assert 'scan_type' in data

    def test_password_health_check(self, client, auth_headers, test_password):
        """Test password health check."""
        response = client.get('/api/v1/security/health-check', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'total_passwords' in data
        assert 'weak_passwords' in data
        assert 'overall_score' in data

    def test_2fa_setup(self, client, auth_headers):
        """Test 2FA setup."""
        response = client.post('/api/v1/security/2fa/setup', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'secret' in data
        assert 'qr_code' in data

    def test_2fa_status_disabled(self, client, auth_headers):
        """Test 2FA status when disabled."""
        response = client.get('/api/v1/security/2fa/status', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['is_enabled'] is False

    @patch('pyotp.TOTP.verify')
    def test_2fa_verify_success(self, mock_verify, client, auth_headers, test_user):
        """Test successful 2FA verification."""
        # Setup 2FA first
        client.post('/api/v1/security/2fa/setup', headers=auth_headers)
        
        # Mock successful verification
        mock_verify.return_value = True
        
        response = client.post('/api/v1/security/2fa/verify',
                             headers=auth_headers,
                             json={'code': '123456'})
        
        assert response.status_code == 200
        data = response.get_json()
        assert '2FA enabled successfully' in data['message']

    def test_2fa_verify_invalid_code(self, client, auth_headers):
        """Test 2FA verification with invalid code."""
        # Setup 2FA first
        client.post('/api/v1/security/2fa/setup', headers=auth_headers)
        
        response = client.post('/api/v1/security/2fa/verify',
                             headers=auth_headers,
                             json={'code': '000000'})
        
        assert response.status_code == 400

    def test_2fa_disable(self, client, auth_headers, test_user):
        """Test 2FA disable."""
        response = client.post('/api/v1/security/2fa/disable',
                             headers=auth_headers,
                             json={'password': 'testpass123'})
        
        assert response.status_code == 200
        data = response.get_json()
        assert '2FA disabled successfully' in data['message']

    def test_breach_check(self, client, auth_headers, test_password):
        """Test breach checking functionality."""
        response = client.post('/api/v1/security/breach-check',
                             headers=auth_headers,
                             json={'password_ids': [test_password.id]})
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'checked_at' in data

    def test_advanced_analysis(self, client, auth_headers, test_password):
        """Test advanced security analysis."""
        response = client.get('/api/v1/security/advanced-analysis', 
                            headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'total_passwords' in data
        assert 'entropy_distribution' in data
        assert 'ai_recommendations' in data

    def test_ai_recommendations(self, client, auth_headers):
        """Test AI security recommendations."""
        response = client.get('/api/v1/security/ai/recommendations',
                            headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'recommendations' in data

    def test_security_trends(self, client, auth_headers):
        """Test security trends endpoint."""
        response = client.get('/api/v1/security/trends', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'monthly_scores' in data
        assert 'threat_categories' in data

    def test_behavioral_analysis(self, client, auth_headers):
        """Test behavioral analysis."""
        response = client.get('/api/v1/security/behavioral-analysis',
                            headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'analysis' in data or 'anomalies' in data

    def test_realtime_threats(self, client, auth_headers):
        """Test real-time threats endpoint."""
        response = client.get('/api/v1/security/threats/realtime',
                            headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'threats' in data

    def test_biometric_setup(self, client, auth_headers):
        """Test biometric authentication setup."""
        response = client.post('/api/v1/security/biometric/setup',
                             headers=auth_headers,
                             json={'credential_id': 'test_credential'})
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'Biometric authentication enabled' in data['message']

    def test_biometric_verify(self, client, auth_headers, test_user):
        """Test biometric verification."""
        # Setup biometric first
        client.post('/api/v1/security/biometric/setup',
                   headers=auth_headers,
                   json={'credential_id': 'test_credential'})
        
        response = client.post('/api/v1/security/biometric/verify',
                             headers=auth_headers,
                             json={'credential_id': 'test_credential'})
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['verified'] is True

    def test_secure_export(self, client, auth_headers, test_password, test_user):
        """Test secure password export."""
        response = client.post('/api/v1/security/export',
                             headers=auth_headers,
                             json={
                                 'format': 'json',
                                 'include_passwords': True,
                                 'master_password': 'testpass123'
                             })
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'passwords' in data
        assert data['includes_passwords'] is True

    def test_secure_export_invalid_master(self, client, auth_headers, test_password):
        """Test secure export with invalid master password."""
        response = client.post('/api/v1/security/export',
                             headers=auth_headers,
                             json={
                                 'include_passwords': True,
                                 'master_password': 'wrongpassword'
                             })
        
        assert response.status_code == 401