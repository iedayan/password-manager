# 🚀 Vercel + Railway Deployment Guide

## Quick Deploy (5 minutes)

### 1. Backend on Railway
```bash
# Connect GitHub repo to Railway
railway login
railway new
railway add postgresql
railway deploy
```

### 2. Frontend on Vercel
```bash
# Connect GitHub repo to Vercel
vercel --prod
```

## Step-by-Step Instructions

### Backend (Railway)
1. Push code to GitHub
2. Go to [railway.app](https://railway.app)
3. Click "Deploy from GitHub repo"
4. Select your repository
5. Add PostgreSQL service
6. Set environment variables:
   ```
   SECRET_KEY=your-secret-key
   JWT_SECRET_KEY=your-jwt-secret
   ENCRYPTION_KEY=your-encryption-key
   FLASK_ENV=production
   ```
7. Deploy automatically triggers

### Frontend (Vercel)
1. Go to [vercel.com](https://vercel.com)
2. Import GitHub repository
3. Set build settings:
   - Framework: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add environment variable:
   ```
   VITE_API_URL=https://your-railway-app.railway.app
   ```
5. Deploy

## Environment Variables

### Railway (Backend)
```bash
SECRET_KEY=$(openssl rand -hex 32)
JWT_SECRET_KEY=$(openssl rand -hex 32)
ENCRYPTION_KEY=$(python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())")
FLASK_ENV=production
DATABASE_URL=postgresql://... # Auto-provided by Railway
```

### Vercel (Frontend)
```bash
VITE_API_URL=https://your-app-name.railway.app
```

## Chrome Extension Setup
1. Build extension: `cd extension && npm run build`
2. Load unpacked in Chrome Developer Mode
3. Update API URL in `popup.js` to your Railway URL

## Post-Deployment
- ✅ Test API health: `https://your-app.railway.app/health`
- ✅ Test frontend: `https://your-app.vercel.app`
- ✅ Test Chrome extension login
- ✅ Verify password save/fill functionality

## Costs
- **Railway**: Free tier (500 hours/month)
- **Vercel**: Free tier (100GB bandwidth)
- **Total**: $0/month for MVP usage