#!/usr/bin/env python3
"""Run all Lok Password Manager tests"""

import sys
import os
import subprocess
import time

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def run_test(test_path, description):
    """Run a single test and return result"""
    print(f"\n{'='*60}")
    print(f"🧪 {description}")
    print(f"{'='*60}")
    
    try:
        result = subprocess.run([sys.executable, test_path], 
                              capture_output=True, text=True, timeout=60)
        
        if result.returncode == 0:
            print("✅ PASSED")
            return True
        else:
            print("❌ FAILED")
            print(f"Error: {result.stderr}")
            return False
    except subprocess.TimeoutExpired:
        print("⏰ TIMEOUT")
        return False
    except Exception as e:
        print(f"💥 ERROR: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Lok Password Manager - Test Suite")
    print("Running comprehensive tests...")
    
    tests = [
        ("tests/integration/test_backend.py", "Core Backend Integration Tests"),
        ("tests/ai/test_ai_simple.py", "AI Features Demo"),
        ("tests/ai/test_ai_features.py", "Comprehensive AI Testing"),
    ]
    
    results = []
    start_time = time.time()
    
    for test_path, description in tests:
        if os.path.exists(test_path):
            success = run_test(test_path, description)
            results.append((description, success))
        else:
            print(f"⚠️  Test file not found: {test_path}")
            results.append((description, False))
        
        time.sleep(2)  # Brief pause between tests
    
    # Summary
    print(f"\n{'='*60}")
    print("📊 TEST SUMMARY")
    print(f"{'='*60}")
    
    passed = sum(1 for _, success in results if success)
    total = len(results)
    
    for description, success in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {description}")
    
    print(f"\n🎯 Results: {passed}/{total} tests passed")
    print(f"⏱️  Total time: {time.time() - start_time:.1f}s")
    
    if passed == total:
        print("🎉 All tests passed! Backend is ready for production.")
        return 0
    else:
        print("⚠️  Some tests failed. Check logs above.")
        return 1

if __name__ == '__main__':
    sys.exit(main())