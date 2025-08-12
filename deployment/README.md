# 🚀 Deployment Guide

## Quick Deploy
```bash
cd deployment/scripts
chmod +x deploy-cloud.sh
./deploy-cloud.sh
```

## Structure
```
deployment/
├── scripts/           # Deployment automation
│   ├── deploy-cloud.sh       # Vercel + Railway deploy
│   ├── deploy.sh            # Local Docker deploy
│   └── deploy-production.sh # VPS deploy
├── configs/           # Platform configurations
│   ├── vercel.json          # Vercel settings
│   ├── railway.json         # Railway settings
│   └── docker-compose.yml   # Docker config
└── docs/             # Deployment documentation
    └── DEPLOYMENT.md        # Detailed guide
```

## Platforms
- **Vercel**: Frontend hosting (React SPA)
- **Railway**: Backend API + PostgreSQL
- **Chrome Store**: Extension distribution

## Environment Variables
```bash
# Backend (Railway)
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
ENCRYPTION_KEY=your-fernet-key
FLASK_ENV=production

# Frontend (Vercel)
VITE_API_URL=https://your-app.railway.app
```