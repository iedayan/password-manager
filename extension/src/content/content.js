/**
 * Optimized main content script for Lok Password Manager
 * Coordinates form detection, auto-fill, and UI interactions
 * Enhanced with performance optimizations and memory management
 */

class LokContentScript {
  constructor() {
    this.API_BASE = 'https://password-manager-production-89ed.up.railway.app';
    this.currentDomain = window.location.hostname;
    this.detectedForms = new WeakMap();
    this.isAuthenticated = false;
    this.credentialsCache = new Map();
    this.performance = window.LokPerformance;
    
    this.init();
  }
  
  async init() {
    this.performance.mark('content-script-start');
    
    // Batch initialization tasks
    await Promise.all([
      this.checkAuthStatus(),
      this.setupMessageListeners(),
      this.setupKeyboardShortcuts(),
      this.setupContextMenu()
    ]);
    
    // Defer non-critical tasks
    this.performance.debounce('security-check', () => {
      this.checkSiteSecurityStatus();
    }, 1000);
    
    this.performance.mark('content-script-end');
    console.log('Lok Password Manager extension loaded');
  }
  
  async checkAuthStatus() {
    try {
      const result = await chrome.storage.local.get(['authToken']);
      this.isAuthenticated = !!result.authToken;
      
      if (!this.isAuthenticated) {
        this.showAuthenticationPrompt();
      }
    } catch (error) {
      console.error('Failed to check auth status:', error);
    }
  }
  
