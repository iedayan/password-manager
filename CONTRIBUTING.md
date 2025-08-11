# Contributing to Lok Password Manager

Thank you for your interest in contributing to Lok! This document provides guidelines for contributing to the project.

## 🚀 Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/password-manager.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes
6. Commit and push
7. Create a Pull Request

## 🧪 Testing

Before submitting a PR, ensure all tests pass:

```bash
# Backend tests
cd backend
python tests/test_api.py

# Extension tests (manual)
Load extension in Chrome and test functionality
```

## 📝 Code Style

- **Python**: Follow PEP 8
- **JavaScript**: Use ES6+ features
- **Comments**: Write clear, concise comments
- **Naming**: Use descriptive variable and function names

## 🔒 Security

- Never commit secrets or API keys
- Follow zero-knowledge principles
- Report security issues privately to security@lok.security

## 📋 Pull Request Process

1. Update documentation if needed
2. Add tests for new features
3. Ensure CI passes
4. Request review from maintainers

## 🐛 Bug Reports

Use the GitHub issue template and include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details

## 💡 Feature Requests

- Check existing issues first
- Provide clear use case
- Consider implementation complexity
- Discuss with maintainers before large changes