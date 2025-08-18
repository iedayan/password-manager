"""User onboarding and security assessment service."""

from datetime import datetime, timezone
from typing import Dict, List, Optional
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)

@dataclass
class OnboardingStep:
    """Individual onboarding step."""
    id: str
    title: str
    description: str
    completed: bool = False
    required: bool = True
    estimated_time: int = 5  # minutes

@dataclass
class SecurityAssessment:
    """User security assessment results."""
    overall_score: int
    risk_level: str
    recommendations: List[str]
    strengths: List[str]
    weaknesses: List[str]
    next_steps: List[str]

class OnboardingService:
    """Service for user onboarding and security assessment."""
    
    def __init__(self):
        self.onboarding_steps = [
            OnboardingStep(
                id="welcome",
                title="Welcome to Lok",
                description="Learn about Lok's AI-powered security features",
                estimated_time=2
            ),
            OnboardingStep(
                id="import_passwords",
                title="Import Your Passwords",
                description="Securely import passwords from your current password manager",
                estimated_time=10
            ),
            OnboardingStep(
                id="security_assessment",
                title="Security Assessment",
                description="AI analysis of your password security",
                estimated_time=3
            ),
            OnboardingStep(
                id="setup_2fa",
                title="Enable Two-Factor Authentication",
                description="Add an extra layer of security to your account",
                estimated_time=5
            ),
            OnboardingStep(
                id="master_password",
                title="Secure Master Password",
                description="Create a strong master password",
                estimated_time=3
            ),
            OnboardingStep(
                id="browser_extension",
                title="Install Browser Extension",
                description="Get seamless auto-fill across all your devices",
                estimated_time=2,
                required=False
            ),
            OnboardingStep(
                id="mobile_app",
                title="Download Mobile App",
                description="Access your passwords on the go",
                estimated_time=2,
                required=False
            )
        ]
    
    def get_onboarding_progress(self, user_id: int) -> Dict:
        """Get user's onboarding progress from database."""
        from ..models.onboarding import OnboardingProgress
        import json
        
        # Get or create onboarding progress
        progress_record = OnboardingProgress.query.filter_by(user_id=user_id).first()
        
        if not progress_record:
            # Create new onboarding progress
            from ..core.database import db
            progress_record = OnboardingProgress(
                user_id=user_id,
                completed_steps='[]',
                current_step='welcome'
            )
            db.session.add(progress_record)
            db.session.commit()
        
        # Parse completed steps
        try:
            completed_step_ids = json.loads(progress_record.completed_steps or '[]')
        except:
            completed_step_ids = []
        
        # Update step completion status
        for step in self.onboarding_steps:
            step.completed = step.id in completed_step_ids
        
        total_steps = len(self.onboarding_steps)
        completed_steps = len(completed_step_ids)
        
        return {
            'steps': [{
                'id': step.id,
                'title': step.title,
                'description': step.description,
                'completed': step.completed,
                'required': step.required,
                'estimated_time': step.estimated_time
            } for step in self.onboarding_steps],
            'progress': {
                'completed_steps': completed_steps,
                'total_steps': total_steps,
                'percentage': (completed_steps / total_steps) * 100 if total_steps > 0 else 0,
                'estimated_time_remaining': sum(
                    step.estimated_time for step in self.onboarding_steps 
                    if not step.completed
                )
            },
            'current_step': progress_record.current_step or self._get_current_step(completed_step_ids),
            'is_complete': progress_record.is_complete
        }
    
    def complete_step(self, user_id: int, step_id: str) -> Dict:
        """Mark an onboarding step as completed in database."""
        from ..models.onboarding import OnboardingProgress
        from ..core.database import db
        import json
        
        step = next((s for s in self.onboarding_steps if s.id == step_id), None)
        if not step:
            raise ValueError(f"Invalid step ID: {step_id}")
        
        # Get or create progress record
        progress_record = OnboardingProgress.query.filter_by(user_id=user_id).first()
        if not progress_record:
            progress_record = OnboardingProgress(
                user_id=user_id,
                completed_steps='[]',
                current_step='welcome'
            )
            db.session.add(progress_record)
        
        # Update completed steps
        try:
            completed_steps = json.loads(progress_record.completed_steps or '[]')
        except:
            completed_steps = []
        
        if step_id not in completed_steps:
            completed_steps.append(step_id)
            progress_record.completed_steps = json.dumps(completed_steps)
        
        # Update current step
        progress_record.current_step = self._get_current_step(completed_steps)
        
        # Check if onboarding is complete
        required_steps = [s.id for s in self.onboarding_steps if s.required]
        progress_record.is_complete = all(step_id in completed_steps for step_id in required_steps)
        
        progress_record.updated_at = datetime.now(timezone.utc)
        db.session.commit()
        
        return {
            'step_completed': step_id,
            'message': f'Step "{step.title}" completed successfully',
            'progress': self.get_onboarding_progress(user_id)
        }
    
    def perform_security_assessment(self, user_passwords: List[Dict]) -> SecurityAssessment:
        """Perform comprehensive security assessment of user's passwords."""
        if not user_passwords:
            return self._empty_assessment()
        
        # Analyze password security
        analysis = self._analyze_password_security(user_passwords)
        
        # Calculate overall score
        overall_score = self._calculate_security_score(analysis)
        
        # Determine risk level
        risk_level = self._determine_risk_level(overall_score)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(analysis)
        
        # Identify strengths and weaknesses
        strengths = self._identify_strengths(analysis)
        weaknesses = self._identify_weaknesses(analysis)
        
        # Generate next steps
        next_steps = self._generate_next_steps(analysis, risk_level)
        
        return SecurityAssessment(
            overall_score=overall_score,
            risk_level=risk_level,
            recommendations=recommendations,
            strengths=strengths,
            weaknesses=weaknesses,
            next_steps=next_steps
        )
    
    def generate_migration_plan(self, current_manager: str, password_count: int) -> Dict:
        """Generate personalized migration plan."""
        
        migration_steps = []
        
        # Step 1: Export from current manager
        export_instructions = self._get_export_instructions(current_manager)
        migration_steps.append({
            'step': 1,
            'title': f'Export from {current_manager}',
            'description': f'Export your passwords from {current_manager}',
            'instructions': export_instructions,
            'estimated_time': 5
        })
        
        # Step 2: Import to Lok
        migration_steps.append({
            'step': 2,
            'title': 'Import to Lok',
            'description': 'Securely import your passwords to Lok',
            'instructions': [
                'Click "Import Passwords" in your Lok dashboard',
                f'Select "{current_manager}" as your source',
                'Upload your exported file',
                'Review and confirm the import'
            ],
            'estimated_time': 10
        })
        
        # Step 3: Security review
        migration_steps.append({
            'step': 3,
            'title': 'Security Review',
            'description': 'AI-powered analysis of your imported passwords',
            'instructions': [
                'Review the security assessment results',
                'Update weak passwords using AI suggestions',
                'Enable 2FA where recommended',
                'Organize passwords into categories'
            ],
            'estimated_time': 15
        })
        
        # Step 4: Setup devices
        migration_steps.append({
            'step': 4,
            'title': 'Setup Your Devices',
            'description': 'Install Lok on all your devices',
            'instructions': [
                'Install browser extensions',
                'Download mobile apps',
                'Test auto-fill functionality',
                'Remove old password manager'
            ],
            'estimated_time': 10
        })
        
        return {
            'migration_plan': migration_steps,
            'total_estimated_time': sum(step['estimated_time'] for step in migration_steps),
            'difficulty_level': self._assess_migration_difficulty(current_manager, password_count),
            'benefits': self._get_migration_benefits(),
            'support_resources': self._get_support_resources()
        }
    
    def _get_current_step(self, completed_steps: List[str] = None) -> Optional[str]:
        """Get the current onboarding step."""
        if completed_steps is None:
            completed_steps = []
            
        for step in self.onboarding_steps:
            if step.id not in completed_steps:
                return step.id
        return None
    
    def _empty_assessment(self) -> SecurityAssessment:
        """Return empty security assessment."""
        return SecurityAssessment(
            overall_score=0,
            risk_level="unknown",
            recommendations=["Import passwords to begin security assessment"],
            strengths=[],
            weaknesses=["No passwords to analyze"],
            next_steps=["Import your existing passwords"]
        )
    
    def _analyze_password_security(self, passwords: List[Dict]) -> Dict:
        """Analyze password security metrics."""
        total = len(passwords)
        weak_passwords = 0
        strong_passwords = 0
        reused_passwords = 0
        old_passwords = 0
        missing_2fa = 0
        
        password_values = []
        
        for pwd in passwords:
            password = pwd.get('password', '')
            
            # Analyze strength (simplified)
            if len(password) < 8 or password.lower() in ['password', '123456', 'qwerty']:
                weak_passwords += 1
            elif len(password) >= 12 and any(c.isupper() for c in password) and any(c.isdigit() for c in password):
                strong_passwords += 1
            
            # Check for reuse
            if password in password_values:
                reused_passwords += 1
            password_values.append(password)
            
            # Check age (if available)
            created_at = pwd.get('created_at')
            if created_at:
                try:
                    created = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                    if (datetime.now(timezone.utc) - created).days > 90:
                        old_passwords += 1
                except:
                    pass
        
        return {
            'total_passwords': total,
            'weak_passwords': weak_passwords,
            'strong_passwords': strong_passwords,
            'reused_passwords': reused_passwords,
            'old_passwords': old_passwords,
            'missing_2fa': missing_2fa,
            'unique_passwords': len(set(password_values))
        }
    
    def _calculate_security_score(self, analysis: Dict) -> int:
        """Calculate overall security score (0-100)."""
        total = analysis['total_passwords']
        if total == 0:
            return 0
        
        # Base score
        score = 100
        
        # Deduct for weak passwords
        weak_penalty = (analysis['weak_passwords'] / total) * 40
        score -= weak_penalty
        
        # Deduct for reused passwords
        reuse_penalty = (analysis['reused_passwords'] / total) * 30
        score -= reuse_penalty
        
        # Deduct for old passwords
        old_penalty = (analysis['old_passwords'] / total) * 20
        score -= old_penalty
        
        # Bonus for strong passwords
        strong_bonus = (analysis['strong_passwords'] / total) * 10
        score += strong_bonus
        
        return max(0, min(100, int(score)))
    
    def _determine_risk_level(self, score: int) -> str:
        """Determine risk level based on score."""
        if score >= 80:
            return "low"
        elif score >= 60:
            return "medium"
        elif score >= 40:
            return "high"
        else:
            return "critical"
    
    def _generate_recommendations(self, analysis: Dict) -> List[str]:
        """Generate security recommendations."""
        recommendations = []
        total = analysis['total_passwords']
        
        if analysis['weak_passwords'] > 0:
            recommendations.append(f"Update {analysis['weak_passwords']} weak passwords using AI-generated suggestions")
        
        if analysis['reused_passwords'] > 0:
            recommendations.append(f"Create unique passwords for {analysis['reused_passwords']} duplicate entries")
        
        if analysis['old_passwords'] > 0:
            recommendations.append(f"Refresh {analysis['old_passwords']} passwords older than 90 days")
        
        if total > 0 and analysis['strong_passwords'] / total < 0.5:
            recommendations.append("Use Lok's AI password generator for stronger passwords")
        
        recommendations.append("Enable two-factor authentication on critical accounts")
        
        return recommendations[:5]  # Top 5 recommendations
    
    def _identify_strengths(self, analysis: Dict) -> List[str]:
        """Identify security strengths."""
        strengths = []
        total = analysis['total_passwords']
        
        if total == 0:
            return strengths
        
        if analysis['strong_passwords'] / total > 0.7:
            strengths.append("Most passwords are strong and secure")
        
        if analysis['reused_passwords'] / total < 0.1:
            strengths.append("Good password uniqueness across accounts")
        
        if analysis['weak_passwords'] / total < 0.2:
            strengths.append("Low number of weak passwords")
        
        if total > 50:
            strengths.append("Comprehensive password coverage")
        
        return strengths
    
    def _identify_weaknesses(self, analysis: Dict) -> List[str]:
        """Identify security weaknesses."""
        weaknesses = []
        total = analysis['total_passwords']
        
        if total == 0:
            return ["No passwords imported yet"]
        
        if analysis['weak_passwords'] / total > 0.3:
            weaknesses.append("High number of weak passwords")
        
        if analysis['reused_passwords'] / total > 0.2:
            weaknesses.append("Significant password reuse detected")
        
        if analysis['old_passwords'] / total > 0.4:
            weaknesses.append("Many passwords haven't been updated recently")
        
        return weaknesses
    
    def _generate_next_steps(self, analysis: Dict, risk_level: str) -> List[str]:
        """Generate actionable next steps."""
        next_steps = []
        
        if risk_level == "critical":
            next_steps.extend([
                "Immediately update all weak passwords",
                "Enable 2FA on critical accounts",
                "Use AI password generator for new passwords"
            ])
        elif risk_level == "high":
            next_steps.extend([
                "Update weak passwords using AI suggestions",
                "Eliminate password reuse",
                "Set up breach monitoring"
            ])
        elif risk_level == "medium":
            next_steps.extend([
                "Refresh old passwords",
                "Enable 2FA where possible",
                "Review password categories"
            ])
        else:
            next_steps.extend([
                "Maintain good password hygiene",
                "Regular security checkups",
                "Stay updated on security features"
            ])
        
        return next_steps[:3]  # Top 3 next steps
    
    def _get_export_instructions(self, manager: str) -> List[str]:
        """Get export instructions for specific password manager."""
        instructions = {
            '1password': [
                'Open 1Password and go to File > Export',
                'Choose "All Items" and select CSV format',
                'Save the file to a secure location',
                'The file will contain all your passwords in CSV format'
            ],
            'lastpass': [
                'Log in to LastPass web vault',
                'Go to Advanced Options > Export',
                'Choose "LastPass CSV File"',
                'Save the exported file securely'
            ],
            'chrome': [
                'Open Chrome and go to Settings > Passwords',
                'Click the three dots menu and select "Export passwords"',
                'Authenticate and save the CSV file',
                'Keep the file secure during migration'
            ],
            'firefox': [
                'Open Firefox and go to about:logins',
                'Click the three dots menu and select "Export Logins"',
                'Save the CSV file to a secure location',
                'Delete the file after successful import'
            ],
            'bitwarden': [
                'Log in to Bitwarden web vault',
                'Go to Tools > Export Vault',
                'Choose JSON or CSV format',
                'Download and securely store the file'
            ]
        }
        
        return instructions.get(manager.lower(), [
            'Check your password manager\'s export or backup options',
            'Look for CSV or JSON export formats',
            'Ensure all passwords are included in the export',
            'Keep the exported file secure'
        ])
    
    def _assess_migration_difficulty(self, current_manager: str, password_count: int) -> str:
        """Assess migration difficulty level."""
        if password_count < 20:
            return "easy"
        elif password_count < 100:
            return "moderate"
        else:
            return "advanced"
    
    def _get_migration_benefits(self) -> List[str]:
        """Get benefits of migrating to Lok."""
        return [
            "AI-powered password security analysis",
            "Advanced breach detection and monitoring",
            "Quantum-resistant security features",
            "Behavioral anomaly detection",
            "Predictive security insights",
            "Cross-platform synchronization",
            "Zero-knowledge encryption"
        ]
    
    def _get_support_resources(self) -> List[Dict]:
        """Get support resources for migration."""
        return [
            {
                'title': 'Migration Guide',
                'description': 'Step-by-step migration instructions',
                'url': '/help/migration-guide'
            },
            {
                'title': 'Video Tutorials',
                'description': 'Watch how to migrate from popular password managers',
                'url': '/help/video-tutorials'
            },
            {
                'title': 'Live Chat Support',
                'description': 'Get help from our migration specialists',
                'url': '/support/chat'
            },
            {
                'title': 'Migration Checklist',
                'description': 'Ensure you don\'t miss any important steps',
                'url': '/help/migration-checklist'
            }
        ]

# Global instance
onboarding_service = OnboardingService()