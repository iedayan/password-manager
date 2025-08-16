#!/bin/bash
# Vercel + Railway deployment script

echo "🚀 Deploying Lok Password Manager to Vercel + Railway"

# Check if required tools are installed
command -v vercel >/dev/null 2>&1 || { echo "Install Vercel CLI: npm i -g vercel" >&2; exit 1; }
command -v railway >/dev/null 2>&1 || { echo "Install Railway CLI: npm i -g @railway/cli" >&2; exit 1; }

# Generate secure keys
echo "🔑 Generating secure keys..."
SECRET_KEY=$(openssl rand -hex 32)
JWT_SECRET_KEY=$(openssl rand -hex 32)
ENCRYPTION_KEY=$(python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())")

echo "📝 Save these keys securely:"
echo "SECRET_KEY=${SECRET_KEY}"
echo "JWT_SECRET_KEY=${JWT_SECRET_KEY}"
echo "ENCRYPTION_KEY=${ENCRYPTION_KEY}"

# Deploy backend to Railway
echo "🚂 Deploying backend to Railway..."
railway login
railway new
railway add postgresql

# Set environment variables
railway variables set SECRET_KEY="${SECRET_KEY}"
railway variables set JWT_SECRET_KEY="${JWT_SECRET_KEY}"
railway variables set ENCRYPTION_KEY="${ENCRYPTION_KEY}"
railway variables set FLASK_ENV="production"

# Deploy backend
railway up

# Get Railway URL
RAILWAY_URL=$(railway status --json | jq -r '.deployments[0].url')
echo "✅ Backend deployed to: ${RAILWAY_URL}"

# Deploy frontend to Vercel
echo "▲ Deploying frontend to Vercel..."
cd frontend

# Set environment variable for frontend
echo "VITE_API_URL=${RAILWAY_URL}" > .env.production

# Deploy to Vercel
vercel --prod

echo "✅ Deployment complete!"
echo "🌐 Frontend: Check Vercel dashboard for URL"
echo "🔧 Backend: ${RAILWAY_URL}"
echo "📊 Database: PostgreSQL on Railway"

echo "🔒 Next steps:"
echo "1. Update Chrome extension API URL to: ${RAILWAY_URL}"
echo "2. Test login and password functionality"
echo "3. Configure custom domain (optional)"