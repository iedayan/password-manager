#!/bin/bash
# Quick deployment script for Lok Password Manager

echo "🔐 Deploying Lok Password Manager..."

# Check if required tools are installed
command -v docker >/dev/null 2>&1 || { echo "Docker required but not installed. Aborting." >&2; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "Docker Compose required but not installed. Aborting." >&2; exit 1; }

# Generate secure keys
echo "🔑 Generating secure keys..."
export SECRET_KEY=$(openssl rand -hex 32)
export JWT_SECRET_KEY=$(openssl rand -hex 32)
export ENCRYPTION_KEY=$(python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())")

# Create .env file
cat > .env << EOF
SECRET_KEY=${SECRET_KEY}
JWT_SECRET_KEY=${JWT_SECRET_KEY}
ENCRYPTION_KEY=${ENCRYPTION_KEY}
DATABASE_URL=postgresql://postgres:password@db:5432/lok_passwords
REDIS_URL=redis://redis:6379/0
FLASK_ENV=production
EOF

echo "✅ Environment configured"

# Start services
echo "🚀 Starting services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Check health
echo "🏥 Checking service health..."
curl -f http://localhost:5000/health || echo "❌ Backend health check failed"
curl -f http://localhost:3000 || echo "❌ Frontend health check failed"

echo "✅ Deployment complete!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:5000"
echo "📊 Database: PostgreSQL on port 5432"

echo "🔒 Your encryption key: ${ENCRYPTION_KEY}"
echo "⚠️  Save this key securely - you'll need it for data recovery!"