/**
 * Advanced AI-powered security analyzer for Lok Password Manager
 */
class SecurityAnalyzer {
  constructor() {
    this.API_BASE = 'https://password-manager-production-89ed.up.railway.app';
    this.commonPasswords = new Set([
      'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
      'admin', 'letmein', 'welcome', 'monkey', '1234567890', 'dragon',
      'iloveyou', 'adobe123', 'princess', 'azerty', 'trustno1'
    ]);
    
    this.breachedDomains = new Set();
    this.phishingPatterns = [
      { pattern: /[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/, risk: 'high', reason: 'IP address instead of domain' },
      { pattern: /(paypal|amazon|google|microsoft|apple).*\.(tk|ml|ga|cf|xyz)$/i, risk: 'critical', reason: 'Brand impersonation' },
      { pattern: /[a-z]+-[a-z]+\.(tk|ml|ga|cf)$/, risk: 'medium', reason: 'Suspicious TLD' },
      { pattern: /secure[a-z]*\.(tk|ml|ga|cf)/, risk: 'high', reason: 'Fake security domain' },
      { pattern: /[a-z]{20,}\.(com|net|org)$/, risk: 'medium', reason: 'Unusually long domain' }
    ];
    
    this.init();
  }
  
  init() {
    this.loadThreatIntelligence();
  }
  
  async loadThreatIntelligence() {
    try {
      // Load known compromised domains and threat data
      const compromisedDomains = [
        'example-breach.com',
        'compromised-site.net',
        'data-leak.org'
      ];
      
      compromisedDomains.forEach(domain => this.breachedDomains.add(domain));
    } catch (error) {
      console.error('Failed to load threat intelligence:', error);
    }
  }

  analyzePassword(password) {
    const analysis = {
      score: 0,
      strength: 'weak',
      issues: [],
      suggestions: [],
      entropy: this.calculateEntropy(password),
      estimatedCrackTime: null,
      breached: false
    };

    // Enhanced length scoring
    if (password.length < 8) {
      analysis.issues.push('Password is too short (minimum 8 characters)');
      analysis.suggestions.push('Use at least 12 characters for better security');
    } else if (password.length >= 16) {
      analysis.score += 35;
    } else if (password.length >= 12) {
      analysis.score += 25;
    } else {
      analysis.score += 15;
    }

    // Character variety with enhanced scoring
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSymbols = /[^a-zA-Z0-9]/.test(password);
    const hasExtendedSymbols = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    const variety = [hasLower, hasUpper, hasNumbers, hasSymbols].filter(Boolean).length;
    analysis.score += variety * 12;
    
    if (hasExtendedSymbols) analysis.score += 8;

    if (variety < 3) {
      analysis.issues.push('Password lacks character variety');
      analysis.suggestions.push('Include uppercase, lowercase, numbers, and symbols');
    }

    // Enhanced common password check
    if (this.commonPasswords.has(password.toLowerCase())) {
      analysis.score = Math.min(analysis.score, 15);
      analysis.issues.push('Password is commonly used');
      analysis.suggestions.push('Use a unique, randomly generated password');
    }

    // Advanced pattern detection
    const patternScore = this.detectAdvancedPatterns(password);
    analysis.score -= patternScore.penalty;
    if (patternScore.issues.length > 0) {
      analysis.issues.push(...patternScore.issues);
      analysis.suggestions.push(...patternScore.suggestions);
    }

    // Dictionary and keyboard pattern check
    if (this.containsDictionaryWords(password)) {
      analysis.score -= 20;
      analysis.issues.push('Password contains dictionary words');
      analysis.suggestions.push('Use random characters instead of words');
    }

    // Calculate estimated crack time
    analysis.estimatedCrackTime = this.estimateCrackTime(password, analysis.entropy);

    // Final scoring with entropy consideration
    const entropyBonus = Math.min(20, analysis.entropy / 4);
    analysis.score += entropyBonus;
    analysis.score = Math.max(0, Math.min(100, analysis.score));
    
    // Enhanced strength categories
    if (analysis.score >= 85) analysis.strength = 'very_strong';
    else if (analysis.score >= 70) analysis.strength = 'strong';
    else if (analysis.score >= 50) analysis.strength = 'good';
    else if (analysis.score >= 30) analysis.strength = 'fair';
    else analysis.strength = 'weak';

    return analysis;
  }
  
  detectAdvancedPatterns(password) {
    const result = {
      penalty: 0,
      issues: [],
      suggestions: []
    };
    
    // Check for keyboard patterns
    const keyboardPatterns = [
      'qwerty', 'asdf', 'zxcv', '1234', 'abcd',
      'qwertyuiop', 'asdfghjkl', 'zxcvbnm'
    ];
    
    for (const pattern of keyboardPatterns) {
      if (password.toLowerCase().includes(pattern)) {
        result.penalty += 15;
        result.issues.push('Contains keyboard patterns');
        result.suggestions.push('Avoid sequential keyboard patterns');
        break;
      }
    }
    
    // Check for repeated sequences
    if (/(.)\1{2,}/.test(password)) {
      result.penalty += 20;
      result.issues.push('Contains repeated characters');
      result.suggestions.push('Avoid repeating the same character');
    }
    
    // Check for simple substitutions
    const substitutions = password.replace(/[@4]/g, 'a').replace(/[30]/g, 'o').replace(/[1!]/g, 'i');
    if (this.commonPasswords.has(substitutions.toLowerCase())) {
      result.penalty += 25;
      result.issues.push('Uses predictable character substitutions');
      result.suggestions.push('Avoid simple letter-to-number substitutions');
    }
    
    return result;
  }
  
  estimateCrackTime(password, entropy) {
    // Estimate based on entropy and current computing power
    const attemptsPerSecond = 1e9; // 1 billion attempts per second (conservative)
    const totalCombinations = Math.pow(2, entropy);
    const averageAttempts = totalCombinations / 2;
    const secondsToCrack = averageAttempts / attemptsPerSecond;
    
    if (secondsToCrack < 60) return 'Less than 1 minute';
    if (secondsToCrack < 3600) return `${Math.round(secondsToCrack / 60)} minutes`;
    if (secondsToCrack < 86400) return `${Math.round(secondsToCrack / 3600)} hours`;
    if (secondsToCrack < 31536000) return `${Math.round(secondsToCrack / 86400)} days`;
    if (secondsToCrack < 31536000000) return `${Math.round(secondsToCrack / 31536000)} years`;
    return 'Centuries';
  }

  calculateEntropy(password) {
    // More accurate entropy calculation
    const uniqueChars = new Set(password).size;
    const length = password.length;
    
    // Base entropy
    let entropy = length * Math.log2(uniqueChars);
    
    // Adjust for patterns and predictability
    if (this.hasRepeatingPatterns(password)) {
      entropy *= 0.8; // Reduce entropy for patterns
    }
    
    if (this.containsDictionaryWords(password)) {
      entropy *= 0.7; // Reduce entropy for dictionary words
    }
    
    return Math.round(entropy * 100) / 100;
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
      const hashMap = new Map();
      
      // Build hash map for O(1) lookup
      for (const line of lines) {
        if (!line.trim()) continue;
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
          const hash = line.substring(0, colonIndex);
          const count = parseInt(line.substring(colonIndex + 1));
          hashMap.set(hash, count);
        }
      }
      
      // Check if suffix exists in map
      if (hashMap.has(suffix)) {
        return {
          breached: true,
          count: hashMap.get(suffix)
        };
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
      score: 0,
      confidence: 0
    };

    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.toLowerCase();

      // Enhanced pattern matching with risk scoring
      for (const patternData of this.phishingPatterns) {
        if (patternData.pattern.test(domain)) {
          const riskScore = this.getRiskScore(patternData.risk);
          analysis.score += riskScore;
          analysis.reasons.push(patternData.reason);
        }
      }

      // Check for homograph attacks
      if (this.hasHomographs(domain)) {
        analysis.score += 40;
        analysis.reasons.push('Possible homograph attack');
      }

      // Check for suspicious TLDs with context
      const suspiciousTlds = ['.tk', '.ml', '.ga', '.cf', '.pw', '.xyz'];
      if (suspiciousTlds.some(tld => domain.endsWith(tld))) {
        analysis.score += 25;
        analysis.reasons.push('Suspicious top-level domain');
      }

      // Check for URL shorteners
      const shorteners = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'short.link'];
      if (shorteners.some(shortener => domain.includes(shortener))) {
        analysis.score += 20;
        analysis.reasons.push('URL shortener detected');
      }

