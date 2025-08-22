/**
 * Enhanced password generator with strength indicator
 */

class PasswordGenerator {
  constructor() {
    this.options = {
      length: 20,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
      excludeSimilar: true
    };
  }

  generate(customOptions = {}) {
    const options = { ...this.options, ...customOptions };
    let charset = '';
    
    if (options.includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (options.includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (options.includeNumbers) charset += '0123456789';
    if (options.includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    if (options.excludeSimilar) {
      charset = charset.replace(/[0O1lI]/g, '');
    }

    let password = '';
    const array = new Uint8Array(options.length);
    crypto.getRandomValues(array);
    
    for (let i = 0; i < options.length; i++) {
      password += charset[array[i] % charset.length];
    }
    
    return password;
  }

  calculateStrength(password) {
    let score = 0;
    let feedback = [];

    if (password.length >= 12) score += 25;
    else feedback.push('Use at least 12 characters');

    if (/[a-z]/.test(password)) score += 15;
    else feedback.push('Add lowercase letters');

    if (/[A-Z]/.test(password)) score += 15;
    else feedback.push('Add uppercase letters');

    if (/[0-9]/.test(password)) score += 15;
    else feedback.push('Add numbers');

    if (/[^A-Za-z0-9]/.test(password)) score += 20;
    else feedback.push('Add symbols');

    if (password.length >= 16) score += 10;

    let strength = 'Weak';
    let color = '#ef4444';

    if (score >= 80) {
      strength = 'Very Strong';
      color = '#10b981';
    } else if (score >= 60) {
      strength = 'Strong';
      color = '#059669';
    } else if (score >= 40) {
      strength = 'Medium';
      color = '#f59e0b';
    }

    return { score, strength, color, feedback };
  }
}

window.PasswordGenerator = PasswordGenerator;