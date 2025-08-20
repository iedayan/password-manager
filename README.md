# 🔐 Lok Password Manager

> Enterprise-grade password manager with zero-knowledge encryption and AI-powered security

[![Security](https://img.shields.io/badge/Security-Military%20Grade-green)](https://github.com/iedayan/password-manager)
[![Encryption](https://img.shields.io/badge/Encryption-AES%20256-blue)](https://github.com/iedayan/password-manager)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- Git

### Development Setup

```bash
# Clone the repository
git clone https://github.com/iedayan/password-manager.git
cd password-manager

# Backend setup
cd backend
pip install -r requirements.txt
python app.py

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` to access the application.

## 📁 Project Structure

```
password-manager/
├── backend/              # Flask API server
│   ├── models/          # Database models
│   ├── routes/          # API endpoints
│   ├── services/        # Business logic
│   ├── config/          # Configuration
│   └── middleware/      # Security middleware
├── frontend/            # React web application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── lib/         # Utilities
│   │   └── hooks/       # Custom hooks
├── extension/           # Browser extension (planned)
├── deployment/          # Deployment configs
└── docs/               # Documentation
```

## ✨ Features

### 🔒 Core Security
- **Zero-Knowledge Encryption** - Your data is encrypted locally
- **AES-256 Encryption** - Military-grade security
- **Master Password** - Single password to access everything
- **Two-Factor Authentication** - TOTP support
- **Account Lockout** - Protection against brute force

### 🛡️ Password Management
- **Secure Vault** - Store unlimited passwords
- **Password Generator** - Create strong, unique passwords
- **Password Health** - Detect weak and reused passwords
- **Breach Monitoring** - Dark web monitoring alerts
- **Auto-Fill Ready** - Prepare for browser extension

### 🌐 Web Application
- **Responsive Design** - Works on all devices
- **Real-time Search** - Find passwords instantly
- **Import/Export** - Migrate from other managers
- **Secure Sharing** - Share passwords safely
- **Cross-Platform Sync** - Access anywhere

## 🏗️ Architecture

### Backend (Flask)
- **RESTful API** - Clean, documented endpoints
- **SQLAlchemy ORM** - Database abstraction
- **JWT Authentication** - Stateless authentication
- **Rate Limiting** - DDoS protection
- **Security Headers** - OWASP compliance

### Frontend (React)
- **Modern UI/UX** - Security-themed design
- **Component Architecture** - Reusable components
- **State Management** - Efficient data flow
- **Responsive Design** - Mobile-first approach

### Security Stack
- **Fernet Encryption** - Symmetric encryption
- **Bcrypt Hashing** - Password hashing
- **CORS Protection** - Cross-origin security
- **Input Validation** - Prevent injection attacks

## 🔧 Configuration

### Environment Variables

Create `.env` files in both `backend/` and `frontend/` directories:

**Backend (.env):**
```env
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here
DATABASE_URL=sqlite:///lok_passwords.db
ENCRYPTION_KEY=your-fernet-encryption-key-here
FLASK_ENV=development
```

**Frontend (.env.local):**
```env
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=Lok Password Manager
```

## 📊 Development Status

### ✅ Implemented
- [x] User authentication (register/login)
- [x] Password CRUD operations
- [x] Encryption service
- [x] Security middleware
- [x] Responsive web interface
- [x] Password generator
- [x] Search functionality
- [x] Add/Edit password modals
- [x] Security dashboard
- [x] Two-factor authentication (TOTP)
- [x] Import/export functionality
- [x] Password health checks
- [x] Password strength analysis
- [x] Onboarding flow
- [x] Advanced security features
- [x] Browser extension (basic structure)
- [x] Mobile-responsive design
- [x] Auto-update system
- [x] Breach detection service
- [x] AI-powered security analysis

### 🚧 In Progress
- [ ] Browser extension auto-fill
- [ ] Advanced sharing features
- [ ] Enterprise admin panel
- [ ] Mobile applications
- [ ] Desktop application

### 📋 Planned
- [ ] Cross-platform sync
- [ ] Team management
- [ ] Advanced reporting
- [ ] API for third-party integrations
- [ ] Compliance certifications

## 🛠️ API Documentation

### Authentication
```bash
# Register
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "secure_password",
  "master_key": "optional_master_key"
}

# Login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "secure_password"
}
```

### Password Management
```bash
# Get all passwords
GET /api/passwords
Authorization: Bearer <token>

# Add password
POST /api/passwords
{
  "site_name": "Example Site",
  "site_url": "https://example.com",
  "username": "user@example.com",
  "password": "encrypted_password"
}

# Decrypt password
POST /api/passwords/{id}/decrypt
{
  "master_key": "user_master_key"
}
```

## 🚀 Deployment

### Development
```bash
# Backend
cd backend && python app.py

# Frontend
cd frontend && npm run dev
```

### Production
```bash
# Build frontend
cd frontend && npm run build

# Deploy backend
cd backend && gunicorn app:app

# Or use Docker
docker-compose up -d
```

## 🔒 Security Features

### Encryption
- **Client-side encryption** before data leaves your device
- **Zero-knowledge architecture** - we never see your passwords
- **Fernet encryption** (AES-128) with authenticated encryption
- **Secure key derivation** from master password

### Authentication
- **JWT tokens** with expiration
- **Rate limiting** on all endpoints
- **Account lockout** after failed attempts
- **Secure session management**

### Infrastructure
- **HTTPS enforcement** in production
- **Security headers** (CSP, HSTS, etc.)
- **Input validation** and sanitization
- **SQL injection prevention**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style
- Add tests for new features
- Update documentation
- Ensure security best practices

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🛡️ Security

### Reporting Vulnerabilities
If you discover a security vulnerability, please send an email to security@lok.com instead of using the issue tracker.

### Security Audits
- Regular third-party security audits
- Automated vulnerability scanning
- Penetration testing
- Bug bounty program (coming soon)

## 📞 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/iedayan/password-manager/issues)
- **Email**: support@lok.com
- **Discord**: [Join our community](https://discord.gg/lok)

## 🗺️ Roadmap

### Q1 2024
- [ ] Complete web application
- [ ] Browser extension (Chrome, Firefox)
- [ ] Import from major password managers

### Q2 2024
- [ ] Desktop applications (Windows, macOS, Linux)
- [ ] Advanced security features
- [ ] Team/family sharing

### Q3 2024
- [ ] Mobile applications (iOS, Android)
- [ ] Enterprise features
- [ ] API for third-party integrations

### Q4 2024
- [ ] Advanced AI security features
- [ ] Compliance certifications (SOC 2, ISO 27001)
- [ ] Global expansion

---

**Built with ❤️ for security and privacy**

*Lok Password Manager - Your digital life, secured.*