import pytest
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from datetime import datetime, timezone, timedelta
from lok_backend.models.user import User
from lok_backend.core.database import db


class TestUserModel:
    """Test User model functionality"""

    def test_user_creation(self, app):
        """Test basic user creation"""
        with app.app_context():
            user = User(email='test@example.com', password_hash='hashed_password')
            db.session.add(user)
            db.session.commit()

            assert user.id is not None
            assert user.uuid is not None
            assert user.email == 'test@example.com'
            assert user.is_active is True
            assert user.email_verified is False
            assert user.early_bird_access is False

    def test_user_early_bird_access(self, app):
        """Test early bird access functionality"""
        with app.app_context():
            user = User(email='test@example.com', password_hash='hash')
            assert user.early_bird_access is False
            assert user.early_bird_claimed_at is None

            # Grant early bird access
            user.early_bird_access = True
            user.early_bird_claimed_at = datetime.utcnow()
            db.session.add(user)
            db.session.commit()

            assert user.early_bird_access is True
            assert user.early_bird_claimed_at is not None

    def test_user_account_locking(self, app):
        """Test account locking functionality"""
        with app.app_context():
            user = User(email='test@example.com', password_hash='hash')
            db.session.add(user)
            db.session.commit()

            # Initially not locked
            assert user.is_locked is False
            assert user.failed_login_attempts == 0

            # Lock account
            user.lock_account(30)
            assert user.is_locked is True
            assert user.locked_until is not None

            # Unlock account
            user.unlock_account()
            assert user.is_locked is False
            assert user.failed_login_attempts == 0
            assert user.locked_until is None

    def test_failed_login_attempts(self, app):
        """Test failed login attempt tracking"""
        with app.app_context():
            user = User(email='test@example.com', password_hash='hash')
            db.session.add(user)
            db.session.commit()

            # Increment failed attempts
            for i in range(4):
                user.increment_failed_login()
                assert user.failed_login_attempts == i + 1
                assert user.is_locked is False

            # 5th attempt should lock account
            user.increment_failed_login()
            assert user.failed_login_attempts == 5
            assert user.is_locked is True

    def test_user_to_dict(self, app):
        """Test user serialization"""
        with app.app_context():
            user = User(
                email='test@example.com', 
                password_hash='hash',
                early_bird_access=True,
                two_factor_enabled=True
            )
            db.session.add(user)
            db.session.commit()

            user_dict = user.to_dict()
            
            assert 'id' in user_dict
            assert 'uuid' in user_dict
            assert user_dict['email'] == 'test@example.com'
            assert user_dict['two_factor_enabled'] is True
            assert 'password_hash' not in user_dict  # Should not expose sensitive data

    def test_user_repr(self, app):
        """Test user string representation"""
        with app.app_context():
            user = User(email='test@example.com', password_hash='hash')
            repr_str = repr(user)
            assert 'test@example.com' in repr_str
            assert '<User' in repr_str