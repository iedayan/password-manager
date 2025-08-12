# 🔐 Lok Password Manager

Enterprise-grade password manager with zero-knowledge encryption and AI-powered security.

## 🚀 Quick Start

### Deploy to Cloud (Recommended)
```bash
cd deployment/scripts
chmod +x deploy-cloud.sh
./deploy-cloud.sh
```

### Local Development
```bash
# Backend
cd backend
pip install -r requirements.txt
python app.py

# Frontend
cd frontend
npm install
npm run dev

# Extension
Load unpacked in Chrome Developer Mode
```

## 📁 Project Structure

```
password-manager/
├── backend/           # Flask API server
├── frontend/          # React web application
├── extension/         # Chrome extension
├── deployment/        # Deployment configs & scripts
├── docs/             # Documentation
└── README.md         # This file
```

## 🔧 Features

- ✅ Zero-knowledge encryption
- ✅ Chrome extension auto-fill
- ✅ Two-factor authentication
- ✅ Password strength analysis
- ✅ Breach detection
- ✅ Security dashboard
- ✅ Cross-platform sync

## 🛡️ Security

- **Encryption**: Fernet (AES-128) with client-side encryption
- **Authentication**: JWT with 2FA support
- **Database**: Encrypted password storage
- **Monitoring**: Comprehensive audit logging

## 📚 Documentation

- [API Documentation](docs/API.md)
- [Security Guide](docs/SECURITY.md)
- [Deployment Guide](deployment/docs/DEPLOYMENT.md)
- [Project Report](docs/PROJECT_REPORT.md)

## 🚀 Deployment

- **Frontend**: Vercel (React SPA)
- **Backend**: Railway (Flask API + PostgreSQL)
- **Extension**: Chrome Web Store

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.