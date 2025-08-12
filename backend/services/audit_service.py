from datetime import datetime, timedelta
from sqlalchemy import func
from models.user import User
from models.password import Password, PasswordUpdateLog
from config.extensions import db
import logging

logger = logging.getLogger(__name__)

class AuditService:
    """Comprehensive audit and monitoring service"""
    
    @staticmethod
    def get_security_dashboard(user_id: int) -> dict:
        """Get comprehensive security dashboard data"""
        user = User.query.get(user_id)
        if not user:
            return {}
        
        passwords = Password.query.filter_by(user_id=user_id).all()
        
        # Password strength analysis
        strength_distribution = {
            'very_weak': 0, 'weak': 0, 'moderate': 0, 'strong': 0, 'very_strong': 0
        }
        
        weak_passwords = []
        compromised_passwords = []
        duplicate_passwords = {}
        old_passwords = []
        
        for password in passwords:
            # Strength distribution
            if password.strength_score >= 80:
                strength_distribution['very_strong'] += 1
            elif password.strength_score >= 60:
                strength_distribution['strong'] += 1
            elif password.strength_score >= 40:
                strength_distribution['moderate'] += 1
            elif password.strength_score >= 20:
                strength_distribution['weak'] += 1
            else:
                strength_distribution['very_weak'] += 1
            
            # Weak passwords
            if password.strength_score < 40:
                weak_passwords.append({
                    'id': password.id,
                    'site_name': password.site_name,
                    'strength_score': password.strength_score
                })
            
            # Compromised passwords
            if password.is_compromised:
                compromised_passwords.append({
                    'id': password.id,
                    'site_name': password.site_name
                })
            
            # Old passwords (not updated in 90 days)
            if password.last_updated < datetime.utcnow() - timedelta(days=90):
                old_passwords.append({
                    'id': password.id,
                    'site_name': password.site_name,
                    'last_updated': password.last_updated.isoformat()
                })
        
        # Recent activity
        recent_updates = PasswordUpdateLog.query.join(Password).filter(
            Password.user_id == user_id,
            PasswordUpdateLog.updated_at >= datetime.utcnow() - timedelta(days=30)
        ).order_by(PasswordUpdateLog.updated_at.desc()).limit(10).all()
        
        recent_activity = [{
            'id': log.id,
            'password_id': log.password_id,
            'old_strength': log.old_strength,
            'new_strength': log.new_strength,
            'reason': log.update_reason,
            'updated_at': log.updated_at.isoformat(),
            'success': log.success
        } for log in recent_updates]
        
        # Security score calculation
        total_passwords = len(passwords)
        if total_passwords == 0:
            security_score = 100
        else:
            weak_penalty = len(weak_passwords) * 10
            compromised_penalty = len(compromised_passwords) * 20
            old_penalty = len(old_passwords) * 5
            
            security_score = max(0, 100 - weak_penalty - compromised_penalty - old_penalty)
        
        return {
            'security_score': security_score,
            'total_passwords': total_passwords,
            'strength_distribution': strength_distribution,
            'weak_passwords': weak_passwords,
            'compromised_passwords': compromised_passwords,
            'old_passwords': old_passwords,
            'recent_activity': recent_activity,
            'recommendations': AuditService._generate_recommendations(
                weak_passwords, compromised_passwords, old_passwords
            )
        }
    
    @staticmethod
    def _generate_recommendations(weak_passwords, compromised_passwords, old_passwords) -> list:
        """Generate security recommendations"""
        recommendations = []
        
        if weak_passwords:
            recommendations.append({
                'type': 'weak_passwords',
                'priority': 'high',
                'message': f'You have {len(weak_passwords)} weak passwords that should be updated',
                'action': 'Update weak passwords'
            })
        
        if compromised_passwords:
            recommendations.append({
                'type': 'compromised',
                'priority': 'critical',
                'message': f'You have {len(compromised_passwords)} compromised passwords',
                'action': 'Change compromised passwords immediately'
            })
        
        if old_passwords:
            recommendations.append({
                'type': 'old_passwords',
                'priority': 'medium',
                'message': f'You have {len(old_passwords)} passwords not updated in 90+ days',
                'action': 'Consider updating old passwords'
            })
        
        if not weak_passwords and not compromised_passwords and len(old_passwords) < 3:
            recommendations.append({
                'type': 'good_security',
                'priority': 'info',
                'message': 'Your password security looks good!',
                'action': 'Keep up the good security practices'
            })
        
        return recommendations
    
    @staticmethod
    def log_password_access(password_id: int, user_id: int, access_type: str = 'view'):
        """Log password access for audit trail"""
        try:
            # In a production system, you'd want a separate audit log table
            logger.info(f"PASSWORD_ACCESS: User {user_id} accessed password {password_id} - Type: {access_type}")
            
            # Update last_accessed timestamp
            password = Password.query.filter_by(id=password_id, user_id=user_id).first()
            if password:
                password.last_accessed = datetime.utcnow()
                db.session.commit()
                
        except Exception as e:
            logger.error(f"Failed to log password access: {e}")
    
    @staticmethod
    def get_user_activity_summary(user_id: int, days: int = 30) -> dict:
        """Get user activity summary"""
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        # Password updates
        updates = PasswordUpdateLog.query.join(Password).filter(
            Password.user_id == user_id,
            PasswordUpdateLog.updated_at >= cutoff_date
        ).count()
        
        # Password accesses (from last_accessed field)
        accesses = Password.query.filter(
            Password.user_id == user_id,
            Password.last_accessed >= cutoff_date
        ).count()
        
        # New passwords added
        new_passwords = Password.query.filter(
            Password.user_id == user_id,
            Password.created_at >= cutoff_date
        ).count()
        
        return {
            'period_days': days,
            'password_updates': updates,
            'password_accesses': accesses,
            'new_passwords': new_passwords,
            'total_activity': updates + accesses + new_passwords
        }

# Global instance
audit_service = AuditService()