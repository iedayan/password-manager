"""Health check and system status tests."""

import pytest
import json


class TestHealthEndpoints:
    """Test health check and system monitoring endpoints."""

    def test_basic_health_check(self, client):
        """Test basic health check endpoint."""
        response = client.get('/api/v1/health')
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['status'] == 'healthy'
        assert 'timestamp' in data

    def test_detailed_health_check(self, client):
        """Test detailed health check."""
        response = client.get('/api/v1/health/detailed')
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'database' in data
        assert 'services' in data

    def test_database_health(self, client):
        """Test database connectivity health check."""
        response = client.get('/api/v1/health/database')
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'database_status' in data

    def test_system_metrics(self, client):
        """Test system metrics endpoint."""
        response = client.get('/api/v1/health/metrics')
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'uptime' in data or 'status' in data