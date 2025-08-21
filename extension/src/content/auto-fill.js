/**
 * Auto-fill functionality for detected forms
 * Optimized for performance and memory efficiency
 */

class AutoFill {
  constructor() {
    this.fillQueue = [];
    this.isProcessing = false;
    this.performance = window.LokPerformance;
    this.init();
  }
  
  init() {
    // Optimized message listener with throttling
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'fill_form') {
        this.queueFill(message.data);
        sendResponse({ success: true });
      }
    });
  }
  
  queueFill(credentials) {
    this.fillQueue.push(credentials);
    this.processFillQueue();
  }
  
  async processFillQueue() {
    if (this.isProcessing || this.fillQueue.length === 0) return;
    
    this.isProcessing = true;
    
    while (this.fillQueue.length > 0) {
      const credentials = this.fillQueue.shift();
      await this.fillForm(credentials);
      // Small delay to prevent overwhelming the DOM
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    this.isProcessing = false;
  }
  
  async fillForm(credentials) {
    this.performance.mark('fill-start');
    
    const forms = this.performance.querySelector('form[data-lok-enhanced="true"]') ?
      document.querySelectorAll('form[data-lok-enhanced="true"]') : [];
    
    const fillOperations = Array.from(forms).map(form => () => {
      const usernameField = this.findUsernameField(form);
      const passwordField = this.findPasswordField(form);
      
      if (usernameField && passwordField) {
        this.fillField(usernameField, credentials.username);
        this.fillField(passwordField, credentials.password);
        this.showFillSuccess(form);
      }
    });
    
    await this.performance.batchDOMOperations(fillOperations);
    this.performance.mark('fill-end');
  }
  
  fillField(field, value) {
    // Optimized field filling with event batching
    const events = ['focus', 'input', 'change', 'blur'];
    
    // Clear and set value
    field.value = '';
    field.focus();
    field.value = value;
    
    // Batch dispatch events
    requestAnimationFrame(() => {
      events.forEach(eventType => {
        field.dispatchEvent(new Event(eventType, { bubbles: true }));
      });
    });
  }
  
  findUsernameField(form) {
    const cacheKey = `username-${form.id || 'default'}`;
    
    return this.performance.lazy(cacheKey, () => {
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
    }, 5000);
  }
  
  findPasswordField(form) {
    const cacheKey = `password-${form.id || 'default'}`;
    
    return this.performance.lazy(cacheKey, () => {
      return form.querySelector('input[type="password"]');
    }, 5000);
  }
  
  showFillSuccess(form) {
    // Throttle success indicators to prevent spam
    this.performance.throttle('fill-success', () => {
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
        if (indicator.parentNode) {
          indicator.remove();
        }
      }, 2000);
    }, 1000);
  }
  
  cleanup() {
    this.fillQueue = [];
    this.isProcessing = false;
  }
}

window.lokAutoFill = new AutoFill();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (window.lokAutoFill) {
    window.lokAutoFill.cleanup();
  }
});