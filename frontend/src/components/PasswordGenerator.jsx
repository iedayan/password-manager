import { useState } from 'react';
import { ArrowPathIcon, ClipboardIcon } from '@heroicons/react/24/outline';

const PasswordGenerator = ({ onGenerate }) => {
  const [options, setOptions] = useState({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true
  });
  const [generatedPassword, setGeneratedPassword] = useState('');

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

  return (
    <div className="bg-white border rounded-lg p-4">
      <h3 className="font-semibold mb-4">Password Generator</h3>
      
      {/* Generated Password */}
      {generatedPassword && (
        <div className="mb-4 p-3 bg-gray-50 rounded border flex items-center justify-between">
          <code className="font-mono text-sm flex-1">{generatedPassword}</code>
          <button
            onClick={copyPassword}
            className="ml-2 p-1 text-gray-500 hover:text-blue-600"
          >
            <ClipboardIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Options */}
      <div className="space-y-3 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Length: {options.length}</label>
          <input
            type="range"
            min="8"
            max="64"
            value={options.length}
            onChange={(e) => setOptions(prev => ({...prev, length: parseInt(e.target.value)}))}
            className="w-full"
          />
        </div>

        {['uppercase', 'lowercase', 'numbers', 'symbols'].map(option => (
          <label key={option} className="flex items-center">
            <input
              type="checkbox"
              checked={options[option]}
              onChange={(e) => setOptions(prev => ({...prev, [option]: e.target.checked}))}
              className="mr-2"
            />
            <span className="text-sm capitalize">{option}</span>
          </label>
        ))}
      </div>

      {/* Strength Indicator */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span>Strength</span>
          <span>{getStrength()}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${
              getStrength() >= 80 ? 'bg-green-500' :
              getStrength() >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${getStrength()}%` }}
          />
        </div>
      </div>

      <button
        onClick={generatePassword}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
      >
        <ArrowPathIcon className="w-4 h-4" />
        Generate Password
      </button>
    </div>
  );
};

export default PasswordGenerator;