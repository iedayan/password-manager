import { useState, useCallback, useMemo } from 'react';
import { CHARACTER_SETS, WORD_LIST, DEFAULT_OPTIONS } from '../services/passwordGenerator';

export const usePasswordGenerator = (initialOptions = DEFAULT_OPTIONS) => {
  const [options, setOptions] = useState(initialOptions);
  const [generatedPassword, setGeneratedPassword] = useState('');

  // Memoized crypto functions
  const cryptoUtils = useMemo(() => ({
    advancedShuffle: (str, entropyPool) => {
      const array = str.split('');
      for (let i = array.length - 1; i > 0; i--) {
        const entropy1 = entropyPool[i % entropyPool.length];
        const entropy2 = entropyPool[(i * 2) % entropyPool.length];
        const combinedEntropy = (entropy1 << 8) | entropy2;
        const j = combinedEntropy % (i + 1);
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array.join('');
    },

    calculateShannonEntropy: (str) => {
      const freq = {};
      for (const char of str) {
        freq[char] = (freq[char] || 0) + 1;
      }
      
      let entropy = 0;
      const len = str.length;
      
      for (const count of Object.values(freq)) {
        const p = count / len;
        entropy -= p * Math.log2(p);
      }
      
      return entropy;
    },

    calculateMarkovScore: (str) => {
      if (str.length < 3) return 0;
      
      const transitions = {};
      let totalTransitions = 0;
      
      for (let i = 0; i < str.length - 1; i++) {
        const bigram = str.slice(i, i + 2);
        transitions[bigram] = (transitions[bigram] || 0) + 1;
        totalTransitions++;
      }
      
      let maxProbability = 0;
      for (const count of Object.values(transitions)) {
        const probability = count / totalTransitions;
        maxProbability = Math.max(maxProbability, probability);
      }
      
      return maxProbability;
    }
  }), []);

  const generateRandomPassword = useCallback((opts) => {
    let charset = '';
    const selectedSets = [];
    
    if (opts.lowercase) {
      charset += CHARACTER_SETS.lowercase;
      selectedSets.push(CHARACTER_SETS.lowercase);
    }
    if (opts.uppercase) {
      charset += CHARACTER_SETS.uppercase;
      selectedSets.push(CHARACTER_SETS.uppercase);
    }
    if (opts.numbers) {
      charset += CHARACTER_SETS.numbers;
      selectedSets.push(CHARACTER_SETS.numbers);
    }
    if (opts.symbols) {
      charset += CHARACTER_SETS.symbols;
      selectedSets.push(CHARACTER_SETS.symbols);
    }
    if (opts.extendedSymbols) {
      charset += CHARACTER_SETS.extendedSymbols;
      selectedSets.push(CHARACTER_SETS.extendedSymbols);
    }

    if (!charset) {
      charset = CHARACTER_SETS.lowercase;
      selectedSets.push(CHARACTER_SETS.lowercase);
    }

    let password = '';
    const entropyPool = new Uint8Array(opts.length * 4);
    crypto.getRandomValues(entropyPool);
    
    selectedSets.forEach((set, index) => {
      const randomIndex = entropyPool[index] % set.length;
      password += set.charAt(randomIndex);
    });
    
    const targetLength = Math.max(8, opts.length || 16);
    
    for (let i = password.length; i < targetLength; i++) {
      const randomByte = entropyPool[i % entropyPool.length];
      password += charset.charAt(randomByte % charset.length);
    }
    
    password = cryptoUtils.advancedShuffle(password, entropyPool);
    
    const entropy = cryptoUtils.calculateShannonEntropy(password);
    if (entropy < 3.5) return generateRandomPassword(opts);
    
    const markovScore = cryptoUtils.calculateMarkovScore(password);
    if (markovScore > 0.7) return generateRandomPassword(opts);
    
    return password;
  }, [cryptoUtils]);

  const generatePassphrase = useCallback((opts) => {
    const wordCount = opts.wordCount || 4;
    const separator = opts.separator || '-';
    const words = [];
    
    const entropy = new Uint32Array(wordCount);
    crypto.getRandomValues(entropy);
    
    for (let i = 0; i < wordCount; i++) {
      const wordIndex = entropy[i] % WORD_LIST.length;
      let word = WORD_LIST[wordIndex];
      
      if (opts.capitalize && i % 2 === 0) {
        word = word.charAt(0).toUpperCase() + word.slice(1);
      }
      if (opts.numbers && i === wordCount - 1) {
        const num = (entropy[i] % 9999) + 1;
        word += num;
      }
      
      words.push(word);
    }
    
    return words.join(separator);
  }, []);

  const generatePassword = useCallback((customOptions) => {
    const opts = customOptions || options;
    
    let password = '';
    if (opts.type === 'passphrase') {
      password = generatePassphrase(opts);
    } else {
      password = generateRandomPassword(opts);
    }
    
    setGeneratedPassword(password);
    return password;
  }, [options, generatePassphrase, generateRandomPassword]);

  const updateOptions = useCallback((newOptions) => {
    setOptions(prev => ({ ...prev, ...newOptions }));
  }, []);

  return {
    options,
    generatedPassword,
    generatePassword,
    updateOptions,
    cryptoUtils
  };
};