# 🔌 API Documentation

## Base URL
- **Development**: `http://localhost:5000/api`
- **Production**: `https://your-app.railway.app/api`

## Authentication
All protected endpoints require JWT token:
```
Authorization: Bearer <jwt_token>
```

## Endpoints

### Auth
- `POST /auth/register` - Register user
- `POST /auth/login` - Login user

### Passwords
- `GET /passwords` - Get user passwords
- `POST /passwords` - Add password
- `PUT /passwords/{id}` - Update password
- `DELETE /passwords/{id}` - Delete password
- `POST /passwords/{id}/decrypt` - Decrypt password

### Security
- `GET /security/dashboard` - Security overview
- `POST /security/check-breaches` - Check password breaches
- `POST /security/2fa/setup` - Setup 2FA
- `POST /security/2fa/enable` - Enable 2FA

### Health
- `GET /health` - Health check
- `GET /ready` - Readiness probe
- `GET /live` - Liveness probe