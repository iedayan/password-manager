import { useState, useEffect } from 'react';
import { CheckCircleIcon, ClockIcon, ArrowRightIcon, ShieldCheckIcon, SparklesIcon } from '@heroicons/react/24/outline';
import ImportWizard from './ImportWizard';
import { api } from '../lib/api';

const OnboardingFlow = ({ isOpen, onClose, onComplete }) => {
  const [progress, setProgress] = useState(null);
  const [currentStep, setCurrentStep] = useState(null);
  const [showImportWizard, setShowImportWizard] = useState(false);
  const [securityAssessment, setSecurityAssessment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchOnboardingProgress();
    }
  }, [isOpen]);

  const fetchOnboardingProgress = async () => {
    try {
      const response = await api.request('/api/v1/passwords/onboarding/progress');
      setProgress(response);
      setCurrentStep(response.current_step);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch onboarding progress:', error);
      setLoading(false);
    }
  };

  const completeStep = async (stepId) => {
    try {
      await api.request('/api/v1/passwords/onboarding/complete-step', {
        method: 'POST',
        body: JSON.stringify({ step_id: stepId })
      });
      await fetchOnboardingProgress();
    } catch (error) {
      console.error('Failed to complete step:', error);
    }
  };

  const fetchSecurityAssessment = async () => {
    try {
      const response = await api.request('/api/v1/passwords/security-assessment');
      setSecurityAssessment(response.assessment);
    } catch (error) {
      console.error('Failed to fetch security assessment:', error);
    }
  };

  const handleImportComplete = async () => {
    setShowImportWizard(false);
    await completeStep('import_passwords');
    await fetchSecurityAssessment();
  };

  const handleStepAction = (stepId) => {
    switch (stepId) {
      case 'welcome':
        completeStep('welcome');
        break;
      case 'import_passwords':
        setShowImportWizard(true);
        break;
      case 'security_assessment':
        fetchSecurityAssessment();
        completeStep('security_assessment');
        break;
      case 'setup_2fa':
        // Navigate to 2FA setup
        completeStep('setup_2fa');
        break;
      case 'master_password':
        // Navigate to master password setup
        completeStep('master_password');
        break;
      case 'browser_extension':
        // Open browser extension installation
        window.open('https://chrome.google.com/webstore', '_blank');
        completeStep('browser_extension');
        break;
      case 'mobile_app':
        // Show mobile app download links
        completeStep('mobile_app');
        break;
      default:
        break;
    }
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-slate-800 rounded-2xl p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-white mt-4">Loading onboarding...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <SparklesIcon className="w-8 h-8 text-blue-400 mr-3" />
                  Welcome to Lok
                </h2>
                <p className="text-slate-300 mt-2">
                  Let's get you set up with AI-powered password security
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Progress Bar */}
            {progress && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-300">
                    {progress.progress.completed_steps} of {progress.progress.total_steps} steps completed
                  </span>
                  <span className="text-sm text-blue-400">
                    {Math.round(progress.progress.percentage)}%
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress.progress.percentage}%` }}
                  ></div>
                </div>
                {progress.progress.estimated_time_remaining > 0 && (
                  <p className="text-xs text-slate-400 mt-2 flex items-center">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    About {progress.progress.estimated_time_remaining} minutes remaining
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Security Assessment Results */}
            {securityAssessment && (
              <div className="mb-8 bg-slate-700/50 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <ShieldCheckIcon className="w-6 h-6 text-blue-400 mr-2" />
                  Your Security Assessment
                </h3>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className={`text-3xl font-bold mb-2 ${
                      securityAssessment.overall_score >= 80 ? 'text-green-400' :
                      securityAssessment.overall_score >= 60 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {securityAssessment.overall_score}
                    </div>
                    <div className="text-slate-300 text-sm">Security Score</div>
                  </div>
                  
                  <div className="text-center">
                    <div className={`text-lg font-semibold mb-2 capitalize ${
                      securityAssessment.risk_level === 'low' ? 'text-green-400' :
                      securityAssessment.risk_level === 'medium' ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {securityAssessment.risk_level}
                    </div>
                    <div className="text-slate-300 text-sm">Risk Level</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-lg font-semibold text-blue-400 mb-2">
                      {securityAssessment.recommendations.length}
                    </div>
                    <div className="text-slate-300 text-sm">Recommendations</div>
                  </div>
                </div>

                {securityAssessment.recommendations.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-white font-medium mb-2">Top Recommendations:</h4>
                    <ul className="space-y-1">
                      {securityAssessment.recommendations.slice(0, 3).map((rec, index) => (
                        <li key={index} className="text-slate-300 text-sm flex items-start">
                          <span className="text-blue-400 mr-2">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Onboarding Steps */}
            {progress && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white mb-6">Setup Steps</h3>
                
                {progress.steps.map((step, index) => (
                  <OnboardingStepCard
                    key={step.id}
                    step={step}
                    isActive={step.id === currentStep}
                    onAction={() => handleStepAction(step.id)}
                  />
                ))}
              </div>
            )}

            {/* Complete Button */}
            {progress && progress.is_complete && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => {
                    onComplete?.();
                    onClose();
                  }}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-semibold"
                >
                  Complete Setup & Continue to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Import Wizard */}
      <ImportWizard
        isOpen={showImportWizard}
        onClose={() => setShowImportWizard(false)}
        onComplete={handleImportComplete}
      />
    </>
  );
};

const OnboardingStepCard = ({ step, isActive, onAction }) => {
  return (
    <div className={`border-2 rounded-xl p-4 transition-all duration-200 ${
      step.completed 
        ? 'border-green-600 bg-green-900/20' 
        : isActive 
          ? 'border-blue-500 bg-blue-900/20' 
          : 'border-slate-600 bg-slate-700/30'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            step.completed 
              ? 'bg-green-600' 
              : isActive 
                ? 'bg-blue-600' 
                : 'bg-slate-600'
          }`}>
            {step.completed ? (
              <CheckCircleIcon className="w-6 h-6 text-white" />
            ) : (
              <span className="text-white font-semibold">
                {step.id === 'welcome' ? '👋' :
                 step.id === 'import_passwords' ? '📥' :
                 step.id === 'security_assessment' ? '🛡️' :
                 step.id === 'setup_2fa' ? '🔐' :
                 step.id === 'master_password' ? '🔑' :
                 step.id === 'browser_extension' ? '🌐' :
                 step.id === 'mobile_app' ? '📱' : '✓'}
              </span>
            )}
          </div>
          
          <div>
            <h4 className="text-white font-semibold">{step.title}</h4>
            <p className="text-slate-300 text-sm">{step.description}</p>
            <div className="flex items-center mt-1 space-x-4">
              <span className="text-xs text-slate-400 flex items-center">
                <ClockIcon className="w-3 h-3 mr-1" />
                ~{step.estimated_time} min
              </span>
              {!step.required && (
                <span className="text-xs text-blue-400">Optional</span>
              )}
            </div>
          </div>
        </div>

        {!step.completed && (
          <button
            onClick={onAction}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center ${
              isActive
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
            }`}
          >
            {step.id === 'import_passwords' ? 'Import' :
             step.id === 'security_assessment' ? 'Analyze' :
             step.id === 'setup_2fa' ? 'Setup' :
             step.id === 'master_password' ? 'Create' :
             step.id === 'browser_extension' ? 'Install' :
             step.id === 'mobile_app' ? 'Download' : 'Start'}
            <ArrowRightIcon className="w-4 h-4 ml-2" />
          </button>
        )}
      </div>
    </div>
  );
};

export default OnboardingFlow;