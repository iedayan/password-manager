import { useState, useEffect } from 'react';
import { ArrowPathIcon, ClipboardIcon, CheckIcon, GlobeAltIcon, PlusIcon } from '@heroicons/react/24/outline';

const PasswordGenerator = ({ onGenerate }) => {
  const [options, setOptions] = useState({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true
  });
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [selectedWebsite, setSelectedWebsite] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  
  const popularWebsites = [
    { name: 'Google', url: 'google.com' },
    { name: 'Facebook', url: 'facebook.com' },
    { name: 'Twitter', url: 'twitter.com' },
    { name: 'Instagram', url: 'instagram.com' },
    { name: 'LinkedIn', url: 'linkedin.com' },
    { name: 'GitHub', url: 'github.com' },
    { name: 'Netflix', url: 'netflix.com' },
    { name: 'Amazon', url: 'amazon.com' },
  ];

  const generatePassword = (customOptions) => {
    const opts = customOptions || options;
    
    // Define character sets with ambiguous characters removed for better usability
    const charSets = {
      lowercase: 'abcdefghijkmnpqrstuvwxyz', // Removed 'l', 'o' to avoid confusion
      uppercase: 'ABCDEFGHJKLMNPQRSTUVWXYZ', // Removed 'I', 'O' to avoid confusion
      numbers: '23456789', // Removed '0', '1' to avoid confusion with 'O', 'l'
      symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?~'
    };

    // Build charset based on selected options
    let charset = '';
    const selectedSets = [];
    
    if (opts.lowercase) {
      charset += charSets.lowercase;
      selectedSets.push(charSets.lowercase);
    }
    if (opts.uppercase) {
      charset += charSets.uppercase;
      selectedSets.push(charSets.uppercase);
    }
    if (opts.numbers) {
      charset += charSets.numbers;
      selectedSets.push(charSets.numbers);
    }
    if (opts.symbols) {
      charset += charSets.symbols;
      selectedSets.push(charSets.symbols);
    }

    if (!charset) {
      // Fallback to lowercase if no options selected
      charset = charSets.lowercase;
      selectedSets.push(charSets.lowercase);
    }

    // Generate password using cryptographically secure random values
    let password = '';
    
    // Ensure at least one character from each selected character set
    selectedSets.forEach(set => {
      password += set.charAt(getSecureRandomInt(set.length));
    });
    
    // Ensure minimum length of 8 characters
    const targetLength = Math.max(8, opts.length || 16);
    
    // Fill remaining positions with random characters from full charset
    for (let i = password.length; i < targetLength; i++) {
      password += charset.charAt(getSecureRandomInt(charset.length));
    }
    
    // Shuffle the password to avoid predictable patterns
    password = shuffleString(password);
    
    // Validate password meets complexity requirements
    if (!validatePasswordComplexity(password, opts)) {
      // Regenerate if validation fails (rare edge case)
      return generatePassword(customOptions);
    }
    
    setGeneratedPassword(password);
    if (onGenerate) onGenerate(password);
  };

  // Cryptographically secure random number generator
  const getSecureRandomInt = (max) => {
    if (window.crypto && window.crypto.getRandomValues) {
      const array = new Uint32Array(1);
      window.crypto.getRandomValues(array);
      return array[0] % max;
    }
    // Fallback to Math.random() if crypto API not available
    return Math.floor(Math.random() * max);
  };

  // Fisher-Yates shuffle algorithm for cryptographic randomness
  const shuffleString = (str) => {
    const array = str.split('');
    for (let i = array.length - 1; i > 0; i--) {
      const j = getSecureRandomInt(i + 1);
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array.join('');
  };

  // Validate password meets complexity requirements
  const validatePasswordComplexity = (password, opts) => {
    if (opts.lowercase && !/[a-z]/.test(password)) return false;
    if (opts.uppercase && !/[A-Z]/.test(password)) return false;
    if (opts.numbers && !/[0-9]/.test(password)) return false;
    if (opts.symbols && !/[^a-zA-Z0-9]/.test(password)) return false;
    
    // Check for common weak patterns
    if (/(..).*\1/.test(password)) return false; // No repeated substrings
    if (/012|123|234|345|456|567|678|789|890|abc|bcd|cde/.test(password.toLowerCase())) return false; // No sequences
    
    return true;
  };

  const copyPassword = async () => {
    await navigator.clipboard.writeText(generatedPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStrength = () => {
    if (!generatedPassword) return 0;
    
    let score = 0;
    const password = generatedPassword;
    
    // Length scoring (more sophisticated)
    if (password.length >= 8) score += 10;
    if (password.length >= 12) score += 15;
    if (password.length >= 16) score += 20;
    if (password.length >= 20) score += 25;
    
    // Character variety scoring
    if (/[a-z]/.test(password)) score += 15;
    if (/[A-Z]/.test(password)) score += 15;
    if (/[0-9]/.test(password)) score += 15;
    if (/[^a-zA-Z0-9]/.test(password)) score += 20;
    
    // Entropy calculation based on character set size
    let charsetSize = 0;
    if (/[a-z]/.test(password)) charsetSize += 26;
    if (/[A-Z]/.test(password)) charsetSize += 26;
    if (/[0-9]/.test(password)) charsetSize += 10;
    if (/[^a-zA-Z0-9]/.test(password)) charsetSize += 32;
    
    const entropy = password.length * Math.log2(charsetSize);
    if (entropy >= 50) score += 10;
    if (entropy >= 70) score += 15;
    
    // Penalty for common patterns
    if (/(..).*\1/.test(password)) score -= 10; // Repeated patterns
    if (/012|123|234|345|456|567|678|789|890/.test(password)) score -= 15; // Sequences
    if (/aaa|bbb|ccc|111|222|333/.test(password.toLowerCase())) score -= 20; // Repetition
    
    return Math.max(0, Math.min(100, score));
  };

  const getStrengthLabel = () => {
    const strength = getStrength();
    if (strength >= 80) return { label: 'Very Strong', color: 'text-green-600' };
    if (strength >= 60) return { label: 'Strong', color: 'text-yellow-600' };
    if (strength >= 40) return { label: 'Medium', color: 'text-orange-600' };
    return { label: 'Weak', color: 'text-red-600' };
  };

  useEffect(() => {
    // Auto-generate password on component mount
    generatePassword();
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ArrowPathIcon className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Password Generator</h2>
        <p className="text-gray-600">Create strong, secure passwords tailored for your accounts</p>
      </div>

      {/* Website Selection */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <GlobeAltIcon className="w-5 h-5" />
          Generate Password For
        </h3>
        
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Enter website or service name (e.g., google.com)"
            value={selectedWebsite}
            onChange={(e) => setSelectedWebsite(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {popularWebsites.map((site) => (
              <button
                key={site.url}
                onClick={() => setSelectedWebsite(site.url)}
                className={`group p-4 rounded-2xl border transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${
                  selectedWebsite === site.url
                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 shadow-md'
                    : 'border-gray-200 bg-white hover:border-blue-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="text-sm font-semibold group-hover:text-blue-600 transition-colors">{site.name}</div>
                <div className="text-xs text-gray-500 mt-1">{site.url}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Generated Password Display */}
      {generatedPassword && (
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Generated Password</h3>
              {selectedWebsite && (
                <p className="text-sm text-gray-600">For: {selectedWebsite}</p>
              )}
            </div>
            <div className={`flex items-center gap-2 ${getStrengthLabel().color}`}>
              <div className="w-3 h-3 rounded-full bg-current"></div>
              <span className="text-sm font-medium">{getStrengthLabel().label}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-white rounded-xl border shadow-sm">
            <code className="font-mono text-lg flex-1 break-all text-gray-800">{generatedPassword}</code>
            <button
              onClick={copyPassword}
              className={`p-3 rounded-lg transition-all duration-200 ${
                copied 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600'
              }`}
              title="Copy password"
            >
              {copied ? <CheckIcon className="w-5 h-5" /> : <ClipboardIcon className="w-5 h-5" />}
            </button>
            {selectedWebsite && (
              <button
                onClick={() => setShowSaveModal(true)}
                className="p-3 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                title="Save to vault"
              >
                <PlusIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Password Options */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-800">Password Options</h3>
          <button
            onClick={generatePassword}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <ArrowPathIcon className="w-4 h-4" />
            Regenerate
          </button>
        </div>
        
        {/* Length Selector */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">Password Length</label>
          <div className="flex bg-gray-100 rounded-xl p-1">
            {[8, 12, 16, 20, 24, 32].map(length => (
              <button
                key={length}
                onClick={() => {
                  const newOptions = {...options, length};
                  setOptions(newOptions);
                  setTimeout(() => generatePassword(newOptions), 100);
                }}
                className={`flex-1 py-3 px-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  options.length === length 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                }`}
              >
                {length}
              </button>
            ))}
          </div>
          <div className="text-xs text-gray-500 text-center">
            Current: {options.length} characters
          </div>
        </div>

        {/* Character Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'uppercase', label: 'Uppercase Letters', example: 'ABCDEF' },
            { key: 'lowercase', label: 'Lowercase Letters', example: 'abcdef' },
            { key: 'numbers', label: 'Numbers', example: '123456' },
            { key: 'symbols', label: 'Special Characters', example: '!@#$%^' }
          ].map(option => (
            <label key={option.key} className={`group flex items-center p-5 rounded-2xl border transition-all duration-200 cursor-pointer hover:shadow-md hover:-translate-y-0.5 ${
              options[option.key] 
                ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-sm' 
                : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50'
            }`}>
              <input
                type="checkbox"
                checked={options[option.key]}
                onChange={(e) => {
                  const newOptions = {...options, [option.key]: e.target.checked};
                  setOptions(newOptions);
                  // Auto-regenerate when options change
                  setTimeout(() => generatePassword(newOptions), 100);
                }}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 mr-4"
              />
              <div className="flex-1">
                <div className={`text-sm font-semibold transition-colors ${
                  options[option.key] ? 'text-blue-700' : 'text-gray-800 group-hover:text-blue-600'
                }`}>{option.label}</div>
                <div className="text-xs text-gray-500 font-mono mt-1 bg-gray-100 px-2 py-1 rounded inline-block">{option.example}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Strength Indicator */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Password Strength</h3>
          <span className={`text-lg font-bold ${getStrengthLabel().color}`}>{getStrength()}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden mb-4">
          <div 
            className={`h-4 rounded-full transition-all duration-500 ${
              getStrength() >= 80 ? 'bg-gradient-to-r from-green-500 to-green-600' :
              getStrength() >= 60 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
              getStrength() >= 40 ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
              'bg-gradient-to-r from-red-500 to-red-600'
            }`}
            style={{ width: `${getStrength()}%` }}
          />
        </div>
        
        {/* Security Features */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2 text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Cryptographically Secure</span>
          </div>
          <div className="flex items-center gap-2 text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Pattern Resistant</span>
          </div>
          <div className="flex items-center gap-2 text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Ambiguity Reduced</span>
          </div>
          <div className="flex items-center gap-2 text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Entropy Optimized</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <button
          onClick={generatePassword}
          className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 rounded-2xl hover:from-blue-700 hover:to-cyan-700 font-semibold text-lg flex items-center justify-center gap-3 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <ArrowPathIcon className="w-6 h-6" />
          Generate New Password
        </button>
        {generatedPassword && selectedWebsite && (
          <button
            onClick={() => setShowSaveModal(true)}
            className="px-6 py-4 bg-green-600 text-white rounded-2xl hover:bg-green-700 font-semibold flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <PlusIcon className="w-5 h-5" />
            Save to Vault
          </button>
        )}
      </div>
      {/* Save Password Modal */}
      {showSaveModal && (
        <SavePasswordModal
          website={selectedWebsite}
          password={generatedPassword}
          onClose={() => setShowSaveModal(false)}
          onSave={() => {
            setShowSaveModal(false);
            // Don't clear the generated password, only close modal
          }}
        />
      )}
    </div>
  );
};

const SavePasswordModal = ({ website, password, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    site_name: website.replace('.com', '').replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    site_url: website.startsWith('http') ? website : `https://${website}`,
    username: '',
    password: password
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Import api here to avoid circular dependency
      const { api } = await import('../lib/api');
      await api.passwords.create(formData);
      onSave();
    } catch (error) {
      console.error('Failed to save password:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b">
          <h3 className="text-xl font-semibold text-gray-900">Save Password to Vault</h3>
        </div>
        
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
            <input
              type="text"
              value={formData.site_name}
              onChange={(e) => setFormData(prev => ({...prev, site_name: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Website URL</label>
            <input
              type="url"
              value={formData.site_url}
              onChange={(e) => setFormData(prev => ({...prev, site_url: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username/Email</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({...prev, username: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your username or email"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Generated Password</label>
            <input
              type="text"
              value={formData.password}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordGenerator;