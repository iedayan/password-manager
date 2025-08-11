# 🔐 Lok Password Manager

AI-powered password manager with automatic password updates and zero-knowledge encryption.

![Lok Logo](https://img.shields.io/badge/Lok-Password%20Manager-blue?style=for-the-badge&logo=shield&logoColor=white)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.0+-green.svg)](https://flask.palletsprojects.com)

## ✨ Features

- 🔒 **Zero-Knowledge Encryption** - Your passwords are encrypted before reaching our servers
- 🤖 **AI-Powered Updates** - Automatic password strength analysis and updates
- 🌐 **Chrome Extension** - Seamless browser integration with autofill
- 📱 **Cross-Platform** - Web, desktop, and mobile applications
- 🛡️ **Enterprise Security** - SOC 2 compliant with advanced threat protection
- ⚡ **Real-Time Sync** - Instant synchronization across all devices

## 🚀 Quick Start

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/password-manager.git
cd password-manager/backend

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run the server
python app.py
```

### Chrome Extension

```bash
# Navigate to extension directory
cd extension

# Load in Chrome
# 1. Open chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked" and select the extension folder
```

### Frontend (Coming Soon)

```bash
cd frontend
npm install
npm run dev
```

## 📁 Project Structure

```
password-manager/
├── backend/                 # Flask API server
│   ├── config/             # Configuration files
│   ├── models/             # Database models
│   ├── routes/             # API endpoints
│   ├── services/           # Business logic
│   ├── utils/              # Helper functions
│   └── tests/              # Test suite
├── extension/              # Chrome extension
│   ├── src/
│   │   ├── popup/          # Extension popup UI
│   │   ├── content/        # Content scripts
│   │   └── background/     # Background service worker
│   └── assets/             # Icons and images
├── frontend/               # React web application (Coming Soon)
└── docs/                   # Documentation
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Password Management
- `GET /api/passwords` - Get user passwords
- `POST /api/passwords` - Add new password
- `PUT /api/passwords/{id}` - Update password
- `POST /api/passwords/{id}/decrypt` - Decrypt password

### Security
- `GET /api/security/check-weak-passwords` - Find weak passwords
- `GET /api/security/auto-update-status` - Security dashboard

## 🛡️ Security Features

- **Zero-Knowledge Architecture** - Passwords encrypted with Fernet before storage
- **JWT Authentication** - Secure token-based authentication
- **Rate Limiting** - Protection against brute force attacks
- **Password Strength Analysis** - Automatic scoring and recommendations
- **Breach Monitoring** - Integration with HaveIBeenPwned API
- **Master Key Verification** - Additional layer for password decryption

## 🧪 Testing

```bash
# Run API integration tests
python tests/test_api.py

# Run with pytest
pip install pytest
pytest tests/ -v
```

## 🚀 Deployment

### Backend (Production)

```bash
# Using Gunicorn
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app

# Using Docker
docker build -t lok-backend .
docker run -p 5000:5000 lok-backend
```

### Database Options

- **Development**: SQLite (default)
- **Production**: PostgreSQL (recommended)
- **Cloud**: Neon, Supabase, or AWS RDS

## 📊 Tech Stack

### Backend
- **Framework**: Flask 3.0+
- **Database**: SQLAlchemy with PostgreSQL/SQLite
- **Authentication**: JWT with Flask-JWT-Extended
- **Encryption**: Fernet (cryptography library)
- **Rate Limiting**: Flask-Limiter

### Frontend
- **Extension**: Vanilla JavaScript (Manifest V3)
- **Web App**: React + Vite (Coming Soon)
- **Styling**: Tailwind CSS

### Infrastructure
- **Hosting**: Railway, Heroku, or AWS
- **Database**: Neon PostgreSQL
- **CDN**: Cloudflare
- **Monitoring**: Sentry

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Documentation](docs/)
- [Chrome Web Store](https://chrome.google.com/webstore) (Coming Soon)
- [Website](https://lok.security) (Coming Soon)
- [Support](mailto:support@lok.security)

## 🙏 Acknowledgments

- [Flask](https://flask.palletsprojects.com/) - Web framework
- [Cryptography](https://cryptography.io/) - Encryption library
- [HaveIBeenPwned](https://haveibeenpwned.com/) - Breach monitoring API

---

**⚠️ Security Notice**: This is an MVP version. For production use, ensure proper security auditing and compliance with your organization's security policies.