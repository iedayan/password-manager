import { useState, useEffect } from 'react';
import { EyeIcon, EyeSlashIcon, XMarkIcon, KeyIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from './LoadingSpinner';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import { validatePasswordForm, sanitizeFormData } from '../utils/validation';
import { api } from '../lib/api';

const EditPasswordModal = ({ password, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    site_name: '',
    site_url: '',
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: [], level: 'none' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasPasswordChange, setHasPasswordChange] = useState(false);



  const generatePassword = async () => {
    setIsGenerating(true);
    try {
      const response = await api.passwords.generate({ length: 16, include_symbols: true });
      const newPassword = response.password || response;
      setFormData(prev => ({ ...prev, password: newPassword }));
      setHasPasswordChange(true);
    } catch (error) {
      // Fallback to client-side generation
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
      let password = '';
      for (let i = 0; i < 16; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      setFormData(prev => ({ ...prev, password }));
      setHasPasswordChange(true);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (password) {
      setFormData({
        site_name: password.site_name || '',
        site_url: password.site_url || '',
        username: password.username || '',
        password: ''
      });
      setHasPasswordChange(false);
    }
  }, [password]);

  useEffect(() => {
    if (formData.password) {
      setHasPasswordChange(true);
    }
  }, [formData.password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFieldErrors({});

    // Prepare update data
    const updateData = { ...formData };
    if (!updateData.password) {
      delete updateData.password; // Don't update password if empty
    }

    // Validate form data (skip password validation if not changing)
    const sanitizedData = sanitizeFormData(updateData);
    const validation = validatePasswordForm({
      ...sanitizedData,
      password: sanitizedData.password || 'dummy' // Skip password validation if not provided
    });
    
    // Only validate non-password fields
    const relevantErrors = {};
    if (validation.errors.site_name) relevantErrors.site_name = validation.errors.site_name;
    if (validation.errors.site_url) relevantErrors.site_url = validation.errors.site_url;
    if (validation.errors.username) relevantErrors.username = validation.errors.username;
    if (sanitizedData.password && validation.errors.password) relevantErrors.password = validation.errors.password;
    
    if (Object.keys(relevantErrors).length > 0) {
      setFieldErrors(relevantErrors);
      setLoading(false);
      return;
    }

    // Check password strength if changing password
    if (hasPasswordChange && passwordStrength.score < 40) {
      setError('New password is too weak. Please use a stronger password.');
      setLoading(false);
      return;
    }

    try {
      const response = await api.passwords.update(password.id, sanitizedData);
      onUpdate(response.password);
      onClose();
    } catch (error) {
      setError(error.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Edit Password</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {loading && <LoadingSpinner text="Updating password..." />}
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site Name *
            </label>
            <input
              type="text"
              value={formData.site_name}
              onChange={(e) => setFormData(prev => ({...prev, site_name: e.target.value}))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                fieldErrors.site_name ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              required
            />
            {fieldErrors.site_name && (
              <p className="text-red-600 text-xs mt-1">{fieldErrors.site_name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website URL
            </label>
            <input
              type="url"
              value={formData.site_url}
              onChange={(e) => setFormData(prev => ({...prev, site_url: e.target.value}))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                fieldErrors.site_url ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="https://example.com"
            />
            {fieldErrors.site_url && (
              <p className="text-red-600 text-xs mt-1">{fieldErrors.site_url}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username/Email *
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({...prev, username: e.target.value}))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                fieldErrors.username ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              required
            />
            {fieldErrors.username && (
              <p className="text-red-600 text-xs mt-1">{fieldErrors.username}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password (leave empty to keep current)
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData(prev => ({...prev, password: e.target.value}))}
                className={`w-full px-3 py-2 pr-20 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  fieldErrors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter new password"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                <button
                  type="button"
                  onClick={generatePassword}
                  disabled={isGenerating}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-50"
                  title="Generate secure password"
                >
                  <KeyIcon className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Toggle visibility"
                >
                  {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {fieldErrors.password && (
              <p className="text-red-600 text-xs mt-1">{fieldErrors.password}</p>
            )}
            
            <PasswordStrengthIndicator 
              password={formData.password}
              onStrengthChange={setPasswordStrength}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (hasPasswordChange && passwordStrength.score < 40)}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Updating...
                </>
              ) : (
                <>
                  {(!hasPasswordChange || passwordStrength.score >= 60) && <CheckCircleIcon className="w-4 h-4" />}
                  Update Password
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPasswordModal;