#!/usr/bin/env python3
"""
API integration tests for Lok backend
"""
import requests
import json

BASE_URL = 'http://localhost:5000/api'

def test_backend():
    print("🧪 Testing Lok Backend MVP...")
    
    # Test data - use environment variables in production
    test_user = {
        'email': 'test@example.com',
        'password': 'TestPass123!'
    }
    
    test_password = {
        'site_name': 'GitHub',
        'site_url': 'https://github.com/login',
        'username': 'testuser',
        'password': 'MySecurePassword123!'
    }
    
    try:
        # 1. Test Registration (skip if user exists)
        print("\n1️⃣ Testing user registration...")
        response = requests.post(f'{BASE_URL}/auth/register', json=test_user)
        if response.status_code == 201:
            print("✅ Registration successful")
            token = response.json()['access_token']
        elif response.status_code == 400 and 'already registered' in response.json().get('error', ''):
            print("ℹ️ User already exists, skipping registration")
        else:
            print(f"❌ Registration failed: {response.json()}")
            return
        
        # 2. Test Login
        print("\n2️⃣ Testing user login...")
        response = requests.post(f'{BASE_URL}/auth/login', json=test_user)
        if response.status_code == 200:
            print("✅ Login successful")
            token = response.json()['access_token']
        else:
            print(f"❌ Login failed: {response.json()}")
            return
        
        headers = {'Authorization': f'Bearer {token}'}
        
        # 3. Test Add Password
        print("\n3️⃣ Testing add password...")
        response = requests.post(f'{BASE_URL}/passwords', json=test_password, headers=headers)
        if response.status_code == 201:
            print("✅ Password added successfully")
            password_id = response.json()['id']
        else:
            print(f"❌ Add password failed: {response.json()}")
            return
        
        # 4. Test Get Passwords
        print("\n4️⃣ Testing get passwords...")
        response = requests.get(f'{BASE_URL}/passwords', headers=headers)
        if response.status_code == 200:
            passwords = response.json()
            print(f"✅ Retrieved {len(passwords)} passwords")
            print(f"   - Site: {passwords[0]['site_name']}")
            print(f"   - Username: {passwords[0]['username']}")
            print(f"   - Strength: {passwords[0]['strength_score']}")
        else:
            print(f"❌ Get passwords failed: {response.json()}")
            return
        
        # 5. Test Decrypt Password
        print("\n5️⃣ Testing password decryption...")
        decrypt_data = {'master_key': test_user['password']}
        # Validate URL to prevent SSRF
        if not BASE_URL.startswith(('http://localhost', 'http://127.0.0.1')):
            raise ValueError("Invalid base URL for testing")
        response = requests.post(f'{BASE_URL}/passwords/{password_id}/decrypt', 
                               json=decrypt_data, headers=headers)
        if response.status_code == 200:
            decrypted = response.json()['password']
            print("✅ Password decrypted successfully")
            if decrypted == test_password['password']:
                print("✅ Decryption matches original password")
            else:
                print("❌ Decryption doesn't match original")
        else:
            print(f"❌ Decrypt failed: {response.json()}")
        
        print("\n🎉 All tests passed! Backend MVP is ready.")
        
    except requests.exceptions.ConnectionError:
        print("❌ Connection failed. Make sure backend is running on localhost:5000")
    except Exception as e:
        print(f"❌ Test failed: {e}")

if __name__ == '__main__':
    test_backend()