  setupMessageListeners() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      switch (message.action) {
        case 'fill_form':
          this.fillForm(message.data);
          sendResponse({ success: true });
          break;
          
        case 'show_credential_selector':
          this.showCredentialSelector(message.data);
          sendResponse({ success: true });
          break;
          
        case 'save_credentials':
          this.showSavePrompt(message.data);
          sendResponse({ success: true });
          break;
          
        case 'security_check':
          this.performSecurityCheck(message.data);
          sendResponse({ success: true });
          break;
          
        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
      
      return true;
    });
  }
  
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + Shift + L for auto-fill
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'L') {
        e.preventDefault();
        this.triggerAutoFill();
      }
      
      // Ctrl/Cmd + Shift + V for vault
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'V') {
        e.preventDefault();
        this.openVault();
      }
    });
  }
  
  setupContextMenu() {
    document.addEventListener('contextmenu', (e) => {
      const target = e.target;
      
      if (target.type === 'password' || target.type === 'email' || 
          (target.type === 'text' && this.isUsernameField(target))) {
        // Store context for potential auto-fill
        this.contextTarget = target;
      }
    });
  }
  
  async triggerAutoFill() {
    if (!this.isAuthenticated) {
      this.showNotification(
        'Sign in to your Lok account to access saved passwords',
        'warning',
        'Login Required'
      );
      return;
    }
    
    const credentials = await this.getCredentialsForCurrentSite();
    
    if (credentials.length === 0) {
      this.showNotification('No credentials found for this site', 'warning');
      return;
    }
    
    if (credentials.length === 1) {
      this.fillForm(credentials[0]);
    } else {
      this.showCredentialSelector(credentials);
    }
  }
  
  async getCredentialsForCurrentSite() {
    const cacheKey = `credentials-${this.currentDomain}`;
    
    // Check cache first
    if (this.credentialsCache.has(cacheKey)) {
      const cached = this.credentialsCache.get(cacheKey);
      if (Date.now() - cached.timestamp < 30000) { // 30 second cache
        return cached.data;
      }
    }
    
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${this.API_BASE}/api/v1/extension/credentials?domain=${this.currentDomain}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const credentials = data.credentials || [];
        
        // Cache the result
        this.credentialsCache.set(cacheKey, {
          data: credentials,
          timestamp: Date.now()
        });
        
        return credentials;
      }
      
      return [];
    } catch (error) {
      console.error('Failed to get credentials:', error);
      return [];
    }
  }
  
  async getAuthToken() {
    const result = await chrome.storage.local.get(['authToken']);
    return result.authToken;
  }
  
  fillForm(credentials) {
    const forms = document.querySelectorAll('form');
    let filled = false;
    
    forms.forEach(form => {
      const usernameField = this.findUsernameField(form);
      const passwordField = this.findPasswordField(form);
      
      if (usernameField && passwordField) {
        this.fillField(usernameField, credentials.username);
        this.fillField(passwordField, credentials.password);
        filled = true;
      }
    });
    
    if (filled) {
      this.showNotification('✓ Credentials filled successfully');
    } else {
      this.showNotification('No suitable form found', 'warning');
    }
  }
  
  fillField(field, value) {
    // Focus the field
    field.focus();
    
    // Clear existing value
    field.value = '';
    
    // Set new value
    field.value = value;
    
    // Trigger events for framework compatibility
    const events = ['input', 'change', 'keyup', 'blur'];
    events.forEach(eventType => {
      field.dispatchEvent(new Event(eventType, { bubbles: true }));
    });
    
    // Add visual feedback
    field.style.borderColor = '#10b981';
    field.style.boxShadow = '0 0 0 2px rgba(16, 185, 129, 0.2)';
    
    setTimeout(() => {
      field.style.borderColor = '';
      field.style.boxShadow = '';
    }, 1000);
  }
  
  findUsernameField(form) {
    const selectors = [
      'input[type="email"]',
      'input[autocomplete="username"]',
      'input[autocomplete="email"]',
      'input[name*="email"]',
      'input[name*="username"]',
      'input[name*="user"]',
      'input[id*="email"]',
      'input[id*="username"]',
      'input[id*="user"]'
    ];
    
    for (const selector of selectors) {
      const field = form.querySelector(selector);
      if (field && this.isVisible(field)) return field;
    }
    
    // Fallback to first text input
    const textInputs = form.querySelectorAll('input[type="text"]');
    for (const input of textInputs) {
      if (this.isVisible(input)) return input;
    }
    
    return null;
  }
  
  findPasswordField(form) {
    const passwordFields = form.querySelectorAll('input[type="password"]');
    for (const field of passwordFields) {
      if (this.isVisible(field)) return field;
    }
    return null;
  }
  
  isUsernameField(field) {
    const name = (field.name || '').toLowerCase();
    const id = (field.id || '').toLowerCase();
    const autocomplete = (field.autocomplete || '').toLowerCase();
    
    return name.includes('email') || name.includes('username') || name.includes('user') ||
           id.includes('email') || id.includes('username') || id.includes('user') ||
           autocomplete.includes('email') || autocomplete.includes('username');
  }
  
  isVisible(element) {
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0' &&
           element.offsetWidth > 0 && 
           element.offsetHeight > 0;
  }
  
  showCredentialSelector(credentials) {
    // Throttle selector creation
    this.performance.throttle('credential-selector', () => {
      this.removeCredentialSelector();
      
      const overlay = document.createElement('div');
      overlay.className = 'lok-overlay';
      overlay.onclick = () => this.removeCredentialSelector();
      
      const selector = document.createElement('div');
      selector.className = 'lok-credential-selector';
      
      // Use DocumentFragment for better performance
      const fragment = document.createDocumentFragment();
      
      const header = document.createElement('div');
      header.className = 'lok-credential-selector-header';
      header.innerHTML = `
        <h3 class="lok-credential-selector-title">Choose Account</h3>
        <p class="lok-credential-selector-subtitle">Select credentials for ${this.currentDomain}</p>
      `;
      
      const list = document.createElement('div');
      list.className = 'lok-credential-list';
      
      credentials.forEach(cred => {
        const item = document.createElement('div');
        item.className = 'lok-credential-item';
        item.dataset.id = cred.id;
        item.innerHTML = `
          <div class="lok-credential-icon">
            ${cred.site_name.charAt(0).toUpperCase()}
          </div>
          <div class="lok-credential-info">
            <div class="lok-credential-site">${cred.site_name}</div>
            <div class="lok-credential-username">${cred.username}</div>
          </div>
        `;
        list.appendChild(item);
      });
      
      const footer = document.createElement('div');
      footer.className = 'lok-credential-selector-footer';
      footer.innerHTML = `
        <button class="lok-btn lok-btn-secondary" onclick="document.querySelector('.lok-overlay').click()">Cancel</button>
        <button class="lok-btn lok-btn-primary" onclick="window.open('${this.API_BASE.replace('password-manager-production-89ed.up.railway.app', 'comforting-sunshine-65105a.netlify.app')}')">Open Vault</button>
      `;
      
      fragment.appendChild(header);
      fragment.appendChild(list);
      fragment.appendChild(footer);
      selector.appendChild(fragment);
      
      // Efficient event delegation
      this.performance.delegate(selector, '.lok-credential-item', 'click', (e) => {
        const credId = e.currentTarget.dataset.id;
        const credential = credentials.find(c => c.id == credId);
        if (credential) {
          this.fillForm(credential);
          this.removeCredentialSelector();
        }
      });
      
      document.body.appendChild(overlay);
      document.body.appendChild(selector);
    }, 300);
  }
  
  removeCredentialSelector() {
    const overlay = document.querySelector('.lok-overlay');
    const selector = document.querySelector('.lok-credential-selector');
    
    if (overlay) overlay.remove();
    if (selector) selector.remove();
  }
  
  showSavePrompt(data) {
    // Remove existing prompt
    this.removeSavePrompt();
    
    const prompt = document.createElement('div');
    prompt.className = 'lok-save-prompt';
    prompt.innerHTML = `
      <div class="lok-save-prompt-header">
        <h3 class="lok-save-prompt-title">Save Password?</h3>
        <p class="lok-save-prompt-subtitle">Save credentials for ${this.currentDomain}</p>
      </div>
      <div class="lok-save-prompt-body">
        <div class="lok-save-prompt-field">
          <label class="lok-save-prompt-label">Site Name</label>
          <input class="lok-save-prompt-input" type="text" value="${data.siteName || this.currentDomain}" id="lok-site-name">
        </div>
        <div class="lok-save-prompt-field">
          <label class="lok-save-prompt-label">Username</label>
          <input class="lok-save-prompt-input" type="text" value="${data.username}" id="lok-username">
        </div>
      </div>
      <div class="lok-save-prompt-footer">
        <button class="lok-btn lok-btn-secondary" onclick="document.querySelector('.lok-save-prompt').remove()">Not Now</button>
        <button class="lok-btn lok-btn-primary" id="lok-save-btn">Save</button>
      </div>
    `;
    
    // Add save handler
    prompt.querySelector('#lok-save-btn').onclick = () => {
      this.saveCredentials({
        siteName: prompt.querySelector('#lok-site-name').value,
        username: prompt.querySelector('#lok-username').value,
        password: data.password,
        url: window.location.href,
        domain: this.currentDomain
      });
      this.removeSavePrompt();
    };
    
    document.body.appendChild(prompt);
    
    // Auto-remove after 10 seconds
    setTimeout(() => this.removeSavePrompt(), 10000);
  }
  
  removeSavePrompt() {
    const prompt = document.querySelector('.lok-save-prompt');
    if (prompt) prompt.remove();
  }
  
  async saveCredentials(data) {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${this.API_BASE}/api/v1/passwords`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          site_name: data.siteName,
          site_url: data.url,
          username: data.username,
          password: data.password
        })
      });
      
      if (response.ok) {
        this.showNotification('✓ Credentials saved successfully');
        // Clear cache to force refresh
        this.credentialsCache.clear();
      } else {
        throw new Error('Failed to save credentials');
      }
    } catch (error) {
      console.error('Save credentials error:', error);
      this.showNotification('Failed to save credentials', 'error');
    }
  }
  
  checkSiteSecurityStatus() {
    // Check if site is using HTTPS
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      this.showSecurityIndicator('Insecure connection detected', 'danger');
    }
    
    // Check for known phishing domains (basic check)
    if (this.isPotentialPhishingSite()) {
      this.showSecurityIndicator('Potential phishing site detected', 'danger');
    }
  }
  
  isPotentialPhishingSite() {
    const suspiciousPatterns = [
      /[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/, // IP addresses
      /[a-z]+-[a-z]+\.(tk|ml|ga|cf)$/, // Suspicious TLDs
      /(paypal|amazon|google|microsoft|apple).*\.(tk|ml|ga|cf|xyz)$/i // Brand impersonation
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(this.currentDomain));
  }
  
  showSecurityIndicator(message, type = 'info') {
    const indicator = document.createElement('div');
    indicator.className = `lok-security-indicator ${type}`;
    indicator.textContent = message;
    
    document.body.appendChild(indicator);
    
    setTimeout(() => {
      if (indicator.parentNode) {
        indicator.remove();
      }
    }, 5000);
  }
  
  showNotification(message, type = 'success', title = null) {
    this.performance.throttle('notification', () => {
      const existing = document.querySelectorAll('.lok-notification');
      existing.forEach(n => n.remove());
      
      const notification = document.createElement('div');
      notification.className = `lok-notification ${type}`;
      
      const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
      };
      
      notification.innerHTML = `
        <div class="lok-notification-icon">${icons[type] || '•'}</div>
        <div class="lok-notification-content">
          ${title ? `<div class="lok-notification-title">${title}</div>` : ''}
          <div class="lok-notification-message">${message}</div>
        </div>
        <button class="lok-notification-close">×</button>
      `;
      
      notification.querySelector('.lok-notification-close').onclick = () => {
        notification.remove();
      };
      
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (notification.parentNode) {
          notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
          setTimeout(() => notification.remove(), 300);
        }
      }, 4000);
    }, 500);
  }
  
  showAuthenticationPrompt() {
    this.showNotification(
      'Sign in to unlock auto-fill and secure password management',
      'info',
      'Authentication Required'
    );
  }
  
  openVault() {
    window.open('https://comforting-sunshine-65105a.netlify.app', '_blank');
  }
  
  performSecurityCheck(data) {
    // Implement security checks like breach detection
    console.log('Performing security check:', data);
  }
  
  cleanup() {
    // Clear caches
    this.credentialsCache.clear();
    this.detectedForms = new WeakMap();
    
    // Remove UI elements
    this.removeCredentialSelector();
    this.removeSavePrompt();
    
    // Clear existing notifications
    const notifications = document.querySelectorAll('.lok-notification, .lok-security-indicator');
    notifications.forEach(n => n.remove());
  }
}

// Initialize the content script (optimized)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.lokContentScript = new LokContentScript();
  });
} else {
  window.lokContentScript = new LokContentScript();
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (window.lokContentScript) {
    window.lokContentScript.cleanup();
  }
});