/**
 * Auto-fill functionality for detected forms
 */

class AutoFill {
  constructor() {
    this.init();
  }
  
  init() {
    // Listen for auto-fill commands from background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'fill_form') {
        this.fillForm(message.data);
        sendResponse({ success: true });
      }
    });
  }
  
  fillForm(credentials) {
    const forms = document.querySelectorAll('form[data-lok-enhanced="true"]');
    
    forms.forEach(form => {
      const usernameField = this.findUsernameField(form);
      const passwordField = this.findPasswordField(form);
      
      if (usernameField && passwordField) {
        // Fill with smooth animation
        this.fillField(usernameField, credentials.username);
        this.fillField(passwordField, credentials.password);
        
        // Show success indicator
        this.showFillSuccess(form);
      }
    });
  }
  
  fillField(field, value) {
    // Clear existing value
    field.value = '';
    
    // Simulate typing for better compatibility
    field.focus();
    
    // Trigger input events for React/Vue compatibility
    field.dispatchEvent(new Event('focus', { bubbles: true }));
    
    // Set value
    field.value = value;
    
    // Trigger change events
    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.dispatchEvent(new Event('change', { bubbles: true }));
    field.dispatchEvent(new Event('blur', { bubbles: true }));
  }
  
  findUsernameField(form) {
    const selectors = [
      'input[type="email"]',
      'input[type="text"][name*="email"]',
      'input[type="text"][name*="username"]',
      'input[autocomplete="username"]'
    ];
    
    for (const selector of selectors) {
      const field = form.querySelector(selector);
      if (field) return field;
    }
    
    return form.querySelector('input[type="text"]');
  }
  
  findPasswordField(form) {
    return form.querySelector('input[type="password"]');
  }
  
  showFillSuccess(form) {
    const indicator = document.createElement('div');
    indicator.textContent = '✓ Filled by Lok';
    indicator.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 14px;
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(indicator);
    
    setTimeout(() => {
      indicator.remove();
    }, 2000);
  }
}

new AutoFill();