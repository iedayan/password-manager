import { useState, useEffect } from 'react';
import { EyeIcon, EyeSlashIcon, XMarkIcon, KeyIcon, CheckCircleIcon, SparklesIcon, ArrowRightIcon, GlobeAltIcon, UserIcon, LockClosedIcon, TagIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from './LoadingSpinner';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import { validatePasswordForm, sanitizeFormData } from '../utils/validation';
import { api } from '../lib/api';

const AddPasswordModal = ({ isOpen, onClose, onAdd }) => {
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
  const [step, setStep] = useState(1);
  const [favicon, setFavicon] = useState(null);
  const [detectedSite, setDetectedSite] = useState(null);
  const [passwordOptions, setPasswordOptions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Personal');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);



  const categories = [
    'Personal', 'Work', 'Banking', 'Social', 'Shopping', 'Entertainment', 'Email', 'Other'
  ];

  const detectSiteInfo = async (url) => {
    if (!url) return;
    
    try {
      const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
      const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
      setFavicon(faviconUrl);
      
      // Auto-detect site name and category
      const siteName = domain.replace('www.', '').split('.')[0];
      const capitalizedName = siteName.charAt(0).toUpperCase() + siteName.slice(1);
      
      if (!formData.site_name) {
        setFormData(prev => ({ ...prev, site_name: capitalizedName }));
      }
      
      // Auto-categorize
      const lowerDomain = domain.toLowerCase();
      if (['bank', 'chase', 'wells', 'paypal'].some(s => lowerDomain.includes(s))) {
        setSelectedCategory('Banking');
      } else if (['gmail', 'outlook', 'yahoo'].some(s => lowerDomain.includes(s))) {
        setSelectedCategory('Email');
      } else if (['facebook', 'twitter', 'instagram', 'linkedin'].some(s => lowerDomain.includes(s))) {
        setSelectedCategory('Social');
      } else if (['github', 'slack', 'office'].some(s => lowerDomain.includes(s))) {
        setSelectedCategory('Work');
      }
      
      setDetectedSite({ name: capitalizedName, domain });
    } catch (error) {
      console.log('URL detection failed:', error);
    }
  };

  const generatePasswordOptions = async () => {
    setIsGenerating(true);
    const options = [];
    
    try {
      // Generate 3 different password options
      for (let i = 0; i < 3; i++) {
        const length = [12, 16, 20][i];
        try {
          const response = await api.passwords.generate({ length, include_symbols: true });
          options.push(response.password || response);
        } catch {
          // Fallback generation
          const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
          let password = '';
          for (let j = 0; j < length; j++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          options.push(password);
        }
      }
      setPasswordOptions(options);
    } finally {
      setIsGenerating(false);
    }
  };

  const selectPassword = (password) => {
    setFormData(prev => ({ ...prev, password }));
    setPasswordOptions([]);
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFieldErrors({});

    // Validate form data
    const sanitizedData = sanitizeFormData(formData);
    const validation = validatePasswordForm(sanitizedData);
    
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      setLoading(false);
      return;
    }

    // Check password strength
    if (passwordStrength.score < 40) {
      setError('Password is too weak. Please use a stronger password.');
      setLoading(false);
      return;
    }

    try {
      const response = await api.passwords.create(sanitizedData);
      onAdd(response.password);
      onClose();
      setFormData({ site_name: '', site_url: '', username: '', password: '' });
    } catch (error) {
      setError(error.message || 'Failed to add password');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (formData.site_url) {
      detectSiteInfo(formData.site_url);
    }
  }, [formData.site_url]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showCategoryDropdown && !event.target.closest('.category-dropdown')) {
        setShowCategoryDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCategoryDropdown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl w-full max-w-lg relative overflow-hidden my-8 max-h-[90vh] overflow-y-auto">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white/50 to-indigo-50/50"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between p-6 border-b border-white/20">
            <div className="flex items-center gap-3">
              {favicon && (
                <img src={favicon} alt="Site favicon" className="w-8 h-8 rounded-lg" onError={(e) => e.target.style.display = 'none'} />
              )}
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Add New Password</h2>
                {detectedSite && (
                  <p className="text-sm text-gray-600">for {detectedSite.name}</p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-xl transition-all duration-200"
            >
              <XMarkIcon className="w-5 h-5 text-gray-600" />
            </button>
          </div>

        <div className="max-h-[calc(90vh-8rem)] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6 space-y-5 relative z-10">
          {loading && <LoadingSpinner text="Adding password..." />}
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                <SparklesIcon className="w-4 h-4" />
                Site Name *
              </label>
              <input
                type="text"
                value={formData.site_name}
                onChange={(e) => setFormData(prev => ({...prev, site_name: e.target.value}))}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all ${
                  fieldErrors.site_name ? 'border-red-300 bg-red-50/70' : 'border-gray-200 hover:border-gray-300'
                }`}
                placeholder="e.g., Google, Facebook"
                required
              />
              {fieldErrors.site_name && (
                <p className="text-red-600 text-xs mt-1">{fieldErrors.site_name}</p>
              )}
            </div>
            
            <div className="relative category-dropdown">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                <TagIcon className="w-4 h-4" />
                Category
              </label>
              <button
                type="button"
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all hover:border-gray-300 flex items-center justify-between"
              >
                <span className="text-gray-700">{selectedCategory}</span>
                <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showCategoryDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl border border-gray-200 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto">
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(category);
                        setShowCategoryDropdown(false);
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50/70 transition-all flex items-center justify-between ${
                        selectedCategory === category ? 'bg-blue-50/70 text-blue-700' : 'text-gray-700'
                      }`}
                    >
                      <span className="font-medium">{category}</span>
                      {selectedCategory === category && (
                        <CheckCircleIcon className="w-4 h-4 text-blue-500" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <GlobeAltIcon className="w-4 h-4" />
              Website URL
            </label>
            <div className="relative">
              <input
                type="url"
                value={formData.site_url}
                onChange={(e) => setFormData(prev => ({...prev, site_url: e.target.value}))}
                className={`w-full px-4 py-3 pl-12 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all ${
                  fieldErrors.site_url ? 'border-red-300 bg-red-50/70' : 'border-gray-200 hover:border-gray-300'
                }`}
                placeholder="https://example.com"
              />
              <GlobeAltIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              {favicon && (
                <img src={favicon} alt="Favicon" className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 rounded" />
              )}
            </div>
            {fieldErrors.site_url && (
              <p className="text-red-600 text-xs mt-1">{fieldErrors.site_url}</p>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <UserIcon className="w-4 h-4" />
              Username/Email *
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({...prev, username: e.target.value}))}
                className={`w-full px-4 py-3 pl-12 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all ${
                  fieldErrors.username ? 'border-red-300 bg-red-50/70' : 'border-gray-200 hover:border-gray-300'
                }`}
                placeholder="your@email.com"
                required
              />
              <UserIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            {fieldErrors.username && (
              <p className="text-red-600 text-xs mt-1">{fieldErrors.username}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <LockClosedIcon className="w-4 h-4" />
                Password *
              </label>
              <button
                type="button"
                onClick={generatePasswordOptions}
                disabled={isGenerating}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                <SparklesIcon className="w-3 h-3" />
                Generate Options
              </button>
            </div>
            
            {passwordOptions.length > 0 && (
              <div className="mb-4 p-4 bg-blue-50/70 backdrop-blur-sm rounded-xl border border-blue-200">
                <p className="text-xs text-blue-700 mb-2 font-medium">Choose a password:</p>
                <div className="space-y-2">
                  {passwordOptions.map((pwd, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => selectPassword(pwd)}
                      className="w-full text-left p-2 bg-white/70 hover:bg-white rounded-lg border border-blue-200 hover:border-blue-300 transition-all text-sm font-mono"
                    >
                      {pwd.substring(0, 20)}...
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData(prev => ({...prev, password: e.target.value}))}
                className={`w-full px-4 py-3 pl-12 pr-20 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all ${
                  fieldErrors.password ? 'border-red-300 bg-red-50/70' : 'border-gray-200 hover:border-gray-300'
                }`}
                placeholder="Enter password"
                required
              />
              <LockClosedIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-1">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-lg transition-all"
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

          <div className="flex gap-3 pt-6 border-t border-white/20">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-white/50 transition-all backdrop-blur-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (formData.password && passwordStrength.score < 40)}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg font-medium"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Adding...
                </>
              ) : (
                <>
                  {passwordStrength.score >= 60 && <CheckCircleIcon className="w-4 h-4" />}
                  Add Password
                  <ArrowRightIcon className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
        </div>
        </div>
      </div>
    </div>
  );
};

export default AddPasswordModal;