#!/usr/bin/env python3
"""Run comprehensive test suite."""

import pytest
import sys
import os
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

def run_tests():
    """Run all comprehensive tests."""
    test_args = [
        '-v',  # Verbose output
        '--tb=short',  # Short traceback format
        '--strict-markers',  # Strict marker checking
        '--disable-warnings',  # Disable warnings for cleaner output
        '--cov=lok_backend',  # Coverage for backend package
        '--cov-report=term-missing',  # Show missing lines
        '--cov-report=html:htmlcov',  # HTML coverage report
        str(Path(__file__).parent)  # Test directory
    ]
    
    print("🧪 Running Comprehensive Backend Tests")
    print("=" * 50)
    
    # Run tests
    exit_code = pytest.main(test_args)
    
    if exit_code == 0:
        print("\n✅ All tests passed!")
        print("📊 Coverage report generated in htmlcov/")
    else:
        print(f"\n❌ Tests failed with exit code: {exit_code}")
    
    return exit_code

if __name__ == '__main__':
    exit_code = run_tests()
    sys.exit(exit_code)