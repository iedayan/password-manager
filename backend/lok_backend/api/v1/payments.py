"""Payment and subscription API endpoints."""

import stripe
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timezone, timedelta

from ...models.user import User
from ...models.subscription import Subscription
from ...core.database import db
from ...core.extensions import limiter

payments_bp = Blueprint("payments", __name__)

# Initialize Stripe
stripe.api_key = current_app.config.get('STRIPE_SECRET_KEY')

PRICING_TIERS = {
    'personal': {
        'price_id': 'price_personal_monthly',
        'name': 'Personal',
        'price': 6.00,
        'features': ['Unlimited passwords', 'AI-powered analysis', 'Cross-platform sync', '2FA', 'Basic breach monitoring']
    },
    'family': {
        'price_id': 'price_family_monthly', 
        'name': 'Family',
        'price': 15.00,
        'features': ['Everything in Personal', 'Up to 6 family members', 'Advanced AI security', 'Family dashboard', 'Emergency access']
    },
    'enterprise': {
        'price_id': 'price_enterprise_monthly',
        'name': 'Enterprise', 
        'price': 35.00,
        'features': ['Everything in Family', 'Unlimited team members', 'ML threat intelligence', 'SSO integration', 'API access']
    }
}

@payments_bp.route("/create-customer", methods=["POST"])
@jwt_required()
@limiter.limit("5 per minute")
def create_customer():
    """Create Stripe customer for user."""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({"error": "User not found"}), 404
            
        # Check if customer already exists
        if user.subscription and user.subscription.stripe_customer_id:
            return jsonify({"customer_id": user.subscription.stripe_customer_id}), 200
            
        # Create Stripe customer
        customer = stripe.Customer.create(
            email=user.email,
            metadata={"user_id": user_id}
        )
        
        # Create or update subscription record
        if not user.subscription:
            subscription = Subscription(user_id=user_id)
            db.session.add(subscription)
        else:
            subscription = user.subscription
            
        subscription.stripe_customer_id = customer.id
        db.session.commit()
        
        return jsonify({"customer_id": customer.id}), 200
        
    except Exception as e:
        current_app.logger.error(f"Customer creation failed: {str(e)}")
        return jsonify({"error": "Failed to create customer"}), 500

