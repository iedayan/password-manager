# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security vulnerability in Lok Password Manager, please report it responsibly.

### How to Report

1. **Email**: Send details to security@lok.com
2. **Do NOT** create a public GitHub issue for security vulnerabilities
3. **Include**: 
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect

- **Acknowledgment**: Within 24 hours
- **Initial Assessment**: Within 72 hours
- **Regular Updates**: Every 7 days until resolved
- **Resolution Timeline**: Critical issues within 7 days, others within 30 days

### Security Measures

- **Zero-Knowledge Architecture**: We never see your passwords
- **AES-256 Encryption**: Military-grade encryption for all data
- **Bcrypt Hashing**: Secure password hashing with salt
- **Rate Limiting**: Protection against brute force attacks
- **Account Lockout**: Automatic lockout after failed attempts
- **Security Headers**: OWASP-compliant security headers
- **Input Validation**: Comprehensive input sanitization
- **SQL Injection Prevention**: Parameterized queries only

### Responsible Disclosure

We follow responsible disclosure practices:

1. **Report received** → Investigation begins
2. **Vulnerability confirmed** → Fix development starts
3. **Fix deployed** → Security advisory published
4. **Public disclosure** → After users have time to update

### Bug Bounty

We're planning a bug bounty program. Stay tuned for updates!

## Security Best Practices for Users

- Use a strong, unique master password
- Enable two-factor authentication
- Keep your browser and apps updated
- Use HTTPS-only websites
- Log out from shared devices
- Report suspicious activity immediately

## Contact

For security-related questions: security@lok.com
For general support: support@lok.com