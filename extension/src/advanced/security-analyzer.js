class SecurityAnalyzer {
  constructor() {
    this.commonPasswords = new Set([
      'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
      'admin', 'letmein', 'welcome', 'monkey', '1234567890', 'dragon'
    ]);
    
    this.breachedDomains = new Set();
    this.phishingPatterns = [
      /[0-9]+[a-z]+\.(com|net|org)/, // Suspicious domains with numbers
      /[a-z]+-[a-z]+\.(tk|ml|ga|cf)/, // Free domain extensions
      /secure[a-z]*\.(com|net)/, // Fake security domains
    ];
  }

  analyzePassword(password) {
    const analysis = {
      score: 0,
      strength: 'weak',
      issues: [],
      suggestions: [],
      entropy: this.calculateEntropy(password)
    };

    // Length check
    if (password.length < 8) {
      analysis.issues.push('Password is too short');
      analysis.suggestions.push('Use at least 8 characters');
    } else if (password.length >= 12) {
      analysis.score += 25;
    } else {
      analysis.score += 15;
    }

    // Character variety
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSymbols = /[^a-zA-Z0-9]/.test(password);

    const variety = [hasLower, hasUpper, hasNumbers, hasSymbols].filter(Boolean).length;
    analysis.score += variety * 15;

    if (variety < 3) {
      analysis.issues.push('Password lacks character variety');
      analysis.suggestions.push('Include uppercase, lowercase, numbers, and symbols');
    }

    // Common password check
    if (this.commonPasswords.has(password.toLowerCase())) {
      analysis.score = Math.min(analysis.score, 20);
      analysis.issues.push('Password is commonly used');
      analysis.suggestions.push('Use a unique password');
    }

    // Pattern detection
    if (this.hasRepeatingPatterns(password)) {
      analysis.score -= 20;
      analysis.issues.push('Password contains repeating patterns');
      analysis.suggestions.push('Avoid repeating characters or sequences');
    }

    // Dictionary word check
    if (this.containsDictionaryWords(password)) {
      analysis.score -= 15;
      analysis.issues.push('Password contains dictionary words');
      analysis.suggestions.push('Use random characters instead of words');
    }

    // Final scoring
    analysis.score = Math.max(0, Math.min(100, analysis.score));
    
    if (analysis.score >= 80) analysis.strength = 'strong';
    else if (analysis.score >= 60) analysis.strength = 'good';
    else if (analysis.score >= 40) analysis.strength = 'fair';
    else analysis.strength = 'weak';

    return analysis;
  }

  calculateEntropy(password) {
    const charset = new Set(password).size;
    return password.length * Math.log2(charset);
  }

  constantTimeEquals(a, b) {
    if (a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  }

  hasRepeatingPatterns(password) {
    // Check for repeated characters
    if (/(.)\1{2,}/.test(password)) return true;
    
    // Check for keyboard patterns
    const keyboard = 'qwertyuiopasdfghjklzxcvbnm1234567890';
    for (let i = 0; i < password.length - 2; i++) {
      const substr = password.substr(i, 3).toLowerCase();
      if (keyboard.includes(substr)) return true;
    }
    
    return false;
  }

  containsDictionaryWords(password) {
    const commonWords = ['password', 'admin', 'user', 'login', 'welcome', 'secret'];
    const lower = password.toLowerCase();
    return commonWords.some(word => lower.includes(word));
  }

  async checkBreach(password) {
    try {
      // Use SHA-1 hash for HaveIBeenPwned API
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-1', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      const prefix = hashHex.substring(0, 5);
      const suffix = hashHex.substring(5).toUpperCase();
      
      const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
      const text = await response.text();
      
      const lines = text.split('\n');
      for (const line of lines) {
        const [hash, count] = line.split(':');
        if (this.constantTimeEquals(hash, suffix)) {
          return {
            breached: true,
            count: parseInt(count)
          };
        }
      }
      
      return { breached: false, count: 0 };
    } catch (error) {
      console.error('Breach check failed:', error);
      return { breached: false, count: 0, error: true };
    }
  }

  detectPhishing(url) {
    const analysis = {
      isPhishing: false,
      risk: 'low',
      reasons: [],
      score: 0
    };

    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.toLowerCase();

      // Check against known phishing patterns
      for (const pattern of this.phishingPatterns) {
        if (pattern.test(domain)) {
          analysis.score += 30;
          analysis.reasons.push('Suspicious domain pattern');
        }
      }

      // Check for homograph attacks
      if (this.hasHomographs(domain)) {
        analysis.score += 40;
        analysis.reasons.push('Possible homograph attack');
      }

      // Check for suspicious TLDs
      const suspiciousTlds = ['.tk', '.ml', '.ga', '.cf', '.pw'];
      if (suspiciousTlds.some(tld => domain.endsWith(tld))) {
        analysis.score += 25;
        analysis.reasons.push('Suspicious top-level domain');
      }

      // Check for URL shorteners
      const shorteners = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl'];
      if (shorteners.some(shortener => domain.includes(shortener))) {
        analysis.score += 20;
        analysis.reasons.push('URL shortener detected');
      }

      // Final assessment
      if (analysis.score >= 50) {
        analysis.isPhishing = true;
        analysis.risk = 'high';
      } else if (analysis.score >= 30) {
        analysis.risk = 'medium';
      }

    } catch (error) {
      analysis.reasons.push('Invalid URL format');
    }

    return analysis;
  }

  hasHomographs(domain) {
    // Simple homograph detection for common substitutions
    const homographs = {
      'a': ['а', 'α'], 'e': ['е', 'ε'], 'o': ['о', 'ο'],
      'p': ['р', 'ρ'], 'c': ['с', 'ϲ'], 'x': ['х', 'χ']
    };

    for (const [latin, alternatives] of Object.entries(homographs)) {
      if (alternatives.some(alt => domain.includes(alt))) {
        return true;
      }
    }
    return false;
  }

  generateSecurePassword(options = {}) {
    const {
      length = 16,
      includeUppercase = true,
      includeLowercase = true,
      includeNumbers = true,
      includeSymbols = true,
      excludeSimilar = true,
      excludeAmbiguous = true
    } = options;

    let charset = '';
    
    if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (excludeSimilar) {
      charset = charset.replace(/[il1Lo0O]/g, '');
    }
    
    if (excludeAmbiguous) {
      charset = charset.replace(/[{}[\]()\/\\'"~,;<>.]/g, '');
    }

    // Ensure at least one character from each selected category
    let password = '';
    const categories = [];
    
    if (includeLowercase) categories.push('abcdefghijklmnopqrstuvwxyz');
    if (includeUppercase) categories.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    if (includeNumbers) categories.push('0123456789');
    if (includeSymbols) categories.push('!@#$%^&*');

    // Add one character from each category
    categories.forEach(category => {
      const randomIndex = Math.floor(Math.random() * category.length);
      password += category[randomIndex];
    });

    // Fill remaining length with random characters
    for (let i = password.length; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }

    // Shuffle using Fisher-Yates algorithm for better performance
    const chars = password.split('');
    for (let i = chars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    return chars.join('');
  }
}

export default SecurityAnalyzer;