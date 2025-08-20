/**
 * Enhanced Background service worker for Lok Password Manager
 */

class BackgroundService {
  constructor() {
    this.API_BASE = 'https://password-manager-production-89ed.up.railway.app';
    this.WEB_APP_URL = 'https://comforting-sunshine-65105a.netlify.app';
    this.contextMenuId = 'lok-autofill';
    this.init();
  }
  
  init() {
    // Listen for messages from content scripts
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Keep message channel open for async responses
    });
    
    // Handle extension icon click
    chrome.action.onClicked.addListener((tab) => {
      this.openPopup(tab);
    });
    
    // Handle keyboard shortcuts
    chrome.commands.onCommand.addListener((command) => {
      this.handleCommand(command);
    });
    
    // Setup context menus
    this.setupContextMenus();
    
    // Handle notifications
    chrome.notifications.onClicked.addListener((notificationId) => {
      this.handleNotificationClick(notificationId);
    });
    
    // Handle tab updates for security checks
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && tab.url) {
        this.performTabSecurityCheck(tab);
      }
    });
    
    // Periodic security checks
    this.startPeriodicSecurityChecks();
  }
  
  async handleMessage(message, sender, sendResponse) {
    try {
      switch (message.action) {
        case 'form_detected':
          await this.handleFormDetected(message.data, sender.tab);
          break;
          
        case 'autofill_requested':
          await this.handleAutoFillRequest(message.data, sender.tab);
          break;
          
        case 'form_submitted':
          await this.handleFormSubmitted(message.data, sender.tab);
          break;
          
        case 'get_credentials':
          const credentials = await this.getCredentialsForDomain(message.domain);
          sendResponse({ success: true, credentials });
          return;
          
        case 'save_credentials':
          await this.saveCredentials(message.data);
          break;
          
        case 'check_breach':
          await this.checkPasswordBreach(message.data);
          break;
          
        case 'generate_password':
          const password = this.generateSecurePassword(message.options);
          sendResponse({ success: true, password });
          return;
          
        default:
          console.log('Unknown message action:', message.action);
      }
      
      sendResponse({ success: true });
    } catch (error) {
      console.error('Background service error:', error);
      sendResponse({ success: false, error: error.message });
    }
  }
  
  async handleFormDetected(data, tab) {
    console.log('Login form detected:', data);
    
    // Check if we have credentials for this domain
    const credentials = await this.getCredentialsForDomain(data.domain);
    
    if (credentials.length > 0) {
      // Show notification that auto-fill is available
      this.showAutoFillNotification(tab.id, credentials.length);
    }
  }
  
  async handleAutoFillRequest(data, tab) {
    console.log('Auto-fill requested for:', data.domain);
    
    const credentials = await this.getCredentialsForDomain(data.domain);
    
    if (credentials.length === 1) {
      // Auto-fill immediately if only one credential
      await this.fillCredentials(tab.id, credentials[0]);
    } else if (credentials.length > 1) {
      // Show selection popup if multiple credentials
      this.showCredentialSelection(tab.id, credentials);
    } else {
      // No credentials found
      this.showNoCredentialsMessage(tab.id);
    }
  }
  
  async handleFormSubmitted(data, tab) {
    console.log('Form submitted:', data);
    
    if (data.isRegistration) {
      // Offer to save new credentials
      this.offerToSaveCredentials(tab.id, data);
    } else {
      // Update existing credentials if changed
      await this.updateCredentialsIfChanged(data);
    }
  }
  
  async getCredentialsForDomain(domain) {
    try {
      const token = await this.getAuthToken();
      if (!token) return [];
      
      const response = await fetch(`${this.API_BASE}/api/v1/extension/credentials?domain=${domain}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.credentials || [];
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
  
  async fillCredentials(tabId, credentials) {
    try {
      await chrome.tabs.sendMessage(tabId, {
        action: 'fill_form',
        data: credentials
      });
    } catch (error) {
      console.error('Failed to fill credentials:', error);
    }
  }
  
  showAutoFillNotification(tabId, count) {
    chrome.action.setBadgeText({
      text: count.toString(),
      tabId: tabId
    });
    
    chrome.action.setBadgeBackgroundColor({
      color: '#3b82f6',
      tabId: tabId
    });
  }
  
  showCredentialSelection(tabId, credentials) {
    // This would open a popup or inject a selection UI
    console.log('Multiple credentials available:', credentials);
  }
  
  showNoCredentialsMessage(tabId) {
    console.log('No credentials found for this domain');
  }
  
  offerToSaveCredentials(tabId, data) {
    // Show save credentials notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'assets/icon-48.png',
      title: 'Save Password?',
      message: `Save credentials for ${data.domain}?`,
      buttons: [
        { title: 'Save' },
        { title: 'Not Now' }
      ]
    });
  }
  
  async updateCredentialsIfChanged(data) {
    // Check if credentials have changed and update if needed
    console.log('Checking for credential updates:', data);
  }
  
  async handleCommand(command) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    switch (command) {
      case 'auto-fill':
        await this.handleAutoFillRequest({ domain: new URL(tab.url).hostname }, tab);
        break;
        
      case 'open-vault':
        chrome.tabs.create({ url: this.WEB_APP_URL });
        break;
    }
  }
  
  setupContextMenus() {
    chrome.contextMenus.create({
      id: this.contextMenuId,
      title: 'Auto-fill with Lok',
      contexts: ['editable'],
      documentUrlPatterns: ['http://*/*', 'https://*/*']
    });
    
    chrome.contextMenus.onClicked.addListener(async (info, tab) => {
      if (info.menuItemId === this.contextMenuId) {
        await this.handleAutoFillRequest({ domain: new URL(tab.url).hostname }, tab);
      }
    });
  }
  
  async performTabSecurityCheck(tab) {
    const url = new URL(tab.url);
    
    // Check for insecure connections
    if (url.protocol === 'http:' && url.hostname !== 'localhost') {
      chrome.tabs.sendMessage(tab.id, {
        action: 'security_warning',
        data: { type: 'insecure_connection', message: 'This site is not secure' }
      }).catch(() => {}); // Ignore if content script not ready
    }
    
    // Check for known phishing domains
    if (await this.isPhishingSite(url.hostname)) {
      chrome.tabs.sendMessage(tab.id, {
        action: 'security_warning',
        data: { type: 'phishing', message: 'Potential phishing site detected' }
      }).catch(() => {});
    }
  }
  
  async isPhishingSite(domain) {
    // Basic phishing detection - in production, use a proper API
    const suspiciousPatterns = [
      /[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/, // IP addresses
      /(paypal|amazon|google|microsoft|apple).*\.(tk|ml|ga|cf|xyz)$/i
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(domain));
  }
  
  async saveCredentials(data) {
    try {
      const token = await this.getAuthToken();
      if (!token) throw new Error('Not authenticated');
      
      const response = await fetch(`${this.API_BASE}/api/v1/passwords`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save credentials');
      }
      
      // Show success notification
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'assets/icon48.png',
        title: 'Credentials Saved',
        message: `Saved credentials for ${data.site_name}`
      });
      
    } catch (error) {
      console.error('Save credentials error:', error);
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'assets/icon48.png',
        title: 'Save Failed',
        message: 'Failed to save credentials'
      });
    }
  }
  
  async checkPasswordBreach(data) {
    try {
      // Use HaveIBeenPwned API or similar service
      const hash = await this.sha1Hash(data.password);
      const prefix = hash.substring(0, 5);
      const suffix = hash.substring(5).toUpperCase();
      
      const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
      const text = await response.text();
      
      if (text.includes(suffix)) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'assets/icon48.png',
          title: 'Password Compromised',
          message: 'This password has been found in data breaches. Consider changing it.'
        });
      }
    } catch (error) {
      console.error('Breach check error:', error);
    }
  }
  
  async sha1Hash(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  generateSecurePassword(options = {}) {
    const {
      length = 16,
      includeUppercase = true,
      includeLowercase = true,
      includeNumbers = true,
      includeSymbols = true,
      excludeSimilar = true
    } = options;
    
    let charset = '';
    if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    if (excludeSimilar) {
      charset = charset.replace(/[0O1lI]/g, '');
    }
    
    let password = '';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    
    for (let i = 0; i < length; i++) {
      password += charset[array[i] % charset.length];
    }
    
    return password;
  }
  
  startPeriodicSecurityChecks() {
    // Check for security updates every hour
    setInterval(async () => {
      await this.performPeriodicSecurityCheck();
    }, 60 * 60 * 1000);
  }
  
  async performPeriodicSecurityCheck() {
    try {
      const token = await this.getAuthToken();
      if (!token) return;
      
      // Check for compromised passwords
      const response = await fetch(`${this.API_BASE}/api/v1/security/check`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.compromised_count > 0) {
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'assets/icon48.png',
            title: 'Security Alert',
            message: `${data.compromised_count} of your passwords may be compromised`
          });
        }
      }
    } catch (error) {
      console.error('Periodic security check error:', error);
    }
  }
  
  handleNotificationClick(notificationId) {
    chrome.tabs.create({ url: this.WEB_APP_URL });
    chrome.notifications.clear(notificationId);
  }
  
  openPopup(tab) {
    // Open the main web app in a new tab
    chrome.tabs.create({
      url: this.WEB_APP_URL
    });
  }
}

new BackgroundService();