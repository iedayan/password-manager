"""
Site Model - Represents websites/services where users have accounts
"""

from datetime import datetime
from urllib.parse import urlparse
import requests
import base64
from typing import Optional, Dict

from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, Index
from sqlalchemy.orm import relationship
from config.database import db


class Site(db.Model):
    """
    Site model represents websites/services where users store passwords

    This model serves multiple purposes:
    1. Normalize site data across all users
    2. Store site metadata (logos, categories, etc.)
    3. Enable site-based analytics and suggestions
    4. Support auto-detection of login forms
    """

    __tablename__ = "sites"

    # Primary fields
    id = Column(Integer, primary_key=True)
    domain = Column(String(255), unique=True, nullable=False)  # e.g., "google.com"
    url = Column(
        String(500), nullable=False
    )  # Full URL, e.g., "https://accounts.google.com"
    name = Column(String(255), nullable=False)  # Display name, e.g., "Google"

    # Metadata
    logo_url = Column(String(500))  # URL to site logo/favicon
    logo_data = Column(Text)  # Base64 encoded logo data (fallback)
    category = Column(String(100))  # e.g., "Social Media", "Banking", "Email"
    description = Column(Text)  # Site description

    # Login form detection
    login_url = Column(String(500))  # Direct URL to login page
    username_selector = Column(String(200))  # CSS selector for username field
    password_selector = Column(String(200))  # CSS selector for password field
    login_button_selector = Column(String(200))  # CSS selector for login button

    # Security and trust indicators
    has_2fa = Column(Boolean, default=False)  # Site supports 2FA
    security_score = Column(Integer)  # Site security score (1-10)
    is_trusted = Column(Boolean, default=True)  # Is this a legitimate site?

    # Analytics and popularity
    user_count = Column(Integer, default=0)  # How many users have accounts here
    popularity_rank = Column(Integer)  # Global popularity ranking

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_favicon_fetch = Column(DateTime)  # Last time we fetched the favicon

    # Relationships
    password_entries = relationship(
        "PasswordEntry", back_populates="site", lazy="dynamic"
    )

    # Indexes for better query performance
    __table_args__ = (
        Index("idx_site_domain", "domain"),
        Index("idx_site_category", "category"),
        Index("idx_site_popularity", "popularity_rank"),
    )

    def __init__(self, domain, url, name=None, **kwargs):
        self.domain = self._normalize_domain(domain)
        self.url = url
        self.name = name or self._generate_name_from_domain(self.domain)

        # Set other attributes
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)

    def __repr__(self):
        return f"<Site {self.domain}>"

    @staticmethod
    def _normalize_domain(domain_or_url: str) -> str:
        """Extract and normalize domain from URL or domain string"""
        if not domain_or_url:
            raise ValueError("Domain cannot be empty")

        # Remove protocol if present
        if domain_or_url.startswith(("http://", "https://")):
            parsed = urlparse(domain_or_url)
            domain = parsed.netloc
        else:
            domain = domain_or_url

        # Remove www. prefix and convert to lowercase
        domain = domain.lower()
        if domain.startswith("www."):
            domain = domain[4:]

        return domain

    @staticmethod
    def _generate_name_from_domain(domain: str) -> str:
        """Generate a display name from domain"""
        # Remove TLD and capitalize
        parts = domain.split(".")
        if len(parts) > 1:
            name = parts[0]
        else:
            name = domain

        return name.capitalize()

    def fetch_favicon(self) -> bool:
        """
        Fetch and store the site's favicon
        Returns True if successful
        """
        try:
            # Try common favicon URLs
            favicon_urls = [
                f"https://{self.domain}/favicon.ico",
                f"https://www.{self.domain}/favicon.ico",
                f"https://{self.domain}/favicon.png",
                f"https://www.google.com/s2/favicons?domain={self.domain}",  # Google's favicon service
            ]

            for favicon_url in favicon_urls:
                try:
                    response = requests.get(favicon_url, timeout=5)
                    if response.status_code == 200 and len(response.content) > 0:
                        # Store as base64
                        self.logo_data = base64.b64encode(response.content).decode(
                            "utf-8"
                        )
                        self.logo_url = favicon_url
                        self.last_favicon_fetch = datetime.utcnow()
                        return True
                except requests.RequestException:
                    continue

            return False

        except Exception as e:
            print(f"Error fetching favicon for {self.domain}: {e}")
            return False

    def get_logo_data_url(self) -> Optional[str]:
        """Get data URL for the logo (for use in HTML img src)"""
        if self.logo_data:
            # Assume it's an ICO file if no specific type detected
            return f"data:image/x-icon;base64,{self.logo_data}"
        return None

    def increment_user_count(self):
        """Increment the user count for this site"""
        self.user_count = (self.user_count or 0) + 1
        self.updated_at = datetime.utcnow()

    def decrement_user_count(self):
        """Decrement the user count for this site"""
        if self.user_count and self.user_count > 0:
            self.user_count -= 1
            self.updated_at = datetime.utcnow()

    def to_dict(self) -> Dict:
        """Convert site to dictionary for API responses"""
        return {
            "id": self.id,
            "domain": self.domain,
            "url": self.url,
            "name": self.name,
            "logo_url": self.logo_url,
            "logo_data_url": self.get_logo_data_url(),
            "category": self.category,
            "description": self.description,
            "login_url": self.login_url,
            "has_2fa": self.has_2fa,
            "security_score": self.security_score,
            "user_count": self.user_count,
            "popularity_rank": self.popularity_rank,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
