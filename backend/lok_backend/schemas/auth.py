"""Authentication schemas for request/response validation."""

from pydantic import BaseModel, EmailStr, validator


class UserRegistration(BaseModel):
    """Schema for user registration."""
    email: EmailStr
    password: str
    confirm_password: str
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if len(v) > 128:
            raise ValueError('Password must be less than 128 characters')
        return v
    
    @validator('confirm_password')
    def passwords_match(cls, v, values):
        if 'password' in values and v != values['password']:
            raise ValueError('Passwords do not match')
        return v


class UserLogin(BaseModel):
    """Schema for user login."""
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    """Schema for authentication response."""
    access_token: str
    user_id: int
    message: str