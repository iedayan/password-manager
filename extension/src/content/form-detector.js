/**
 * Advanced login form detection for most websites
 * Optimized for performance with caching and efficient DOM queries
 */

class FormDetector {
  constructor() {
    this.loginSelectors = [
      'form[action*="login"]',
      'form[action*="signin"]', 
      'form[action*="auth"]',
      'form[id*="login"]',
      'form[id*="signin"]',
      'form[class*="login"]',
      'form[class*="signin"]',
      'form:has(input[type="password"])',
      'form:has(input[name*="password"])',
      'form:has(input[id*="password"])'
    ];
    
    this.usernameSelectors = [
      'input[type="email"]',
      'input[type="text"][name*="email"]',
      'input[type="text"][name*="username"]',
      'input[type="text"][name*="user"]',
      'input[type="text"][id*="email"]',
      'input[type="text"][id*="username"]',
      'input[type="text"][id*="user"]',
      'input[name="login"]',
      'input[autocomplete="username"]',
      'input[autocomplete="email"]'
    ];
    
    this.passwordSelectors = [
      'input[type="password"]',
      'input[name*="password"]',
      'input[id*="password"]',
      'input[autocomplete="current-password"]',
      'input[autocomplete="new-password"]'
    ];
    
    this.detectedForms = new WeakSet();
    this.performance = window.LokPerformance;
    this.init();
  }
  
  init() {
    this.performance.mark('form-detector-start');
    this.performance.debounce('initial-detection', () => this.detectForms(), 100);
    this.observeChanges();
    this.performance.mark('form-detector-end');
  }
  
  detectForms() {
    const forms = this.findLoginForms();
    
    // Batch process forms for better performance
    this.performance.batchDOMOperations(
      forms.map(form => () => {
        if (this.detectedForms.has(form)) return;
        
        const formData = this.analyzeForm(form);
        if (formData.isValid) {
          this.detectedForms.add(form);
          this.enhanceForm(form, formData);
          this.notifyBackground('form_detected', {
            url: window.location.href,
            domain: window.location.hostname,
            formData: formData
          });
        }
      })
    );
  }
  
  findLoginForms() {
    return this.performance.lazy('login-forms', () => {
      const forms = new Set();
      
      // Method 1: Cached form queries
      this.loginSelectors.forEach(selector => {
        try {
          const elements = this.performance.querySelector(selector) ? 
            document.querySelectorAll(selector) : [];
          elements.forEach(form => forms.add(form));
        } catch (e) {
          // Ignore invalid selectors
        }
      });
      
      // Method 2: Password field forms (cached)
      const passwordFields = this.performance.querySelector('input[type="password"]') ?
        document.querySelectorAll('input[type="password"]') : [];
      
      passwordFields.forEach(passwordField => {
        const form = passwordField.closest('form');
        if (form) forms.add(form);
      });
      
      // Method 3: SPA detection (throttled)
      this.performance.throttle('spa-detection', () => {
        document.querySelectorAll('div, section').forEach(container => {
          const passwordFields = container.querySelectorAll('input[type="password"]');
          const textFields = container.querySelectorAll('input[type="text"], input[type="email"]');
          
          if (passwordFields.length > 0 && textFields.length > 0) {
            const virtualForm = this.createVirtualForm(container, textFields, passwordFields);
            if (virtualForm) forms.add(virtualForm);
          }
        });
      }, 500);
      
      return Array.from(forms);
    }, 2000);
  }
  
  analyzeForm(form) {
    const usernameField = this.findUsernameField(form);
    const passwordField = this.findPasswordField(form);
    const submitButton = this.findSubmitButton(form);
    
    return {
      isValid: !!(usernameField && passwordField),
      usernameField,
      passwordField,
      submitButton,
      formElement: form,
      isRegistration: this.isRegistrationForm(form),
      isPasswordChange: this.isPasswordChangeForm(form)
    };
  }
  
  findUsernameField(form) {
    for (const selector of this.usernameSelectors) {
      const field = form.querySelector(selector);
      if (field && this.isVisible(field)) return field;
    }
    
    // Fallback: first visible text/email input
    const textInputs = form.querySelectorAll('input[type="text"], input[type="email"]');
    for (const input of textInputs) {
      if (this.isVisible(input)) return input;
    }
    
    return null;
  }
  
  findPasswordField(form) {
    const passwordFields = form.querySelectorAll('input[type="password"]');
    
    // Return first visible password field
    for (const field of passwordFields) {
      if (this.isVisible(field)) return field;
    }
    
    return passwordFields[0] || null;
  }
  
  findSubmitButton(form) {
    // Look for submit buttons
    const submitSelectors = [
      'input[type="submit"]',
      'button[type="submit"]',
      'button:not([type])',
      'button[type="button"]'
    ];
    
    for (const selector of submitSelectors) {
      const button = form.querySelector(selector);
      if (button && this.isVisible(button)) {
        const text = button.textContent.toLowerCase();
        if (text.includes('login') || text.includes('sign in') || text.includes('submit')) {
          return button;
        }
      }
    }
    
    return form.querySelector('input[type="submit"], button[type="submit"]');
  }
  
  isVisible(element) {
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0' &&
           element.offsetWidth > 0 && 
           element.offsetHeight > 0;
  }
  
  isRegistrationForm(form) {
    const text = form.textContent.toLowerCase();
    const action = form.action.toLowerCase();
    
    return text.includes('register') || 
           text.includes('sign up') || 
           text.includes('create account') ||
           action.includes('register') ||
           action.includes('signup');
  }
  
  isPasswordChangeForm(form) {
    const passwordFields = form.querySelectorAll('input[type="password"]');
    const text = form.textContent.toLowerCase();
    
    return passwordFields.length > 1 || 
           text.includes('change password') ||
           text.includes('new password') ||
           text.includes('confirm password');
  }
  
  createVirtualForm(container, textFields, passwordFields) {
    // Create a virtual form object for SPA detection
    return {
      isVirtual: true,
      container: container,
      querySelector: (selector) => container.querySelector(selector),
      querySelectorAll: (selector) => container.querySelectorAll(selector),
      textContent: container.textContent,
      action: window.location.href
    };
  }
  
  enhanceForm(form, formData) {
    // Add Lok extension markers
    if (!form.hasAttribute('data-lok-enhanced')) {
      form.setAttribute('data-lok-enhanced', 'true');
      
      // Add auto-fill button
      this.addAutoFillButton(formData);
      
      // Listen for form submission
      this.addSubmitListener(form, formData);
    }
  }
  
  addAutoFillButton(formData) {
    if (formData.usernameField && !formData.usernameField.dataset.lokEnhanced) {
      formData.usernameField.dataset.lokEnhanced = 'true';
      
      const button = document.createElement('button');
      button.className = 'lok-autofill-btn';
      button.type = 'button';
      button.innerHTML = '🔐';
      button.title = 'Auto-fill with Lok';
      
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.requestAutoFill(formData);
      });
      
      // Smart positioning
      const parent = formData.usernameField.parentElement;
      const computedStyle = getComputedStyle(parent);
      
      if (computedStyle.position === 'static') {
        parent.style.position = 'relative';
      }
      
      parent.appendChild(button);
    }
  }
  
  addSubmitListener(form, formData) {
    form.addEventListener('submit', (e) => {
      const username = this.sanitizeInput(formData.usernameField?.value);
      const password = this.sanitizeInput(formData.passwordField?.value);
      
      if (username && password) {
        this.notifyBackground('form_submitted', {
          url: window.location.href,
          domain: window.location.hostname,
          username: username,
          password: password,
          isRegistration: formData.isRegistration
        });
      }
    });
  }
  
  sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    return input.replace(/[<>"'&]/g, '').trim();
  }
  
  requestAutoFill(formData) {
    this.notifyBackground('autofill_requested', {
      url: window.location.href,
      domain: window.location.hostname,
      formData: formData
    });
  }
  
  observeChanges() {
    // Optimized mutation observer with debouncing
    const observer = new MutationObserver((mutations) => {
      let shouldRecheck = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.tagName === 'FORM' || 
                  (node.querySelector && node.querySelector('form, input[type="password"]'))) {
                shouldRecheck = true;
              }
            }
          });
        }
      });
      
      if (shouldRecheck) {
        this.performance.debounce('form-recheck', () => {
          this.performance.lazy.delete('login-forms'); // Clear cache
          this.detectForms();
        }, 200);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Store observer for cleanup
    this.observer = observer;
  }
  
  notifyBackground(action, data) {
    this.performance.throttle(`notify-${action}`, () => {
      chrome.runtime.sendMessage({
        action: action,
        data: data
      });
    }, 100);
  }
  
  cleanup() {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.detectedForms = new WeakSet();
  }
}

// Initialize form detector when page loads (optimized)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.lokFormDetector = new FormDetector();
  });
} else {
  window.lokFormDetector = new FormDetector();
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (window.lokFormDetector) {
    window.lokFormDetector.cleanup();
  }
});