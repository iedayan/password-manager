import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const ErrorMessage = ({ message, onClose, type = 'error' }) => {
  const typeStyles = {
    error: 'bg-red-50 border-red-200 text-red-700',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    info: 'bg-blue-50 border-blue-200 text-blue-700'
  };

  const iconColors = {
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500'
  };

  return (
    <div className={`mb-6 p-4 border rounded-lg ${typeStyles[type]}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ExclamationTriangleIcon className={`w-5 h-5 ${iconColors[type]}`} />
          <span className="font-medium">{message}</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;