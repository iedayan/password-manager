import { useState, useEffect } from 'react';
import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

const Toast = ({ message, type = 'success', duration = 3000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg backdrop-blur-sm border ${
        type === 'success' 
          ? 'bg-green-900/90 border-green-600 text-green-100' 
          : 'bg-red-900/90 border-red-600 text-red-100'
      }`}>
        <CheckCircleIcon className="w-5 h-5" />
        <span className="text-sm font-medium">{message}</span>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded">
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;