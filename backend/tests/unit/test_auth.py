#!/usr/bin/env python3
"""Unit tests for authentication functionality"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

import unittest
from lok_backend.app import create_app
from lok_backend.core.database import db
from lok_backend.models.user import User
from lok_backend.core.extensions import bcrypt

class TestAuth(unittest.TestCase):
    """Test authentication functionality"""
    
    def setUp(self):
        """Set up test environment"""
        self.app = create_app('testing')
        self.app_context = self.app.app_context()
        self.app_context.push()
        self.client = self.app.test_client()
        
        db.create_all()
    
    def tearDown(self):
        """Clean up test environment"""
        db.session.remove()
        db.drop_all()
        self.app_context.pop()
    
    def test_user_creation(self):
        """Test user model creation"""
        user = User(
            email='test@example.com',
            password_hash=bcrypt.generate_password_hash('password123').decode('utf-8')
        )
        db.session.add(user)
        db.session.commit()
        
        self.assertIsNotNone(user.id)
        self.assertEqual(user.email, 'test@example.com')
        self.assertTrue(bcrypt.check_password_hash(user.password_hash, 'password123'))
    
    def test_password_hashing(self):
        """Test password hashing functionality"""
        password = 'TestPassword123!'
        hash1 = bcrypt.generate_password_hash(password).decode('utf-8')
        hash2 = bcrypt.generate_password_hash(password).decode('utf-8')
        
        # Hashes should be different (salt)
        self.assertNotEqual(hash1, hash2)
        
        # Both should verify correctly
        self.assertTrue(bcrypt.check_password_hash(hash1, password))
        self.assertTrue(bcrypt.check_password_hash(hash2, password))
        
        # Wrong password should fail
        self.assertFalse(bcrypt.check_password_hash(hash1, 'wrongpassword'))

if __name__ == '__main__':
    unittest.main()