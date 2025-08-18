"""Optimized pricing configuration for Lok Password Manager."""

# Updated pricing structure based on market analysis and AI/ML features

PRICING_PLANS = {
    "personal": {
        "name": "Personal",
        "price_monthly": 6.00,
        "price_yearly": 60.00,  # 2 months free (16.7% savings)
        "description": "Perfect for individuals",
        "max_users": 1,
        "storage_gb": 1,
        "ai_features": True,
        "features": [
            "Unlimited passwords & secure notes",
            "AI-powered password strength analysis", 
            "Cross-platform sync (iOS, Android, Web)",
            "Smart password generator with ML",
            "Basic breach monitoring",
            "Two-factor authentication (2FA)",
            "Email support",
            "1GB encrypted file storage",
            "Password health dashboard"
        ]
    },
    
    "family": {
        "name": "Family", 
        "price_monthly": 15.00,
        "price_yearly": 150.00,  # 2 months free (16.7% savings)
        "description": "AI-powered security for families",
        "max_users": 6,
        "storage_gb": 30,  # 5GB per member
        "ai_features": True,
        "popular": True,
        "features": [
            "Everything in Personal",
            "Up to 6 family members", 
            "Advanced AI security analysis",
            "Family dashboard & management",
            "Shared family vaults with smart categorization",
            "Emergency access for family",
            "Behavioral anomaly detection",
            "Priority chat support",
            "5GB encrypted file storage per member",
            "Real-time breach alerts"
        ]
    },
    
    "enterprise": {
        "name": "Enterprise",
        "price_monthly": 35.00,
        "price_yearly": 350.00,  # 2 months free (16.7% savings)
        "description": "State-of-the-art AI security for business",
        "max_users": None,  # Unlimited
        "storage_gb": None,  # Unlimited
        "ai_features": True,
        "enterprise_features": True,
        "features": [
            "Everything in Family",
            "Unlimited team members",
            "Advanced ML threat intelligence", 
            "Predictive breach analytics",
            "Quantum security assessment",
            "Advanced admin dashboard",
            "SSO integration (SAML, OIDC)",
            "Behavioral pattern analysis",
            "API access for integrations",
            "Dedicated customer success manager",
            "Unlimited encrypted file storage",
            "Custom security policies",
            "Advanced reporting & compliance"
        ]
    }
}

# Volume discounts for Enterprise
ENTERPRISE_VOLUME_PRICING = {
    "1-10": 35.00,      # Standard rate
    "11-50": 32.00,     # 8% discount  
    "51-100": 28.00,    # 20% discount
    "101-500": 25.00,   # 28% discount
    "500+": 22.00       # 37% discount
}

# Competitive analysis
MARKET_COMPARISON = {
    "our_advantage": {
        "personal": "Advanced AI features at competitive price",
        "family": "Best value with AI security for families", 
        "enterprise": "Cutting-edge ML/AI capabilities"
    },
    "positioning": {
        "personal": "Premium features at mid-market price",
        "family": "Market leader in AI-powered family security",
        "enterprise": "Enterprise-grade AI at competitive rates"
    }
}