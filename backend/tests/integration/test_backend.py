#!/usr/bin/env python3
"""Simple backend test script"""

import sys
import os
backend_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
sys.path.insert(0, backend_path)

from lok_backend.app import create_app
from lok_backend.core.database import db
import requests
import threading
import time
import json

def test_backend():
    """Test backend functionality"""
    print("🚀 Starting Lok Password Manager Backend Tests")
    
    # Create app
    app = create_app('development')
    
    def run_server():
        app.run(host='127.0.0.1', port=5002, debug=False, use_reloader=False)
    
    # Start server
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()
    time.sleep(3)  # Wait for server to start
    
    base_url = 'http://127.0.0.1:5002/api/v1'
    
    try:
        # Test 1: Health Check
        print("\n1. Testing Health Check...")
        response = requests.get(f'{base_url}/health', timeout=5)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            print("   ✅ Health check passed")
        else:
            print("   ❌ Health check failed")
            return
        
        # Test 2: User Registration
        print("\n2. Testing User Registration...")
        import random
        email = f'test{random.randint(1000,9999)}@example.com'
        register_data = {
            'email': email,
            'password': 'TestPassword123!',
            'confirm_password': 'TestPassword123!'
        }
        
        response = requests.post(f'{base_url}/auth/register', 
                               json=register_data, 
                               timeout=10)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.text}")
        
        if response.status_code == 201:
            result = response.json()
            token = result.get('access_token')
            user_id = result.get('user_id')
            print(f"   ✅ Registration successful - User ID: {user_id}")
            
            # Test 3: Login
            print("\n3. Testing Login...")
            login_data = {
                'email': email,
                'password': 'TestPassword123!'
            }
            
            response = requests.post(f'{base_url}/auth/login', 
                                   json=login_data, 
                                   timeout=10)
            print(f"   Status: {response.status_code}")
            if response.status_code == 200:
                print("   ✅ Login successful")
                
                # Test 4: Add Password
                print("\n4. Testing Add Password...")
                headers = {'Authorization': f'Bearer {token}'}
                password_data = {
                    'site_name': 'GitHub',
                    'site_url': 'https://github.com',
                    'username': 'testuser',
                    'password': 'MySecurePassword123!'
                }
                
                response = requests.post(f'{base_url}/passwords', 
                                       json=password_data, 
                                       headers=headers,
                                       timeout=10)
                print(f"   Status: {response.status_code}")
                if response.status_code == 201:
                    print("   ✅ Password added successfully")
                    
                    # Test 5: Get Passwords
                    print("\n5. Testing Get Passwords...")
                    response = requests.get(f'{base_url}/passwords', 
                                          headers=headers,
                                          timeout=10)
                    print(f"   Status: {response.status_code}")
                    if response.status_code == 200:
                        passwords = response.json()
                        count = passwords.get('count', 0)
                        print(f"   ✅ Retrieved {count} passwords")
                    else:
                        print(f"   ❌ Get passwords failed: {response.text}")
                else:
                    print(f"   ❌ Add password failed: {response.text}")
            else:
                print(f"   ❌ Login failed: {response.text}")
        else:
            print(f"   ❌ Registration failed: {response.text}")
            
    except Exception as e:
        print(f"❌ Test failed with exception: {e}")
    
    print("\n🏁 Backend tests completed")

if __name__ == '__main__':
    test_backend()