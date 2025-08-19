import { useState, useEffect } from 'react';
import { CheckIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

const SetupChecklist = ({ onComplete }) => {
  const [checklist, setChecklist] = useState([
    {
      id: 'create_password',
      title: 'Add Your First Password',
      description: 'Store your first password securely in the vault',
      completed: false,
      action: 'Add Password',
      route: '/dashboard?tab=vault&action=add'
    },
    {
      id: 'generate_password',
      title: 'Try the Password Generator',
      description: 'Generate a strong password with our advanced tool',
      completed: false,
      action: 'Generate Password',
      route: '/dashboard?tab=generator'
    },
    {
      id: 'security_check',
      title: 'Run Security Analysis',
      description: 'Check your password health and security score',
      completed: false,
      action: 'Check Security',
      route: '/dashboard?tab=security'
    },
    {
      id: 'import_passwords',
      title: 'Import Existing Passwords',
      description: 'Import passwords from your browser or other managers',
      completed: false,
      action: 'Import Data',
      route: '/dashboard?tab=import'
    },
    {
      id: 'setup_2fa',
      title: 'Enable Two-Factor Authentication',
      description: 'Add an extra layer of security to your account',
      completed: false,
      action: 'Setup 2FA',
      route: '/dashboard?tab=settings&section=security'
    }
  ]);

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const savedProgress = localStorage.getItem('setup_checklist_progress');
    if (savedProgress) {
      setChecklist(JSON.parse(savedProgress));
    }

    const hasCompletedSetup = localStorage.getItem('setup_completed');
    if (!hasCompletedSetup) {
      setIsVisible(true);
    }
  }, []);

  const completedCount = checklist.filter(item => item.completed).length;
  const progress = (completedCount / checklist.length) * 100;

  const handleItemComplete = (id) => {
    const updatedChecklist = checklist.map(item =>
      item.id === id ? { ...item, completed: true } : item
    );
    setChecklist(updatedChecklist);
    localStorage.setItem('setup_checklist_progress', JSON.stringify(updatedChecklist));

    // Check if all items are completed
    const allCompleted = updatedChecklist.every(item => item.completed);
    if (allCompleted) {
      localStorage.setItem('setup_completed', 'true');
      setTimeout(() => {
        setIsVisible(false);
        if (onComplete) onComplete();
      }, 1000);
    }
  };

  const handleItemAction = (item) => {
    if (item.route) {
      window.location.href = item.route;
    }
  };

  const dismissChecklist = () => {
    localStorage.setItem('setup_completed', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 mb-8 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Welcome to Lok Password Manager Beta! 🎉
          </h3>
          <p className="text-gray-600">
            Complete these steps to get the most out of your password manager
          </p>
        </div>
        <button
          onClick={dismissChecklist}
          className="text-gray-400 hover:text-gray-600 text-sm"
        >
          Dismiss
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Setup Progress
          </span>
          <span className="text-sm text-gray-600">
            {completedCount} of {checklist.length} completed
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Checklist Items */}
      <div className="space-y-3">
        {checklist.map((item) => (
          <div
            key={item.id}
            className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
              item.completed
                ? 'bg-green-50 border-green-200'
                : 'bg-white border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                item.completed
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-400'
              }`}>
                {item.completed ? (
                  <CheckIcon className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-medium">{checklist.indexOf(item) + 1}</span>
                )}
              </div>
              
              <div>
                <h4 className={`font-semibold ${
                  item.completed ? 'text-green-800 line-through' : 'text-gray-900'
                }`}>
                  {item.title}
                </h4>
                <p className={`text-sm ${
                  item.completed ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {item.description}
                </p>
              </div>
            </div>

            {!item.completed && (
              <button
                onClick={() => handleItemAction(item)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                {item.action}
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            )}

            {item.completed && (
              <CheckCircleIcon className="w-8 h-8 text-green-500" />
            )}
          </div>
        ))}
      </div>

      {/* Completion Message */}
      {completedCount === checklist.length && (
        <div className="mt-6 p-4 bg-green-100 border border-green-200 rounded-xl text-center">
          <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-2" />
          <h4 className="font-bold text-green-800 mb-1">Setup Complete!</h4>
          <p className="text-green-600 text-sm">
            You're all set to use Lok Password Manager securely. Welcome to the beta!
          </p>
        </div>
      )}
    </div>
  );
};

export default SetupChecklist;