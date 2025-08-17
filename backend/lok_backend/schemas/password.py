"""Password schemas for request/response validation."""

from pydantic import BaseModel, HttpUrl
from typing import Optional


class PasswordCreate(BaseModel):
    """Schema for creating a password."""
    site_name: str
    site_url: Optional[HttpUrl] = None
    username: str
    password: str
    notes: Optional[str] = None


class PasswordUpdate(BaseModel):
    """Schema for updating a password."""
    site_name: Optional[str] = None
    site_url: Optional[HttpUrl] = None
    username: Optional[str] = None
    password: Optional[str] = None
    notes: Optional[str] = None


class PasswordResponse(BaseModel):
    """Schema for password response."""
    id: int
    site_name: str
    site_url: Optional[str]
    username: str
    notes: Optional[str]
    created_at: str
    updated_at: str
    
    class Config:
        from_attributes = True