@payments_bp.route("/create-subscription", methods=["POST"])
@jwt_required()
@limiter.limit("3 per minute")
def create_subscription():
    """Create subscription for user."""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user or not user.subscription:
            return jsonify({"error": "User or subscription not found"}), 404
            
        data = request.get_json()
        tier = data.get('tier')
        payment_method_id = data.get('payment_method_id')
        
        if tier not in PRICING_TIERS:
            return jsonify({"error": "Invalid tier"}), 400
            
        # Attach payment method to customer
        stripe.PaymentMethod.attach(
            payment_method_id,
            customer=user.subscription.stripe_customer_id
        )
        
        # Set as default payment method
        stripe.Customer.modify(
            user.subscription.stripe_customer_id,
            invoice_settings={'default_payment_method': payment_method_id}
        )
        
        # Create subscription
        subscription = stripe.Subscription.create(
            customer=user.subscription.stripe_customer_id,
            items=[{'price': PRICING_TIERS[tier]['price_id']}],
            expand=['latest_invoice.payment_intent']
        )
        
        # Update local subscription
        user.subscription.stripe_subscription_id = subscription.id
        user.subscription.tier = tier
        user.subscription.status = subscription.status
        user.subscription.current_period_start = datetime.fromtimestamp(
            subscription.current_period_start, tz=timezone.utc
        )
        user.subscription.current_period_end = datetime.fromtimestamp(
            subscription.current_period_end, tz=timezone.utc
        )
        user.subscription.update_limits_for_tier()
        db.session.commit()
        
        return jsonify({
            "subscription_id": subscription.id,
            "status": subscription.status,
            "client_secret": subscription.latest_invoice.payment_intent.client_secret
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Subscription creation failed: {str(e)}")
        return jsonify({"error": "Failed to create subscription"}), 500

@payments_bp.route("/cancel-subscription", methods=["POST"])
@jwt_required()
@limiter.limit("3 per minute")
def cancel_subscription():
    """Cancel user subscription."""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user or not user.subscription or not user.subscription.stripe_subscription_id:
            return jsonify({"error": "No active subscription found"}), 404
            
        # Cancel at period end
        stripe.Subscription.modify(
            user.subscription.stripe_subscription_id,
            cancel_at_period_end=True
        )
        
        user.subscription.status = 'canceled'
        db.session.commit()
        
        return jsonify({"message": "Subscription will cancel at period end"}), 200
        
    except Exception as e:
        current_app.logger.error(f"Subscription cancellation failed: {str(e)}")
        return jsonify({"error": "Failed to cancel subscription"}), 500

@payments_bp.route("/subscription-status", methods=["GET"])
@jwt_required()
def get_subscription_status():
    """Get user subscription status."""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({"error": "User not found"}), 404
            
        if not user.subscription:
            # Create free subscription
            subscription = Subscription(user_id=user_id)
            db.session.add(subscription)
            db.session.commit()
            
        return jsonify({
            "tier": user.subscription.tier,
            "status": user.subscription.status,
            "is_active": user.subscription.is_active,
            "current_period_end": user.subscription.current_period_end.isoformat() if user.subscription.current_period_end else None,
            "password_limit": user.subscription.password_limit,
            "features": {
                "can_use_2fa": user.subscription.can_use_2fa,
                "can_import_export": user.subscription.can_import_export,
                "can_use_advanced_security": user.subscription.can_use_advanced_security
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Subscription status check failed: {str(e)}")
        return jsonify({"error": "Failed to get subscription status"}), 500

@payments_bp.route("/pricing", methods=["GET"])
def get_pricing():
    """Get pricing information."""
    return jsonify({
        "tiers": PRICING_TIERS,
        "free": {
            "name": "Free",
            "price": 0,
            "features": ["Up to 50 passwords", "Basic security", "Password generator"]
        }
    }), 200

@payments_bp.route("/webhook", methods=["POST"])
@limiter.limit("100 per minute")
def stripe_webhook():
    """Handle Stripe webhooks."""
    payload = request.get_data()
    sig_header = request.headers.get('Stripe-Signature')
    endpoint_secret = current_app.config.get('STRIPE_WEBHOOK_SECRET')
    
    try:
        event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
    except ValueError:
        return jsonify({"error": "Invalid payload"}), 400
    except stripe.error.SignatureVerificationError:
        return jsonify({"error": "Invalid signature"}), 400
    
    # Handle subscription events
    if event['type'] == 'customer.subscription.updated':
        subscription = event['data']['object']
        _update_subscription_from_stripe(subscription)
    elif event['type'] == 'customer.subscription.deleted':
        subscription = event['data']['object']
        _cancel_subscription_from_stripe(subscription)
    elif event['type'] == 'invoice.payment_failed':
        invoice = event['data']['object']
        _handle_payment_failure(invoice)
    
    return jsonify({"status": "success"}), 200

def _update_subscription_from_stripe(stripe_subscription):
    """Update local subscription from Stripe data."""
    try:
        subscription = Subscription.query.filter_by(
            stripe_subscription_id=stripe_subscription['id']
        ).first()
        
        if subscription:
            subscription.status = stripe_subscription['status']
            subscription.current_period_start = datetime.fromtimestamp(
                stripe_subscription['current_period_start'], tz=timezone.utc
            )
            subscription.current_period_end = datetime.fromtimestamp(
                stripe_subscription['current_period_end'], tz=timezone.utc
            )
            db.session.commit()
    except Exception as e:
        current_app.logger.error(f"Failed to update subscription: {str(e)}")

def _cancel_subscription_from_stripe(stripe_subscription):
    """Cancel local subscription from Stripe data."""
    try:
        subscription = Subscription.query.filter_by(
            stripe_subscription_id=stripe_subscription['id']
        ).first()
        
        if subscription:
            subscription.status = 'canceled'
            subscription.tier = 'free'
            subscription.update_limits_for_tier()
            db.session.commit()
    except Exception as e:
        current_app.logger.error(f"Failed to cancel subscription: {str(e)}")

def _handle_payment_failure(invoice):
    """Handle failed payment."""
    try:
        customer_id = invoice['customer']
        subscription = Subscription.query.filter_by(
            stripe_customer_id=customer_id
        ).first()
        
        if subscription:
            subscription.status = 'past_due'
            db.session.commit()
    except Exception as e:
        current_app.logger.error(f"Failed to handle payment failure: {str(e)}")