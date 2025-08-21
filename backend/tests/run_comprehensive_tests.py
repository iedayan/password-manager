#!/usr/bin/env python3
"""
Comprehensive test runner for Lok Password Manager backend
"""

import pytest
import sys
import os
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

def run_tests():
    """Run comprehensive test suite"""
    
    # Test configuration
    pytest_args = [
        '-v',  # Verbose output
        '--tb=short',  # Short traceback format
        '--strict-markers',  # Strict marker checking
        '--disable-warnings',  # Disable warnings for cleaner output
        '--cov=lok_backend',  # Coverage for lok_backend package
        '--cov-report=html',  # HTML coverage report
        '--cov-report=term-missing',  # Terminal coverage with missing lines
        '--cov-fail-under=80',  # Fail if coverage below 80%
    ]
    
    # Add test directories
    test_patterns = [
        'api/',
        'models/',
        'security/',
        'performance/',
        'integration/',
        'ai/',
        'test_*.py'  # Root level tests
    ]
    
    # Check which test directories exist
    existing_tests = []
    test_dir = Path(__file__).parent
    
    for pattern in test_patterns:
        test_path = test_dir / pattern
        if test_path.exists():
            if test_path.is_dir():
                existing_tests.append(str(test_path))
            else:
                existing_tests.append(str(test_path))
    
    if not existing_tests:
        print("No test directories found!")
        return 1
    
    print(f"Running tests from {len(existing_tests)} locations...")
    print("Test locations:", existing_tests)
    
    # Run tests
    exit_code = pytest.main(pytest_args + existing_tests)
    
    if exit_code == 0:
        print("\n✅ All tests passed!")
    else:
        print(f"\n❌ Tests failed with exit code: {exit_code}")
    
    return exit_code


if __name__ == '__main__':
    exit_code = run_tests()
    sys.exit(exit_code)