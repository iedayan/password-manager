import { useState } from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { api } from '../../services/api';

const AutoUpdateModal = ({ isOpen, onClose, reusedPasswords = [] }) => {
  const [updating, setUpdating] = useState(false);
  const [results, setResults] = useState(null);
  const [excludeIds, setExcludeIds] = useState(new Set());

  const handleToggleExclude = (passwordId) => {
    const newExcluded = new Set(excludeIds);
    if (newExcluded.has(passwordId)) {
      newExcluded.delete(passwordId);
    } else {
      newExcluded.add(passwordId);
    }
    setExcludeIds(newExcluded);
  };

  const handleAutoUpdate = async () => {
    setUpdating(true);
    try {
      const response = await api.security.autoUpdateReused({
        exclude_ids: Array.from(excludeIds)
      });
      setResults(response);
    } catch (error) {
      console.error('Auto-update failed:', error);
    } finally {
      setUpdating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-600/20 rounded-xl flex items-center justify-center">
              <ExclamationTriangleIcon className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Auto-Update Reused Passwords</h3>
              <p className="text-slate-300 text-sm">Automatically generate new passwords for duplicates</p>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-96">
          {!results ? (
            <>
              <div className="mb-6">
                <p className="text-slate-300 mb-4">
                  Found {reusedPasswords.length} passwords that are reused. We'll keep the most recently updated version and generate new passwords for the others.
                </p>
                
                <div className="bg-blue-900/20 border border-blue-600/30 rounded-xl p-4 mb-4">
                  <h4 className="text-blue-300 font-semibold mb-2">What happens:</h4>
                  <ul className="text-blue-200 text-sm space-y-1">
                    <li>• Most recently updated password stays the same</li>
                    <li>• Other duplicates get new strong passwords</li>
                    <li>• You can exclude specific passwords below</li>
                  </ul>
                </div>
              </div>

              {reusedPasswords.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-white font-semibold">Passwords to update:</h4>
                  {reusedPasswords.map((password) => (
                    <div key={password.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={!excludeIds.has(password.id)}
                          onChange={() => handleToggleExclude(password.id)}
                          className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-500 rounded focus:ring-blue-500"
                        />
                        <div>
                          <p className="text-white font-medium">{password.site_name}</p>
                          <p className="text-slate-400 text-sm">{password.username}</p>
                        </div>
                      </div>
                      <span className="text-xs px-2 py-1 bg-orange-600/20 text-orange-300 rounded-md">
                        Duplicate
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircleIcon className="w-8 h-8 text-green-400" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Update Complete!</h4>
              <p className="text-slate-300 mb-4">
                Successfully updated {results.updated_count} passwords
              </p>
              
              {results.updated_passwords.length > 0 && (
                <div className="bg-slate-700/50 rounded-xl p-4 text-left">
                  <h5 className="text-white font-semibold mb-3">Updated passwords:</h5>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {results.updated_passwords.map((pwd) => (
                      <div key={pwd.id} className="text-sm">
                        <span className="text-slate-300">{pwd.site_name}</span>
                        <span className="text-green-400 ml-2">✓ New password generated</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-700 flex gap-3">
          {!results ? (
            <>
              <button
                onClick={handleAutoUpdate}
                disabled={updating || reusedPasswords.length === 0}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-xl font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {updating ? (
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                ) : (
                  <ArrowPathIcon className="w-5 h-5" />
                )}
                {updating ? 'Updating...' : 'Auto-Update Passwords'}
              </button>
              
              <button
                onClick={onClose}
                className="px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-xl font-semibold transition-colors"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-semibold transition-colors"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AutoUpdateModal;