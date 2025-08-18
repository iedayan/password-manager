import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const PasswordStrengthIndicator = ({ password, onStrengthChange }) => {
  const calculateStrength = (password) => {
    if (!password) return { score: 0, feedback: [], level: 'none' };
    
    let score = 0;
    const feedback = [];
    
    // Length scoring
    if (password.length >= 16) score += 30;
    else if (password.length >= 12) score += 25;
    else if (password.length >= 8) score += 15;
    else feedback.push('Use at least 8 characters');
    
    // Character variety
    if (/[a-z]/.test(password)) score += 15;
    else feedback.push('Add lowercase letters');
    
    if (/[A-Z]/.test(password)) score += 15;
    else feedback.push('Add uppercase letters');
    
    if (/\d/.test(password)) score += 15;
    else feedback.push('Add numbers');
    
    if (/[^a-zA-Z0-9]/.test(password)) score += 20;
    else feedback.push('Add special characters');
    
    // Bonus points
    if (password.length >= 20) score += 5;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 5;
    
    // Penalties
    if (/(.)\1{2,}/.test(password)) {
      score -= 10;
      feedback.push('Avoid repeated characters');
    }
    
    if (/123|abc|qwe|password|admin/i.test(password)) {
      score -= 15;
      feedback.push('Avoid common patterns');
    }
    
    const finalScore = Math.max(0, Math.min(100, score));
    let level = 'weak';
    if (finalScore >= 80) level = 'strong';
    else if (finalScore >= 60) level = 'medium';
    
    const result = { score: finalScore, feedback, level };
    
    // Notify parent component
    if (onStrengthChange) {
      onStrengthChange(result);
    }
    
    return result;
  };

  const strength = calculateStrength(password);

  if (!password) return null;

  const getColorClasses = () => {
    switch (strength.level) {
      case 'strong': return 'text-green-600 bg-green-500';
      case 'medium': return 'text-yellow-600 bg-yellow-500';
      default: return 'text-red-600 bg-red-500';
    }
  };

  const getIcon = () => {
    switch (strength.level) {
      case 'strong': return <CheckCircleIcon className="w-4 h-4 text-green-600" />;
      case 'medium': return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />;
      default: return <XCircleIcon className="w-4 h-4 text-red-600" />;
    }
  };

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getIcon()}
          <span className="text-sm font-medium text-gray-700">Password Strength</span>
        </div>
        <span className={`text-sm font-semibold ${getColorClasses().split(' ')[0]}`}>
          {strength.level.charAt(0).toUpperCase() + strength.level.slice(1)} ({strength.score}%)
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className={`h-2.5 rounded-full transition-all duration-500 ${getColorClasses().split(' ')[1]}`}
          style={{ width: `${strength.score}%` }}
        ></div>
      </div>
      
      {strength.feedback.length > 0 && (
        <div className="text-xs text-gray-600 bg-gray-50 rounded-lg p-2">
          <div className="flex items-start gap-2">
            <ExclamationTriangleIcon className="w-3 h-3 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium">Suggestions:</span>
              <ul className="mt-1 space-y-0.5">
                {strength.feedback.map((tip, index) => (
                  <li key={index} className="text-gray-600">• {tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;