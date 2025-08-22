/**
 * Smart password suggestions and form analysis
 */

class SmartSuggestions {
  constructor() {
    this.suggestions = [];
    this.formAnalysis = new Map();
  }

  analyzeForm(form) {
    const analysis = {
      isLogin: this.isLoginForm(form),
      isRegistration: this.isRegistrationForm(form),
      isPasswordChange: this.isPasswordChangeForm(form),
      securityLevel: this.assessSecurityLevel(form),
      suggestions: []
    };

    if (analysis.isRegistration) {
      analysis.suggestions.push({
        type: 'password_strength',
        message: 'Use a strong, unique password',
        action: 'generate_password'
      });
    }

    if (analysis.securityLevel < 3) {
      analysis.suggestions.push({
        type: 'security_warning',
        message: 'This site may not be secure',
        action: 'show_security_info'
      });
    }

    this.formAnalysis.set(form, analysis);
    return analysis;
  }

  isLoginForm(form) {
    const text = form.textContent.toLowerCase();
    const action = form.action.toLowerCase();
    
    return (text.includes('login') || text.includes('sign in') || 
            action.includes('login') || action.includes('signin')) &&
           !text.includes('register') && !text.includes('sign up');
  }

  isRegistrationForm(form) {
    const text = form.textContent.toLowerCase();
    const action = form.action.toLowerCase();
    
    return text.includes('register') || text.includes('sign up') || 
           text.includes('create account') || action.includes('register');
  }

  isPasswordChangeForm(form) {
    const passwordFields = form.querySelectorAll('input[type="password"]');
    const text = form.textContent.toLowerCase();
    
    return passwordFields.length > 1 || 
           text.includes('change password') || 
           text.includes('new password');
  }

  assessSecurityLevel(form) {
    let score = 0;
    
    // HTTPS check
    if (window.location.protocol === 'https:') score += 2;
    
    // Password field attributes
    const passwordField = form.querySelector('input[type="password"]');
    if (passwordField) {
      if (passwordField.hasAttribute('autocomplete')) score += 1;
      if (passwordField.hasAttribute('minlength')) score += 1;
    }
    
    // Form security attributes
    if (form.hasAttribute('novalidate') === false) score += 1;
    
    return Math.min(score, 5);
  }

  showSuggestion(suggestion) {
    const toast = document.createElement('div');
    toast.className = 'lok-suggestion-toast';
    toast.innerHTML = `
      <div class="suggestion-content">
        <div class="suggestion-icon">${this.getIcon(suggestion.type)}</div>
        <div class="suggestion-text">
          <div class="suggestion-title">${suggestion.title || 'Security Suggestion'}</div>
          <div class="suggestion-message">${suggestion.message}</div>
          <div class="suggestion-actions">
            <button class="suggestion-action primary" data-action="${suggestion.action}">
              ${this.getActionText(suggestion.action)}
            </button>
            <button class="suggestion-action" data-action="dismiss">
              Dismiss
            </button>
          </div>
        </div>
      </div>
    `;
    
    toast.addEventListener('click', (e) => {
      if (e.target.dataset.action === 'dismiss') {
        toast.remove();
      }
    });
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.animation = 'slideOutDown 0.4s ease-in forwards';
        setTimeout(() => toast.remove(), 400);
      }
    }, 10000);
  }

  getIcon(type) {
    const icons = {
      password_strength: '🔒',
      security_warning: '⚠️',
      breach_alert: '🚨',
      suggestion: '💡'
    };
    return icons[type] || '💡';
  }

  getActionText(action) {
    const texts = {
      generate_password: 'Generate',
      show_security_info: 'Learn More',
      check_breach: 'Check',
      dismiss: 'Dismiss'
    };
    return texts[action] || 'OK';
  }
}

window.SmartSuggestions = SmartSuggestions;