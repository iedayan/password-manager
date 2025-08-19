import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon, CpuChipIcon } from '@heroicons/react/24/outline';
import { passwordAnalyzer } from "../../services/advancedSecurity";

const PasswordStrengthIndicator = ({ password, onStrengthChange }) => {
  const calculateStrength = (password) => {
    if (!password) return { score: 0, feedback: [], level: 'none', entropy: 0 };
    
    const analysis = passwordAnalyzer.calculateAdvancedStrength(password);
    
    const result = {
      score: analysis.score,
      feedback: analysis.feedback,
      level: analysis.level,
      entropy: analysis.entropy,
      patterns: analysis.patterns_detected,
      mlConfidence: analysis.ml_confidence
    };
    
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
      case 'excellent': return 'text-green-600 bg-green-500';
      case 'strong': return 'text-blue-600 bg-blue-500';
      case 'good': return 'text-indigo-600 bg-indigo-500';
      case 'fair': return 'text-yellow-600 bg-yellow-500';
      case 'weak': return 'text-orange-600 bg-orange-500';
      default: return 'text-red-600 bg-red-500';
    }
  };

  const getIcon = () => {
    switch (strength.level) {
      case 'excellent': return <CheckCircleIcon className="w-4 h-4 text-green-600" />;
      case 'strong': return <CheckCircleIcon className="w-4 h-4 text-blue-600" />;
      case 'good': return <CheckCircleIcon className="w-4 h-4 text-indigo-600" />;
      case 'fair': return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />;
      case 'weak': return <ExclamationTriangleIcon className="w-4 h-4 text-orange-600" />;
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
          {strength.level.charAt(0).toUpperCase() + strength.level.slice(1)} ({Math.round(strength.score)}%)
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className={`h-2.5 rounded-full transition-all duration-500 ${getColorClasses().split(' ')[1]}`}
          style={{ width: `${strength.score}%` }}
        ></div>
      </div>
      
      {/* Advanced Metrics */}
      {strength.entropy > 0 && (
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center">
            <CpuChipIcon className="w-3 h-3 mr-1" />
            Entropy: {strength.entropy.toFixed(1)}
          </span>
          {strength.mlConfidence && (
            <span>AI Confidence: {(strength.mlConfidence * 100).toFixed(0)}%</span>
          )}
        </div>
      )}
      
      {strength.feedback.length > 0 && (
        <div className="text-xs text-gray-600 bg-gray-50 rounded-lg p-2">
          <div className="flex items-start gap-2">
            <ExclamationTriangleIcon className="w-3 h-3 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium">AI Suggestions:</span>
              <ul className="mt-1 space-y-0.5">
                {strength.feedback.slice(0, 3).map((tip, index) => (
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