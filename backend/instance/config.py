# Production configuration - use environment variables
import os

SECRET_KEY = os.environ.get('SECRET_KEY')
JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY')
ENCRYPTION_KEY = os.environ.get('ENCRYPTION_KEY')

# Database
DATABASE_URL = os.environ.get('DATABASE_URL')

# Email settings
MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')