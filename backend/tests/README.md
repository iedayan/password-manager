# Lok Password Manager Tests

## Test Structure

```
tests/
├── integration/        # Full API integration tests
├── unit/              # Unit tests for individual components
├── ai/                # AI features testing
└── fixtures/          # Test data and fixtures
```

## Running Tests

### Integration Tests
```bash
# Basic backend functionality
python3 tests/integration/test_backend.py

# Full API integration test
python3 -m pytest tests/integration/
```

### AI Features Tests
```bash
# Comprehensive AI features test
python3 tests/ai/test_ai_features.py

# Simple AI demo
python3 tests/ai/test_ai_simple.py
```

### Unit Tests
```bash
# Run all unit tests
python3 -m pytest tests/unit/

# Run specific test file
python3 -m pytest tests/unit/test_auth.py
```

## Test Categories

### Integration Tests
- **test_backend.py** - Core API functionality (auth, passwords, CRUD)
- Full end-to-end workflow testing
- Database integration testing

### AI Tests
- **test_ai_features.py** - Comprehensive AI capabilities testing
- **test_ai_simple.py** - Quick AI features demo
- ML-powered analysis testing
- Behavioral monitoring tests

### Unit Tests
- Authentication service tests
- Password encryption tests
- Security middleware tests
- Database model tests

## Test Requirements

- Python 3.8+
- All backend dependencies installed
- Test database (SQLite for development)
- Network access for AI services

## Test Data

Tests use randomly generated data to avoid conflicts:
- Random email addresses
- Test passwords with known strength scores
- Mock security scenarios