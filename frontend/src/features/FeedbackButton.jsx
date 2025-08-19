import { useState } from 'react';
import { 
  ChatBubbleLeftRightIcon, 
  XMarkIcon, 
  PaperAirplaneIcon,
  BugAntIcon,
  LightBulbIcon,
  SparklesIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

const FeedbackButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [type, setType] = useState('feedback');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const feedbackTypes = [
    { 
      value: 'feedback', 
      label: 'General Feedback', 
      icon: ChatBubbleLeftRightIcon,
      color: 'blue',
      placeholder: 'Share your thoughts about Lok...'
    },
    { 
      value: 'bug', 
      label: 'Bug Report', 
      icon: BugAntIcon,
      color: 'red',
      placeholder: 'Describe the issue you encountered...'
    },
    { 
      value: 'feature', 
      label: 'Feature Request', 
      icon: LightBulbIcon,
      color: 'yellow',
      placeholder: 'What feature would you like to see?'
    },
    { 
      value: 'improvement', 
      label: 'Improvement', 
      icon: SparklesIcon,
      color: 'purple',
      placeholder: 'How can we make this better?'
    }
  ];

  const selectedType = feedbackTypes.find(t => t.value === type);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSubmitted(true);
      setTimeout(() => {
        setIsOpen(false);
        setSubmitted(false);
        setFeedback('');
        setType('feedback');
      }, 2500);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setSubmitted(false);
    setFeedback('');
    setType('feedback');
  };

  return (
    <>
      {/* Header Feedback Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 group"
        title="Send Feedback"
      >
        <ChatBubbleLeftRightIcon className="w-5 h-5" />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full opacity-75 group-hover:opacity-100 transition-opacity">
          <div className="w-full h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse"></div>
        </div>
      </button>

      {/* Enhanced Feedback Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" style={{animation: 'scaleInCenter 0.3s ease-out'}}>
            {/* Header */}
            <div className="relative p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center bg-gradient-to-br ${
                  selectedType.color === 'blue' ? 'from-blue-500 to-blue-600' :
                  selectedType.color === 'red' ? 'from-red-500 to-red-600' :
                  selectedType.color === 'yellow' ? 'from-yellow-500 to-yellow-600' :
                  'from-purple-500 to-purple-600'
                }`}>
                  <selectedType.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Send Feedback</h3>
                  <p className="text-sm text-gray-500">Help us improve Lok</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {submitted ? (
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <HeartIcon className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-3">Thank You!</h4>
                <p className="text-gray-600 leading-relaxed">
                  Your feedback is invaluable to us. We'll review it carefully and use it to make Lok even better.
                </p>
                <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Feedback received successfully
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Type Selector */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    What type of feedback is this?
                  </label>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {feedbackTypes.map((feedbackType) => (
                      <button
                        key={feedbackType.value}
                        type="button"
                        onClick={() => setType(feedbackType.value)}
                        className={`p-3 sm:p-4 rounded-2xl border-2 transition-all duration-200 text-left group hover:scale-105 ${
                          type === feedbackType.value
                            ? `border-${feedbackType.color}-500 bg-${feedbackType.color}-50 shadow-lg`
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                            type === feedbackType.value
                              ? `bg-${feedbackType.color}-500 text-white`
                              : 'bg-gray-200 text-gray-600 group-hover:bg-gray-300'
                          }`}>
                            <feedbackType.icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className={`font-medium text-sm ${
                              type === feedbackType.value ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {feedbackType.label}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Feedback Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    {selectedType.label}
                  </label>
                  <div className="relative">
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder={selectedType.placeholder}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 sm:h-32 resize-none transition-all placeholder-gray-400"
                      required
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                      {feedback.length}/500
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!feedback.trim() || isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <PaperAirplaneIcon className="w-5 h-5" />
                      Send Feedback
                    </>
                  )}
                </button>

                {/* Footer */}
                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    Your feedback helps us build a better password manager for everyone
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default FeedbackButton;