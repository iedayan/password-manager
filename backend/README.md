# Lok Password Manager Backend

Flask-based backend for the Lok password manager with automatic password updates.

## Features

- **Zero-knowledge encryption** - Passwords encrypted client-side and server-side
- **Automatic password updates** - Browser automation to update weak passwords
- **Breach monitoring** - Integration with Have I Been Pwned API
- **JWT authentication** - Secure user authentication
- **Rate limiting** - Protection against brute force attacks
- **Background tasks** - Scheduled security checks and updates

## Setup

1. **Install dependencies:**
```bash
pip install -r requirements.txt
```

2. **Install Playwright browsers:**
```bash
playwright install
```

3. **Set environment variables:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Run the application:**
```bash
python app.py
```

5. **Start the scheduler (in separate terminal):**
```bash
python scheduler.py
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Password Management
- `GET /api/passwords` - Get all passwords for user
- `POST /api/passwords` - Add new password
- `PUT /api/passwords/<id>` - Update password
- `POST /api/passwords/<id>/decrypt` - Decrypt password with master key

### Security
- `GET /api/security/check-weak-passwords` - Get weak passwords
- `GET /api/security/auto-update-status` - Get update statistics

## Architecture

### Core Components

1. **Flask App** (`app.py`) - Main API server
2. **Password Updater** (`services/password_updater.py`) - Browser automation
3. **Scheduler** (`scheduler.py`) - Background security tasks
4. **Database Models** - User, Password, PasswordUpdateLog

### Security Features

- **Encryption**: Fernet symmetric encryption for passwords
- **Hashing**: bcrypt for user passwords and master keys
- **Rate Limiting**: Flask-Limiter for API protection
- **JWT Tokens**: Secure authentication with expiration

### Automatic Updates

The system automatically:
1. Scans for weak passwords (score < 60)
2. Generates strong replacements
3. Uses browser automation to update passwords
4. Monitors for data breaches
5. Logs all update attempts

## Database Schema

```sql
-- Users table
CREATE TABLE user (
    id INTEGER PRIMARY KEY,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(128) NOT NULL,
    master_key_hash VARCHAR(128) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Passwords table
CREATE TABLE password (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES user(id),
    site_name VARCHAR(100) NOT NULL,
    site_url VARCHAR(255) NOT NULL,
    username VARCHAR(100) NOT NULL,
    encrypted_password TEXT NOT NULL,
    strength_score INTEGER DEFAULT 0,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    auto_update_enabled BOOLEAN DEFAULT TRUE,
    is_compromised BOOLEAN DEFAULT FALSE
);

-- Update logs table
CREATE TABLE password_update_log (
    id INTEGER PRIMARY KEY,
    password_id INTEGER REFERENCES password(id),
    old_strength INTEGER,
    new_strength INTEGER,
    update_reason VARCHAR(100),
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    success BOOLEAN DEFAULT FALSE
);
```

## Deployment

### Production Setup

1. **Use PostgreSQL** instead of SQLite
2. **Set strong secrets** in environment variables
3. **Use Redis** for rate limiting and caching
4. **Enable HTTPS** with proper SSL certificates
5. **Set up monitoring** and logging
6. **Use process manager** like Gunicorn + Nginx

### Environment Variables

```bash
SECRET_KEY=your-production-secret-key
JWT_SECRET_KEY=your-jwt-secret-key
DATABASE_URL=postgresql://user:pass@localhost/lok_passwords
ENCRYPTION_KEY=your-fernet-key
REDIS_URL=redis://localhost:6379/0
```

## Security Considerations

- All passwords are encrypted with Fernet (AES 128)
- Master keys are hashed with bcrypt
- Zero-knowledge architecture - server never sees plaintext passwords
- Rate limiting prevents brute force attacks
- JWT tokens expire after 24 hours
- Browser automation runs in headless mode
- Regular security scans and breach monitoring