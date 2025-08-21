import pytest
import time
import json
from concurrent.futures import ThreadPoolExecutor
from lok_backend.models.user import User
from lok_backend.models.password import Password
from lok_backend.core.database import db


class TestPerformance:
    """Test performance and scalability"""

    def test_bulk_password_creation(self, client, app, auth_headers):
        """Test creating multiple passwords efficiently"""
        start_time = time.time()
        
        # Create 50 passwords
        for i in range(50):
            password_data = {
                'site_name': f'Site {i}',
                'site_url': f'https://site{i}.com',
                'username': f'user{i}',
                'password': f'password{i}'
            }
            
            response = client.post('/api/v1/passwords', 
                                 json=password_data, 
                                 headers=auth_headers)
            assert response.status_code == 201
        
        end_time = time.time()
        duration = end_time - start_time
        
        # Should complete within reasonable time (adjust threshold as needed)
        assert duration < 10.0  # 10 seconds for 50 passwords

    def test_password_search_performance(self, client, app, auth_headers):
        """Test password search performance with large dataset"""
        # First create test data
        with app.app_context():
            user_id = 1  # Assuming test user has ID 1
            passwords = []
            for i in range(100):
                password = Password(
                    user_id=user_id,
                    site_name=f'Site {i}',
                    site_url=f'https://site{i}.com',
                    username=f'user{i}',
                    encrypted_password=f'encrypted{i}'
                )
                passwords.append(password)
            
            db.session.add_all(passwords)
            db.session.commit()

        # Test search performance
        start_time = time.time()
        
        response = client.get('/api/v1/passwords?search=Site', headers=auth_headers)
        assert response.status_code == 200
        
        end_time = time.time()
        duration = end_time - start_time
        
        # Search should be fast
        assert duration < 1.0  # 1 second for search

    def test_concurrent_early_bird_claims(self, client, app):
        """Test concurrent early bird spot claims"""
        with app.app_context():
            # Create test users
            users = []
            for i in range(10):
                user = User(email=f'user{i}@example.com', password_hash='hash')
                users.append(user)
            
            db.session.add_all(users)
            db.session.commit()
            user_ids = [user.id for user in users]

        def claim_spot(user_id):
            return client.post('/api/v1/early-bird/claim-spot', 
                             json={'user_id': user_id})

        # Test concurrent claims
        with ThreadPoolExecutor(max_workers=5) as executor:
            futures = [executor.submit(claim_spot, user_id) for user_id in user_ids[:5]]
            responses = [future.result() for future in futures]

        # All should succeed (assuming spots available)
        success_count = sum(1 for r in responses if r.status_code == 200)
        assert success_count == 5

    def test_database_connection_pooling(self, client):
        """Test database handles multiple concurrent requests"""
        def make_request():
            return client.get('/api/v1/early-bird/spots-remaining')

        # Make 20 concurrent requests
        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(make_request) for _ in range(20)]
            responses = [future.result() for future in futures]

        # All should succeed
        success_count = sum(1 for r in responses if r.status_code == 200)
        assert success_count == 20

    def test_memory_usage_stability(self, client, auth_headers):
        """Test memory doesn't grow excessively with repeated requests"""
        import psutil
        import os
        
        process = psutil.Process(os.getpid())
        initial_memory = process.memory_info().rss
        
        # Make 100 requests
        for _ in range(100):
            response = client.get('/api/v1/passwords', headers=auth_headers)
            assert response.status_code in [200, 401]  # 401 if auth expires
        
        final_memory = process.memory_info().rss
        memory_growth = final_memory - initial_memory
        
        # Memory growth should be reasonable (less than 50MB)
        assert memory_growth < 50 * 1024 * 1024

    def test_api_response_times(self, client):
        """Test API response times are within acceptable limits"""
        endpoints = [
            '/api/v1/health/status',
            '/api/v1/early-bird/spots-remaining'
        ]
        
        for endpoint in endpoints:
            start_time = time.time()
            response = client.get(endpoint)
            end_time = time.time()
            
            duration = end_time - start_time
            assert response.status_code == 200
            assert duration < 0.5  # 500ms response time limit