      // Check for typosquatting of popular brands
      const typosquatting = this.detectTyposquatting(domain);
      if (typosquatting.detected) {
        analysis.score += 50;
        analysis.reasons.push(`Possible typosquatting of ${typosquatting.target}`);
      }

      // Check for suspicious subdomain patterns
      if (this.hasSuspiciousSubdomains(domain)) {
        analysis.score += 15;
        analysis.reasons.push('Suspicious subdomain pattern');
      }

      // Calculate confidence based on multiple factors
      analysis.confidence = Math.min(100, analysis.score * 1.2);

      // Final assessment with confidence weighting
      if (analysis.score >= 60) {
        analysis.isPhishing = true;
        analysis.risk = 'critical';
      } else if (analysis.score >= 40) {
        analysis.isPhishing = true;
        analysis.risk = 'high';
      } else if (analysis.score >= 25) {
        analysis.risk = 'medium';
      }

    } catch (error) {
      analysis.reasons.push('Invalid URL format');
    }

    return analysis;
  }
  
  getRiskScore(level) {
    const scores = {
      'low': 10,
      'medium': 25,
      'high': 40,
      'critical': 60
    };
    return scores[level] || 15;
  }
  
  detectTyposquatting(domain) {
    const popularBrands = [
      'google', 'facebook', 'amazon', 'microsoft', 'apple', 'paypal',
      'netflix', 'instagram', 'twitter', 'linkedin', 'github', 'dropbox'
    ];
    
    for (const brand of popularBrands) {
      if (this.isTyposquatting(domain, brand)) {
        return { detected: true, target: brand };
      }
    }
    
    return { detected: false };
  }
  
  isTyposquatting(domain, brand) {
    // Remove TLD for comparison
    const domainName = domain.split('.')[0];
    
    // Check for common typosquatting patterns
    const patterns = [
      brand.replace('o', '0'), // o -> 0
      brand.replace('i', '1'), // i -> 1
      brand.replace('l', '1'), // l -> 1
      brand + 's', // pluralization
      brand + '-secure', // security suffix
      'secure-' + brand, // security prefix
      brand.split('').reverse().join(''), // reversal
    ];
    
    return patterns.some(pattern => domainName.includes(pattern)) ||
           this.calculateLevenshteinDistance(domainName, brand) <= 2;
  }
  
  calculateLevenshteinDistance(str1, str2) {
    const matrix = Array(str2.length + 1).fill().map(() => Array(str1.length + 1).fill(0));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j - 1][i] + 1,
          matrix[j][i - 1] + 1,
          matrix[j - 1][i - 1] + cost
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }
  
  hasSuspiciousSubdomains(domain) {
    const parts = domain.split('.');
    if (parts.length < 3) return false;
    
    const suspiciousSubdomains = [
      'secure', 'login', 'account', 'verify', 'update', 'confirm',
      'auth', 'signin', 'portal', 'admin', 'support'
    ];
    
    return parts.some(part => suspiciousSubdomains.includes(part));
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
    
    const lowercase = Array.from({length: 26}, (_, i) => String.fromCharCode(97 + i)).join('');
    const uppercase = Array.from({length: 26}, (_, i) => String.fromCharCode(65 + i)).join('');
    const numbers = Array.from({length: 10}, (_, i) => i.toString()).join('');
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    if (includeLowercase) charset += lowercase;
    if (includeUppercase) charset += uppercase;
    if (includeNumbers) charset += numbers;
    if (includeSymbols) charset += symbols;

    if (excludeSimilar) {
      charset = charset.replace(/[il1Lo0O]/g, '');
    }
    
    if (excludeAmbiguous) {
      charset = charset.replace(/[{}[\]()\/\\'"~,;<>.]/g, '');
    }

    // Use cryptographically secure random generation
    const getSecureRandom = (max) => {
      const array = new Uint32Array(1);
      crypto.getRandomValues(array);
      return array[0] % max;
    };

    // Ensure at least one character from each selected category
    let password = '';
    const categories = [];
    
    if (includeLowercase) categories.push(lowercase);
    if (includeUppercase) categories.push(uppercase);
    if (includeNumbers) categories.push(numbers);
    if (includeSymbols) categories.push(symbols.substring(0, 12));

    // Add one character from each category using secure random
    categories.forEach(category => {
      const randomIndex = getSecureRandom(category.length);
      password += category[randomIndex];
    });

    // Fill remaining length with random characters
    for (let i = password.length; i < length; i++) {
      const randomIndex = getSecureRandom(charset.length);
      password += charset[randomIndex];
    }

    // Shuffle using Fisher-Yates algorithm with secure random
    const chars = password.split('');
    for (let i = chars.length - 1; i > 0; i--) {
      const j = getSecureRandom(i + 1);
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    
    return chars.join('');
  }
}

  async performComprehensiveSecurityCheck(url, credentials = null) {
    const analysis = {
      url,
      domain: new URL(url).hostname,
      timestamp: Date.now(),
      phishing: this.detectPhishing(url),
      connection: this.analyzeConnectionSecurity(url),
      breach: null,
      password: null,
      recommendations: []
    };
    
    // Check for known breaches
    if (this.breachedDomains.has(analysis.domain)) {
      analysis.breach = {
        detected: true,
        message: 'This site has been involved in previous data breaches'
      };
      analysis.recommendations.push({
        type: 'security',
        priority: 'high',
        message: 'Use a unique, strong password for this site'
      });
    }
    
    // Analyze password if provided
    if (credentials && credentials.password) {
      analysis.password = this.analyzePassword(credentials.password);
      
      // Check password breach status
      const breachCheck = await this.checkBreach(credentials.password);
      if (breachCheck.breached) {
        analysis.password.breached = true;
        analysis.password.breachCount = breachCheck.count;
        analysis.recommendations.push({
          type: 'password',
          priority: 'critical',
          message: `This password has been found in ${breachCheck.count} data breaches`
        });
      }
    }
    
    // Generate overall risk score
    analysis.overallRisk = this.calculateOverallRisk(analysis);
    
    return analysis;
  }
  
  analyzeConnectionSecurity(url) {
    const urlObj = new URL(url);
    const analysis = {
      protocol: urlObj.protocol,
      secure: urlObj.protocol === 'https:',
      issues: []
    };
    
    if (!analysis.secure && urlObj.hostname !== 'localhost') {
      analysis.issues.push('Connection is not encrypted (HTTP)');
    }
    
    return analysis;
  }
  
  calculateOverallRisk(analysis) {
    let riskScore = 0;
    
    // Phishing risk
    if (analysis.phishing.isPhishing) {
      riskScore += analysis.phishing.score;
    }
    
    // Connection security
    if (!analysis.connection.secure) {
      riskScore += 30;
    }
    
    // Breach history
    if (analysis.breach && analysis.breach.detected) {
      riskScore += 25;
    }
    
    // Password security
    if (analysis.password) {
      if (analysis.password.breached) {
        riskScore += 40;
      } else if (analysis.password.strength === 'weak') {
        riskScore += 20;
      }
    }
    
    // Normalize to 0-100 scale
    riskScore = Math.min(100, riskScore);
    
    let riskLevel = 'low';
    if (riskScore >= 70) riskLevel = 'critical';
    else if (riskScore >= 50) riskLevel = 'high';
    else if (riskScore >= 30) riskLevel = 'medium';
    
    return {
      score: riskScore,
      level: riskLevel,
      description: this.getRiskDescription(riskLevel)
    };
  }
  
  getRiskDescription(level) {
    const descriptions = {
      'low': 'This site appears to be safe',
      'medium': 'Exercise caution when using this site',
      'high': 'This site may pose security risks',
      'critical': 'This site is potentially dangerous - avoid entering sensitive information'
    };
    return descriptions[level] || 'Unknown risk level';
  }
  
  generateSecurityReport(analysis) {
    const report = {
      summary: {
        domain: analysis.domain,
        riskLevel: analysis.overallRisk.level,
        riskScore: analysis.overallRisk.score,
        description: analysis.overallRisk.description
      },
      findings: [],
      recommendations: analysis.recommendations
    };
    
    // Add findings based on analysis
    if (analysis.phishing.isPhishing) {
      report.findings.push({
        type: 'phishing',
        severity: analysis.phishing.risk,
        message: 'Potential phishing site detected',
        details: analysis.phishing.reasons
      });
    }
    
    if (!analysis.connection.secure) {
      report.findings.push({
        type: 'connection',
        severity: 'high',
        message: 'Insecure connection (HTTP)',
        details: ['Data transmitted to this site is not encrypted']
      });
    }
    
    if (analysis.password && analysis.password.breached) {
      report.findings.push({
        type: 'password',
        severity: 'critical',
        message: 'Password found in data breaches',
        details: [`Found in ${analysis.password.breachCount} breaches`]
      });
    }
    
    return report;
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SecurityAnalyzer;
} else if (typeof window !== 'undefined') {
  window.SecurityAnalyzer = SecurityAnalyzer;
}