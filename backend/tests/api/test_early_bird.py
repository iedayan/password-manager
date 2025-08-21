import pytest
import json
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from datetime import datetime
from lok_backend.models.user import User
from lok_backend.core.database import db


class TestEarlyBirdAPI:
    """Test early bird functionality"""

    def test_get_spots_remaining_initial(self, client):
        """Test initial spots remaining"""
        response = client.get('/api/v1/early-bird/spots-remaining')
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert data['spotsRemaining'] == 500
        assert data['totalSpots'] == 500
        assert data['spotsTaken'] == 0

    def test_get_spots_remaining_with_users(self, client, app):
        """Test spots remaining with existing early bird users"""
        with app.app_context():
            # Create test users with early bird access
            user1 = User(email='test1@example.com', password_hash='hash1', early_bird_access=True)
            user2 = User(email='test2@example.com', password_hash='hash2', early_bird_access=True)
            user3 = User(email='test3@example.com', password_hash='hash3', early_bird_access=False)
            
            db.session.add_all([user1, user2, user3])
            db.session.commit()

        response = client.get('/api/v1/early-bird/spots-remaining')
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert data['spotsRemaining'] == 498
        assert data['totalSpots'] == 500
        assert data['spotsTaken'] == 2

    def test_claim_spot_success(self, client, app):
        """Test successful spot claiming"""
        with app.app_context():
            user = User(email='test@example.com', password_hash='hash', early_bird_access=False)
            db.session.add(user)
            db.session.commit()
            user_id = user.id

        response = client.post('/api/v1/early-bird/claim-spot', 
                             json={'user_id': user_id})
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert data['success'] is True
        assert 'spotsRemaining' in data
        assert data['message'] == 'Early bird spot claimed successfully'

        # Verify user was updated
        with app.app_context():
            user = User.query.get(user_id)
            assert user.early_bird_access is True
            assert user.early_bird_claimed_at is not None

    def test_claim_spot_user_not_found(self, client):
        """Test claiming spot for non-existent user"""
        response = client.post('/api/v1/early-bird/claim-spot', 
                             json={'user_id': 99999})
        assert response.status_code == 404
        
        data = json.loads(response.data)
        assert data['error'] == 'User not found'

    def test_claim_spot_already_claimed(self, client, app):
        """Test claiming spot for user who already has access"""
        with app.app_context():
            user = User(email='test@example.com', password_hash='hash', early_bird_access=True)
            db.session.add(user)
            db.session.commit()
            user_id = user.id

        response = client.post('/api/v1/early-bird/claim-spot', 
                             json={'user_id': user_id})
        assert response.status_code == 400
        
        data = json.loads(response.data)
        assert data['error'] == 'User already has early bird access'

    def test_claim_spot_no_spots_remaining(self, client, app):
        """Test claiming spot when limit is reached"""
        with app.app_context():
            # Create 500 users with early bird access
            users = []
            for i in range(500):
                user = User(email=f'test{i}@example.com', password_hash='hash', early_bird_access=True)
                users.append(user)
            
            db.session.add_all(users)
            db.session.commit()

            # Create one more user without access
            new_user = User(email='newuser@example.com', password_hash='hash', early_bird_access=False)
            db.session.add(new_user)
            db.session.commit()
            user_id = new_user.id

        response = client.post('/api/v1/early-bird/claim-spot', 
                             json={'user_id': user_id})
        assert response.status_code == 400
        
        data = json.loads(response.data)
        assert data['error'] == 'No early bird spots remaining'

    def test_claim_spot_missing_user_id(self, client):
        """Test claiming spot without user_id"""
        response = client.post('/api/v1/early-bird/claim-spot', json={})
        assert response.status_code == 400
        
        data = json.loads(response.data)
        assert data['error'] == 'User ID required'