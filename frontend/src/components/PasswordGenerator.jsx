import { useState } from 'react';
import { ArrowPathIcon, ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';

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

  const generatePassword = () => {
    let charset = '';
    if (options.lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (options.uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (options.numbers) charset += '0123456789';
    if (options.symbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let password = '';
    for (let i = 0; i < options.length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    setGeneratedPassword(password);
    if (onGenerate) onGenerate(password);
  };

  const copyPassword = async () => {
    await navigator.clipboard.writeText(generatedPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStrength = () => {
    let score = 0;
    if (options.length >= 12) score += 25;
    if (options.uppercase) score += 20;
    if (options.lowercase) score += 20;
    if (options.numbers) score += 20;
    if (options.symbols) score += 15;
    return Math.min(score, 100);
  };

  const getStrengthLabel = () => {
    const strength = getStrength();
    if (strength >= 80) return { label: 'Very Strong', color: 'text-green-600' };
    if (strength >= 60) return { label: 'Strong', color: 'text-yellow-600' };
    if (strength >= 40) return { label: 'Medium', color: 'text-orange-600' };
    return { label: 'Weak', color: 'text-red-600' };
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Password Generator</h2>
        <p className="text-gray-600">Create strong, secure passwords for your accounts</p>
      </div>
      
      {/* Generated Password Display */}
      {generatedPassword && (
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Generated Password</h3>
            <div className={`flex items-center gap-2 ${getStrengthLabel().color}`}>
              <div className="w-3 h-3 rounded-full bg-current"></div>
              <span className="text-sm font-medium">{getStrengthLabel().label}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-white rounded-xl border">
            <code className="font-mono text-lg flex-1 break-all text-gray-800">{generatedPassword}</code>
            <button
              onClick={copyPassword}
              className={`p-3 rounded-lg transition-all duration-200 ${
                copied 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600'
              }`}
            >
              {copied ? <CheckIcon className="w-5 h-5" /> : <ClipboardIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      )}

      {/* Password Options */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
        <h3 className="text-xl font-semibold text-gray-800">Customize Your Password</h3>
        
        {/* Length Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-700">Password Length</label>
            <span className="text-lg font-bold text-blue-600">{options.length}</span>
          </div>
          <input
            type="range"
            min="8"
            max="64"
            value={options.length}
            onChange={(e) => setOptions(prev => ({...prev, length: parseInt(e.target.value)}))}
            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>8</span>
            <span>64</span>
          </div>
        </div>

        {/* Character Options */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { key: 'uppercase', label: 'Uppercase (A-Z)', example: 'ABC' },
            { key: 'lowercase', label: 'Lowercase (a-z)', example: 'abc' },
            { key: 'numbers', label: 'Numbers (0-9)', example: '123' },
            { key: 'symbols', label: 'Symbols (!@#)', example: '!@#' }
          ].map(option => (
            <label key={option.key} className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={options[option.key]}
                onChange={(e) => setOptions(prev => ({...prev, [option.key]: e.target.checked}))}
                className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 mr-3"
              />
              <div>
                <div className="text-sm font-medium text-gray-800">{option.label}</div>
                <div className="text-xs text-gray-500 font-mono">{option.example}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Strength Indicator */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Password Strength</h3>
          <span className={`text-lg font-bold ${getStrengthLabel().color}`}>{getStrength()}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
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
      </div>

      {/* Generate Button */}
      <button
        onClick={generatePassword}
        className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 rounded-2xl hover:from-blue-700 hover:to-cyan-700 font-semibold text-lg flex items-center justify-center gap-3 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
      >
        <ArrowPathIcon className="w-6 h-6" />
        Generate New Password
      </button>
    </div>
  );
};

export default PasswordGenerator;

/* Custom slider styles */
<style jsx>{`
  .slider::-webkit-slider-thumb {
    appearance: none;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: linear-gradient(135deg, #3b82f6, #06b6d4);
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
  
  .slider::-moz-range-thumb {
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: linear-gradient(135deg, #3b82f6, #06b6d4);
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
`}</style>