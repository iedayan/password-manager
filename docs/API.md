# Lok API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "master_key": "optional_master_key"
}
```

**Response:**
```json
{
  "access_token": "jwt_token_here",
  "user_id": 1,
  "message": "User registered successfully"
}
```

#### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "access_token": "jwt_token_here",
  "user_id": 1,
  "message": "Login successful"
}
```

### Password Management

#### Get Passwords
```http
GET /passwords
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": 1,
    "site_name": "GitHub",
    "site_url": "https://github.com",
    "username": "user@example.com",
    "strength_score": 85,
    "last_updated": "2025-01-01T12:00:00",
    "auto_update_enabled": true,
    "is_compromised": false
  }
]
```

#### Add Password
```http
POST /passwords
```

**Request Body:**
```json
{
  "site_name": "GitHub",
  "site_url": "https://github.com",
  "username": "user@example.com",
  "password": "MySecurePassword123!"
}
```

#### Decrypt Password
```http
POST /passwords/{id}/decrypt
```

**Request Body:**
```json
{
  "master_key": "user_master_key"
}
```

**Response:**
```json
{
  "password": "decrypted_password_here"
}
```

### Security

#### Check Weak Passwords
```http
GET /security/check-weak-passwords
```

#### Auto-Update Status
```http
GET /security/auto-update-status
```

## Error Responses

```json
{
  "error": "Error message here"
}
```

## Rate Limits
- Registration: 5 requests per minute
- Login: 10 requests per minute
- General: 200 requests per day, 50 per hour