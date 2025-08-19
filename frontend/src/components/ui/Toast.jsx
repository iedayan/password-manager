import { useState, useEffect } from 'react';
import { CheckCircleIcon, XMarkIcon, ExclamationTriangleIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const Toast = ({ message, type = 'success', title, action, onAction, duration = 3000, onClose }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircleIcon className="w-5 h-5" />;
      case 'error': return <XCircleIcon className="w-5 h-5" />;
      case 'warning': return <ExclamationTriangleIcon className="w-5 h-5" />;
      default: return <InformationCircleIcon className="w-5 h-5" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success': return 'bg-green-900/90 border-green-600 text-green-100';
      case 'error': return 'bg-red-900/90 border-red-600 text-red-100';
      case 'warning': return 'bg-yellow-900/90 border-yellow-600 text-yellow-100';
      default: return 'bg-blue-900/90 border-blue-600 text-blue-100';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
      <div className={`flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg backdrop-blur-sm border ${getStyles()} max-w-md`}>
        {getIcon()}
        <div className="flex-1 min-w-0">
          {title && <div className="font-semibold text-sm mb-1">{title}</div>}
          <div className="text-sm">{message}</div>
          {action && onAction && (
            <button
              onClick={onAction}
              className="mt-2 text-xs font-medium underline hover:no-underline"
            >
              {action}
            </button>
          )}
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded flex-shrink-0">
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;