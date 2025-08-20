"""Test data fixtures for Lok Password Manager tests"""

import random
from datetime import datetime, timezone

def generate_test_user():
    """Generate test user data"""
    user_id = random.randint(1000, 9999)
    return {
        'email': f'test{user_id}@example.com',
        'password': 'TestPassword123!',
        'confirm_password': 'TestPassword123!'
    }

def generate_test_passwords():
    """Generate test password data for AI analysis"""
    return [
        {
            'site_name': 'GitHub',
            'site_url': 'https://github.com',
            'username': 'developer',
            'password': 'password123'  # Weak
        },
        {
            'site_name': 'Gmail',
            'site_url': 'https://gmail.com',
            'username': 'user@gmail.com',
            'password': 'MyStr0ngP@ssw0rd!'  # Strong
        },
        {
            'site_name': 'Facebook',
            'site_url': 'https://facebook.com',
            'username': 'user123',
            'password': 'password123'  # Duplicate weak
        },
        {
            'site_name': 'Banking',
            'site_url': 'https://bank.com',
            'username': 'customer',
            'password': 'qwerty'  # Very weak
        },
        {
            'site_name': 'Work Portal',
            'site_url': 'https://company.com',
            'username': 'employee@company.com',
            'password': 'C0mpl3xP@ssw0rd2024!'  # Very strong
        }
    ]

def get_password_strength_test_cases():
    """Test cases for password strength analysis"""
    return [
        {
            'password': 'password',
            'expected_level': 'critical',
            'expected_score_range': (0, 20)
        },
        {
            'password': 'Password123',
            'expected_level': 'weak',
            'expected_score_range': (20, 40)
        },
        {
            'password': 'MyStr0ngP@ssw0rd!',
            'expected_level': 'medium',
            'expected_score_range': (40, 70)
        },
        {
            'password': 'C0mpl3xP@ssw0rd2024!#$',
            'expected_level': 'strong',
            'expected_score_range': (70, 100)
        }
    ]

def get_ai_test_scenarios():
    """AI testing scenarios"""
    return {
        'password_generation': {
            'site_name': 'Netflix',
            'username': 'user@example.com',
            'length': 16,
            'expected_options': 5
        },
        'breach_detection': {
            'test_passwords': ['password123', 'admin', 'qwerty'],
            'expected_breaches': 3
        },
        'behavioral_analysis': {
            'normal_login': {
                'ip': '192.168.1.1',
                'user_agent': 'Mozilla/5.0 Chrome',
                'expected_risk': 'low'
            },
            'suspicious_login': {
                'ip': '1.2.3.4',
                'user_agent': 'Unknown Bot',
                'expected_risk': 'high'
            }
        }
    }