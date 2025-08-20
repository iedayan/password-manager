# Backend Testing Guide

Comprehensive test suite for the Lok Password Manager backend.

## Test Structure

### Core Tests
- `test_auth_comprehensive.py` - Authentication and JWT tests
- `test_passwords_comprehensive.py` - Password CRUD and management
- `test_security_comprehensive.py` - Security dashboard and 2FA
- `test_user_management.py` - User profile and session management
- `test_health_endpoints.py` - Health checks and monitoring
- `test_integration_comprehensive.py` - End-to-end workflows

### Configuration
- `conftest.py` - Test fixtures and configuration
- `pytest.ini` - Pytest settings and markers
- `run_comprehensive_tests.py` - Test runner with coverage

## Running Tests

```bash
# Run all comprehensive tests
python run_comprehensive_tests.py

# Run specific test category
pytest test_auth_comprehensive.py -v
pytest test_security_comprehensive.py -v

# Run with coverage report
pytest --cov=lok_backend --cov-report=html --cov-report=term-missing

# Run integration tests only
pytest -m integration

# Run excluding slow tests
pytest -m "not slow"
```

## Test Categories

### Authentication Tests
- User registration and validation
- Login/logout workflows
- JWT token management
- Password changes and resets

### Password Management Tests
- CRUD operations
- Encryption/decryption
- Search and filtering
- Bulk operations
- Password generation
- Statistics and analytics

### Security Tests
- Security dashboard
- 2FA setup and verification
- Breach checking
- AI-powered analysis
- Biometric authentication
- Real-time threat monitoring

### User Management Tests
- Profile management
- Session handling
- Account deletion
- Settings updates

### Integration Tests
- Complete user workflows
- Multi-step operations
- Error handling scenarios
- Rate limiting validation

### Health Tests
- System health checks
- Database connectivity
- Service status monitoring

## Test Features

### Fixtures
- `app` - Test Flask application
- `client` - Test client for API calls
- `test_user` - Pre-created test user
- `test_password` - Sample password entry
- `auth_headers` - Authentication headers
- `multiple_passwords` - Multiple test passwords

### Coverage Goals
- **Overall**: >95% code coverage
- **Critical paths**: 100% coverage
- **Security functions**: 100% coverage
- **API endpoints**: 100% coverage

## Test Data

- Temporary SQLite databases for isolation
- Mock user accounts and passwords
- Simulated security scenarios
- Test encryption keys