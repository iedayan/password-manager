# Deployment Guide

## Backend Deployment

### Railway (Recommended)
1. Connect GitHub repository to Railway
2. Set environment variables:
   ```
   DATABASE_URL=postgresql://...
   SECRET_KEY=your-secret-key
   JWT_SECRET_KEY=your-jwt-secret
   ENCRYPTION_KEY=your-encryption-key
   ```
3. Deploy automatically on push

### Heroku
```bash
heroku create lok-password-manager
heroku addons:create heroku-postgresql:mini
heroku config:set SECRET_KEY=your-secret-key
git push heroku main
```

### Docker
```bash
docker build -t lok-backend .
docker run -p 5000:5000 -e DATABASE_URL=... lok-backend
```

## Database Setup

### Neon PostgreSQL
1. Create account at neon.tech
2. Create database
3. Copy connection string to DATABASE_URL

### Local PostgreSQL
```bash
createdb lok_passwords
export DATABASE_URL=postgresql://user:pass@localhost/lok_passwords
```

## Chrome Extension

### Development
1. Load unpacked extension in Chrome
2. Update API URL in manifest.json

### Production
1. Package extension
2. Submit to Chrome Web Store
3. Update host_permissions for production API

## Environment Variables

### Required
- `SECRET_KEY` - Flask secret key
- `JWT_SECRET_KEY` - JWT signing key
- `DATABASE_URL` - Database connection string
- `ENCRYPTION_KEY` - Fernet encryption key

### Optional
- `FLASK_ENV` - Environment (development/production)
- `RATELIMIT_STORAGE_URL` - Redis URL for rate limiting