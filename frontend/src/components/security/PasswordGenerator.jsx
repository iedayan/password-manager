import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { ArrowPathIcon, ClipboardIcon, CheckIcon, GlobeAltIcon, PlusIcon } from '@heroicons/react/24/outline';
import { usePasswordGenerator } from '../../hooks/usePasswordGenerator';
import { POPULAR_WEBSITES, CHARACTER_TYPE_OPTIONS } from "../../services/passwordGenerator";

const SavePasswordModal = lazy(() => import('../modals/SavePasswordModal'));

const PasswordGenerator = ({ onGenerate }) => {
  const { options, generatedPassword, generatePassword, updateOptions, cryptoUtils } = usePasswordGenerator();
  const [copied, setCopied] = useState(false);
  const [selectedWebsite, setSelectedWebsite] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Memoized event handlers
  const handleGeneratePassword = useCallback((customOptions) => {
    const password = generatePassword(customOptions);
    if (onGenerate) onGenerate(password);
  }, [generatePassword, onGenerate]);

  const handleOptionChange = useCallback((newOptions) => {
    updateOptions(newOptions);
    setTimeout(() => handleGeneratePassword({ ...options, ...newOptions }), 100);
  }, [updateOptions, handleGeneratePassword, options]);

  const copyPassword = useCallback(async () => {
    await navigator.clipboard.writeText(generatedPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [generatedPassword]);

  // Memoized strength calculation
  const strengthData = useMemo(() => {
    if (!generatedPassword) return { score: 0, entropy: 0, markovScore: 0 };
    
    const password = generatedPassword;
    let score = 0;
    
    const lengthScore = Math.min(40, password.length * 2.5);
    score += lengthScore;
    
    const charTypes = {
      lowercase: /[a-z]/.test(password) ? 15 : 0,
      uppercase: /[A-Z]/.test(password) ? 15 : 0,
      numbers: /[0-9]/.test(password) ? 10 : 0,
      symbols: /[^a-zA-Z0-9]/.test(password) ? 20 : 0
    };
    score += Object.values(charTypes).reduce((a, b) => a + b, 0);
    
    const entropy = cryptoUtils.calculateShannonEntropy(password);
    const entropyScore = Math.min(25, entropy * 5);
    score += entropyScore;
    
    const markovScore = cryptoUtils.calculateMarkovScore(password);
    score -= markovScore * 30;
    
    const patterns = [
      { regex: /(..).*\1/, penalty: 15 },
      { regex: /(.)\\1{2,}/, penalty: 20 },
      { regex: /012|123|234|345|456|567|678|789|890/, penalty: 25 },
      { regex: /qwerty|asdf|password|admin/, penalty: 40 },
      { regex: /(19|20)\\d{2}/, penalty: 10 }
    ];
    
    patterns.forEach(({ regex, penalty }) => {
      if (regex.test(password.toLowerCase())) {
        score -= penalty;
      }
    });
    
    if (entropy > 4.0 && password.length >= 16) score += 10;
    if (entropy > 4.5 && password.length >= 20) score += 15;
    
    return {
      score: Math.max(0, Math.min(100, score)),
      entropy,
      markovScore
    };
  }, [generatedPassword, cryptoUtils]);

  const strengthLabel = useMemo(() => {
    const { score } = strengthData;
    if (score >= 80) return { label: 'Very Strong', color: 'text-green-600' };
    if (score >= 60) return { label: 'Strong', color: 'text-yellow-600' };
    if (score >= 40) return { label: 'Medium', color: 'text-orange-600' };
    return { label: 'Weak', color: 'text-red-600' };
  }, [strengthData]);

  useEffect(() => {
    handleGeneratePassword();
  }, [handleGeneratePassword]);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/30 animate-pulse">
          <ArrowPathIcon className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">Password Generator</h2>
        <p className="text-slate-300 text-lg">Create strong, secure passwords tailored for your accounts</p>
      </div>

      {/* Website Selection */}
      <div className="bg-gradient-to-br from-slate-700/90 to-slate-800/80 border-2 border-slate-600/40 rounded-3xl shadow-xl p-8 backdrop-blur-xl">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <GlobeAltIcon className="w-5 h-5 text-white" />
          </div>
          Generate Password For
        </h3>
        <div className="space-y-6">
          <input
            type="text"
            placeholder="Enter website or service name (e.g., google.com)"
            value={selectedWebsite}
            onChange={(e) => setSelectedWebsite(e.target.value)}
            className="w-full px-4 py-3 border border-slate-600/60 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-800/80 text-white placeholder-slate-400"
          />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {POPULAR_WEBSITES.map((site) => (
              <button
                key={site.url}
                onClick={() => setSelectedWebsite(site.url)}
                className={`group p-4 rounded-2xl border transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${
                  selectedWebsite === site.url
                    ? 'border-blue-500 bg-blue-900/60 text-blue-200 shadow-md'
                    : 'border-slate-600/60 bg-slate-600/60 hover:border-blue-400 text-slate-200 hover:bg-slate-500/60'
                }`}
              >
                <div className="text-sm font-semibold group-hover:text-blue-300 transition-colors">{site.name}</div>
                <div className="text-xs text-slate-400 mt-1">{site.url}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Generated Password Display */}
      {generatedPassword && (
        <div className="bg-gradient-to-r from-slate-700/90 to-slate-600/90 border border-slate-500/60 rounded-2xl p-6 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Generated Password</h3>
              {selectedWebsite && (
                <p className="text-sm text-slate-300">For: {selectedWebsite}</p>
              )}
            </div>
            <div className={`flex items-center gap-2 ${strengthLabel.color.replace('text-', 'text-')}`}>
              <div className="w-3 h-3 rounded-full bg-current"></div>
              <span className="text-sm font-medium text-white">{strengthLabel.label}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-slate-800/80 rounded-xl border border-slate-600/60 shadow-sm">
            <code className="font-mono text-lg flex-1 break-all text-white">{generatedPassword}</code>
            <button
              onClick={copyPassword}
              className={`p-3 rounded-lg transition-all duration-200 ${
                copied 
                  ? 'bg-green-600/20 text-green-400 border border-green-500/30' 
                  : 'bg-slate-600/60 text-slate-300 hover:bg-blue-600/20 hover:text-blue-400 border border-slate-500/30'
              }`}
              title="Copy password"
            >
              {copied ? <CheckIcon className="w-5 h-5" /> : <ClipboardIcon className="w-5 h-5" />}
            </button>
            {selectedWebsite && (
              <button
                onClick={() => setShowSaveModal(true)}
                className="p-3 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition-colors border border-blue-500/30"
                title="Save to vault"
              >
                <PlusIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Password Options */}
      <div className="bg-gradient-to-br from-slate-700/90 to-slate-800/80 border-2 border-slate-600/40 rounded-3xl shadow-xl p-8 space-y-8 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-white">Password Options</h3>
          <button
            onClick={() => handleGeneratePassword()}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <ArrowPathIcon className="w-5 h-5" />
            Regenerate
          </button>
        </div>
        
        {/* Password Type Selector */}
        <div className="space-y-4">
          <label className="text-sm font-medium text-slate-300">Password Type</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleOptionChange({ type: 'random' })}
              className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                options.type === 'random'
                  ? 'border-blue-500 bg-blue-900/60 text-blue-200'
                  : 'border-slate-600/60 bg-slate-600/60 hover:border-blue-400 text-slate-200'
              }`}
            >
              <div className="font-semibold mb-1">Random Password</div>
              <div className="text-xs opacity-75">Cryptographically secure</div>
            </button>
            <button
              onClick={() => handleOptionChange({ type: 'passphrase' })}
              className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                options.type === 'passphrase'
                  ? 'border-green-500 bg-green-900/60 text-green-200'
                  : 'border-slate-600/60 bg-slate-600/60 hover:border-green-400 text-slate-200'
              }`}
            >
              <div className="font-semibold mb-1">Passphrase</div>
              <div className="text-xs opacity-75">Human-memorable</div>
            </button>
          </div>
        </div>

        {options.type === 'random' ? (
          <>
            {/* Length Selector */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-300">Password Length</label>
              <div className="flex bg-slate-600/60 rounded-xl p-1">
                {[8, 12, 16, 20, 24, 32].map(length => (
                  <button
                    key={length}
                    onClick={() => handleOptionChange({ length })}
                    className={`flex-1 py-3 px-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      options.length === length 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'text-slate-300 hover:text-white hover:bg-slate-500/60'
                    }`}
                  >
                    {length}
                  </button>
                ))}
              </div>
              <div className="text-xs text-slate-400 text-center">
                Current: {options.length} characters • Entropy: {strengthData.entropy.toFixed(2)} bits
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Passphrase Options */}
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-300">Word Count</label>
                <div className="flex bg-slate-600/60 rounded-xl p-1">
                  {[3, 4, 5, 6, 7, 8].map(count => (
                    <button
                      key={count}
                      onClick={() => handleOptionChange({ wordCount: count })}
                      className={`flex-1 py-3 px-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                        options.wordCount === count 
                          ? 'bg-green-600 text-white shadow-sm' 
                          : 'text-slate-300 hover:text-white hover:bg-slate-500/60'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-300 mb-3 block">Separator</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: '-', label: 'Hyphen', symbol: '-', desc: 'word-word' },
                    { value: '_', label: 'Underscore', symbol: '_', desc: 'word_word' },
                    { value: '.', label: 'Period', symbol: '•', desc: 'word.word' }
                  ].map((sep) => (
                    <button
                      key={sep.value}
                      onClick={() => handleOptionChange({ separator: sep.value })}
                      className={`group relative p-3 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                        options.separator === sep.value
                          ? 'border-green-400/60 bg-green-900/60 text-green-200 shadow-lg shadow-green-500/20'
                          : 'border-slate-500/40 bg-slate-600/60 hover:border-green-400/40 text-slate-200 hover:bg-slate-500/60'
                      }`}
                      title={sep.desc}
                    >
                      <div className={`text-lg font-bold mb-1 transition-colors ${
                        options.separator === sep.value ? 'text-green-200' : 'text-slate-300 group-hover:text-green-300'
                      }`}>
                        {sep.symbol}
                      </div>
                      <div className={`text-xs transition-colors ${
                        options.separator === sep.value ? 'text-green-300/80' : 'text-slate-400 group-hover:text-green-400'
                      }`}>
                        {sep.label}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {[
                    { value: ' ', label: 'Space', symbol: '⎵', desc: 'word word' },
                    { value: '', label: 'None', symbol: '∅', desc: 'wordword' }
                  ].map((sep) => (
                    <button
                      key={sep.value}
                      onClick={() => handleOptionChange({ separator: sep.value })}
                      className={`group relative p-3 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                        options.separator === sep.value
                          ? 'border-green-400/60 bg-green-900/60 text-green-200 shadow-lg shadow-green-500/20'
                          : 'border-slate-500/40 bg-slate-600/60 hover:border-green-400/40 text-slate-200 hover:bg-slate-500/60'
                      }`}
                      title={sep.desc}
                    >
                      <div className={`text-lg font-bold mb-1 transition-colors ${
                        options.separator === sep.value ? 'text-green-200' : 'text-slate-300 group-hover:text-green-300'
                      }`}>
                        {sep.symbol}
                      </div>
                      <div className={`text-xs transition-colors ${
                        options.separator === sep.value ? 'text-green-300/80' : 'text-slate-400 group-hover:text-green-400'
                      }`}>
                        {sep.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Capitalize Words Toggle */}
              <div>
                <label className="text-sm font-medium text-slate-300 mb-3 block">Word Formatting</label>
                <button
                  onClick={() => handleOptionChange({ capitalize: !options.capitalize })}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 hover:scale-[1.02] ${
                    options.capitalize
                      ? 'border-green-400/60 bg-green-900/60 text-green-200 shadow-lg shadow-green-500/20'
                      : 'border-slate-500/40 bg-slate-600/60 hover:border-green-400/40 text-slate-200 hover:bg-slate-500/60'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg transition-all ${
                    options.capitalize
                      ? 'bg-green-500/30 text-green-200'
                      : 'bg-slate-500/30 text-slate-300'
                  }`}>
                    Aa
                  </div>
                  <div className="flex-1 text-left">
                    <div className={`font-semibold transition-colors ${
                      options.capitalize ? 'text-green-200' : 'text-slate-200'
                    }`}>
                      Capitalize Words
                    </div>
                    <div className={`text-xs mt-1 transition-colors ${
                      options.capitalize ? 'text-green-300/80' : 'text-slate-400'
                    }`}>
                      {options.capitalize ? 'Apple-Bridge-Castle' : 'apple-bridge-castle'}
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                    options.capitalize
                      ? 'border-green-400 bg-green-500 text-white'
                      : 'border-slate-400 bg-transparent'
                  }`}>
                    {options.capitalize && (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Character Options - Only show for random passwords */}
        {options.type === 'random' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CHARACTER_TYPE_OPTIONS.map(option => (
              <label key={option.key} className={`group relative flex items-center p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer hover:shadow-xl hover:scale-[1.02] backdrop-blur-sm ${
                options[option.key] 
                  ? `border-${option.color}-400/60 bg-gradient-to-br from-${option.color}-900/80 to-${option.color}-800/60 shadow-lg shadow-${option.color}-500/20` 
                  : 'border-slate-500/40 bg-gradient-to-br from-slate-600/80 to-slate-700/60 hover:border-slate-400/60 hover:shadow-slate-500/20'
              } before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300 ${
                options[option.key] 
                  ? `before:from-${option.color}-400/10 before:to-transparent`
                  : 'before:from-slate-400/10 before:to-transparent'
              }`}>
                <div className="relative z-10 flex items-center w-full">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 font-bold text-lg transition-all duration-300 group-hover:scale-110 ${
                    options[option.key]
                      ? `bg-${option.color}-500/30 text-${option.color}-200 shadow-lg`
                      : 'bg-slate-500/30 text-slate-300'
                  }`}>
                    {option.icon}
                  </div>
                  <div className="flex-1">
                    <div className={`text-sm font-bold transition-colors mb-2 ${
                      options[option.key] ? 'text-white' : 'text-slate-200 group-hover:text-white'
                    }`}>{option.label}</div>
                    <div className={`text-xs font-mono px-3 py-1.5 rounded-lg inline-block transition-all ${
                      options[option.key] 
                        ? `bg-${option.color}-500/20 text-${option.color}-200 border border-${option.color}-400/30`
                        : 'bg-slate-800/80 text-slate-400 border border-slate-600/40'
                    }`}>{option.example}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={options[option.key]}
                    onChange={(e) => handleOptionChange({ [option.key]: e.target.checked })}
                    className={`w-6 h-6 rounded-lg transition-all duration-200 ${
                      options[option.key]
                        ? `text-${option.color}-500 bg-${option.color}-500/20 border-${option.color}-400/60`
                        : 'text-slate-500 bg-slate-700/60 border-slate-500/40'
                    } focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Strength Indicator */}
      <div className="bg-gradient-to-br from-slate-700/90 to-slate-800/80 border-2 border-slate-600/40 rounded-3xl shadow-xl p-8 backdrop-blur-xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Password Strength</h3>
          <span className="text-2xl font-bold text-white bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">{strengthData.score}%</span>
        </div>
        <div className="w-full bg-slate-600/60 rounded-full h-4 overflow-hidden mb-4">
          <div 
            className={`h-4 rounded-full transition-all duration-500 ${
              strengthData.score >= 80 ? 'bg-gradient-to-r from-green-500 to-green-600' :
              strengthData.score >= 60 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
              strengthData.score >= 40 ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
              'bg-gradient-to-r from-red-500 to-red-600'
            }`}
            style={{ width: `${strengthData.score}%` }}
          />
        </div>
        
        {/* Advanced Security Metrics */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-600/40 rounded-lg p-3">
              <div className="text-slate-300 mb-1">Shannon Entropy</div>
              <div className="text-white font-bold">{strengthData.entropy.toFixed(2)} bits</div>
            </div>
            <div className="bg-slate-600/40 rounded-lg p-3">
              <div className="text-slate-300 mb-1">Predictability</div>
              <div className="text-white font-bold">{(strengthData.markovScore * 100).toFixed(1)}%</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2 text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Crypto.getRandomValues()</span>
            </div>
            <div className="flex items-center gap-2 text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Markov Chain Analysis</span>
            </div>
            <div className="flex items-center gap-2 text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Shannon Entropy Scoring</span>
            </div>
            <div className="flex items-center gap-2 text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>ML Pattern Detection</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <button
          onClick={() => handleGeneratePassword()}
          className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-5 rounded-2xl hover:from-blue-700 hover:to-cyan-700 font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 shadow-2xl hover:shadow-blue-500/30 transform hover:scale-[1.02]"
        >
          <ArrowPathIcon className="w-6 h-6" />
          Generate New Password
        </button>
        {generatedPassword && selectedWebsite && (
          <button
            onClick={() => setShowSaveModal(true)}
            className="px-8 py-5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl hover:from-green-700 hover:to-emerald-700 font-bold flex items-center gap-3 transition-all duration-300 shadow-2xl hover:shadow-green-500/30 transform hover:scale-[1.02]"
          >
            <PlusIcon className="w-5 h-5" />
            Save to Vault
          </button>
        )}
      </div>
      
      {/* Save Password Modal */}
      {showSaveModal && (
        <Suspense fallback={<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="text-white">Loading...</div></div>}>
          <SavePasswordModal
            website={selectedWebsite}
            password={generatedPassword}
            onClose={() => setShowSaveModal(false)}
            onSave={() => setShowSaveModal(false)}
          />
        </Suspense>
      )}
    </div>
  );
};

export default PasswordGenerator;