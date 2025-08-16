#!/bin/bash
# Production deployment script for VPS/Server

set -e

DOMAIN=${1:-"yourdomain.com"}
EMAIL=${2:-"admin@yourdomain.com"}

echo "🔐 Production deployment for domain: $DOMAIN"

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Nginx and Certbot
sudo apt install -y nginx certbot python3-certbot-nginx

# Generate production keys
export SECRET_KEY=$(openssl rand -hex 32)
export JWT_SECRET_KEY=$(openssl rand -hex 32)
export ENCRYPTION_KEY=$(python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())")

# Create production environment
cat > .env.production << EOF
SECRET_KEY=${SECRET_KEY}
JWT_SECRET_KEY=${JWT_SECRET_KEY}
ENCRYPTION_KEY=${ENCRYPTION_KEY}
DATABASE_URL=postgresql://postgres:$(openssl rand -hex 16)@db:5432/lok_passwords
REDIS_URL=redis://redis:6379/0
FLASK_ENV=production
DOMAIN=${DOMAIN}
EOF

# Create Nginx configuration
sudo tee /etc/nginx/sites-available/lok << EOF
server {
    listen 80;
    server_name ${DOMAIN};
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
    
    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/lok /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Deploy application
docker-compose -f docker-compose.prod.yml up -d

# Setup SSL
sudo certbot --nginx -d ${DOMAIN} --email ${EMAIL} --agree-tos --non-interactive

# Setup firewall
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

echo "✅ Production deployment complete!"
echo "🌐 Your site: https://${DOMAIN}"
echo "🔑 Encryption key saved to .env.production"
echo "🔒 SSL certificate installed"