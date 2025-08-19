import { useState } from 'react';
import { ArrowPathIcon, XMarkIcon } from '@heroicons/react/24/outline';

const UpdateNotification = ({ onUpdate, onDismiss }) => {
  const [updating, setUpdating] = useState(false);

  const handleUpdate = async () => {
    setUpdating(true);
    await onUpdate();
    setUpdating(false);
  };

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300">
      <div className="bg-blue-900/95 backdrop-blur-sm border border-blue-600/50 rounded-xl p-4 shadow-2xl max-w-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <ArrowPathIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Updates Available</p>
              <p className="text-blue-200 text-xs">New changes detected</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleUpdate}
              disabled={updating}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
            >
              {updating ? 'Updating...' : 'Update'}
            </button>
            
            <button
              onClick={onDismiss}
              className="p-1 text-blue-300 hover:text-white rounded transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateNotification;