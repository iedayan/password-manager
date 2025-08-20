/**
 * Advanced login form detection for most websites
 */

class FormDetector {
  constructor() {
    this.loginSelectors = [
      // Common login form patterns
      'form[action*="login"]',
      'form[action*="signin"]', 
      'form[action*="auth"]',
      'form[id*="login"]',
      'form[id*="signin"]',
      'form[class*="login"]',
      'form[class*="signin"]',
      
      // Generic forms with password fields
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
    
    this.init();
  }
  
  init() {
    this.detectForms();
    this.observeChanges();
  }
  
  detectForms() {
    const forms = this.findLoginForms();
    
    forms.forEach(form => {
      const formData = this.analyzeForm(form);
      if (formData.isValid) {
        this.enhanceForm(form, formData);
        this.notifyBackground('form_detected', {
          url: window.location.href,
          domain: window.location.hostname,
          formData: formData
        });
      }
    });
  }
  
  findLoginForms() {
    const forms = new Set();
    
    // Method 1: Direct form selectors
    this.loginSelectors.forEach(selector => {
      try {
        document.querySelectorAll(selector).forEach(form => forms.add(form));
      } catch (e) {
        // Ignore invalid selectors
      }
    });
    
    // Method 2: Forms containing password fields
    document.querySelectorAll('input[type="password"]').forEach(passwordField => {
      const form = passwordField.closest('form');
      if (form) forms.add(form);
    });
    
    // Method 3: Heuristic detection for SPA forms
    document.querySelectorAll('div, section').forEach(container => {
      const passwordFields = container.querySelectorAll('input[type="password"]');
      const textFields = container.querySelectorAll('input[type="text"], input[type="email"]');
      
      if (passwordFields.length > 0 && textFields.length > 0) {
        // Create virtual form for SPA
        const virtualForm = this.createVirtualForm(container, textFields, passwordFields);
        if (virtualForm) forms.add(virtualForm);
      }
    });
    
    return Array.from(forms);
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
    if (formData.usernameField && !formData.usernameField.nextElementSibling?.classList.contains('lok-autofill-btn')) {
      const button = document.createElement('button');
      button.className = 'lok-autofill-btn';
      button.type = 'button';
      button.textContent = '🔐'; // Use textContent instead of innerHTML
      button.style.cssText = `
        position: absolute;
        right: 5px;
        top: 50%;
        transform: translateY(-50%);
        border: none;
        background: #3b82f6;
        color: white;
        width: 24px;
        height: 24px;
        border-radius: 4px;
        cursor: pointer;
        z-index: 10000;
        font-size: 12px;
      `;
      
      button.addEventListener('click', () => {
        this.requestAutoFill(formData);
      });
      
      // Position relative to username field
      const fieldRect = formData.usernameField.getBoundingClientRect();
      formData.usernameField.parentNode.style.position = 'relative';
      formData.usernameField.parentNode.appendChild(button);
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
    // Watch for dynamically added forms (SPA navigation)
    const observer = new MutationObserver((mutations) => {
      let shouldRecheck = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.tagName === 'FORM' || 
                  node.querySelector && node.querySelector('form, input[type="password"]')) {
                shouldRecheck = true;
              }
            }
          });
        }
      });
      
      if (shouldRecheck) {
        setTimeout(() => this.detectForms(), 100);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  notifyBackground(action, data) {
    chrome.runtime.sendMessage({
      action: action,
      data: data
    });
  }
}

// Initialize form detector when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new FormDetector());
} else {
  new FormDetector();
}