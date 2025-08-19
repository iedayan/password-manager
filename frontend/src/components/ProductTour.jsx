import { useState, useEffect } from 'react';
import { XMarkIcon, ArrowRightIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const ProductTour = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const tourSteps = [
    {
      target: '.password-vault',
      title: 'Welcome to Your Password Vault',
      content: 'This is where all your passwords are securely stored. Each password is encrypted with military-grade security.',
      position: 'bottom'
    },
    {
      target: '.add-password-btn',
      title: 'Add Your First Password',
      content: 'Click here to add a new password. You can manually enter details or use our advanced password generator.',
      position: 'bottom'
    },
    {
      target: '.password-generator',
      title: 'Advanced Password Generator',
      content: 'Generate cryptographically secure passwords with customizable options. Our AI ensures maximum security.',
      position: 'left'
    },
    {
      target: '.search-bar',
      title: 'Quick Search',
      content: 'Find any password instantly with our smart search. Search by website, username, or any detail.',
      position: 'bottom'
    },
    {
      target: '.security-dashboard',
      title: 'Security Dashboard',
      content: 'Monitor your password health, get security recommendations, and track potential breaches.',
      position: 'bottom'
    }
  ];

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('product_tour_completed');
    if (!hasSeenTour) {
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeTour = () => {
    localStorage.setItem('product_tour_completed', 'true');
    setIsVisible(false);
    if (onComplete) onComplete();
  };

  const skipTour = () => {
    completeTour();
  };

  if (!isVisible) return null;

  const currentStepData = tourSteps[currentStep];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" />
      
      {/* Tour Tooltip */}
      <div className="fixed z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-sm p-6 animate-fade-in"
           style={{
             top: '50%',
             left: '50%',
             transform: 'translate(-50%, -50%)'
           }}>
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {currentStep + 1}
            </div>
            <span className="text-sm text-gray-500">
              {currentStep + 1} of {tourSteps.length}
            </span>
          </div>
          <button
            onClick={skipTour}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {currentStepData.title}
          </h3>
          <p className="text-gray-600 leading-relaxed">
            {currentStepData.content}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
          />
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Previous
          </button>

          <div className="flex gap-2">
            <button
              onClick={skipTour}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Skip Tour
            </button>
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
            >
              {currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'}
              {currentStep < tourSteps.length - 1 && <ArrowRightIcon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductTour;