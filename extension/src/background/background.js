class LokBackground {
  constructor() {
    this.apiUrl = 'http://localhost:5000/api';
    this.cache = new Map();
    this.requestQueue = [];
    this.isProcessingQueue = false;
    this.init();
  }

  init() {
    this.setupMessageListeners();
    this.setupContextMenus();
    this.setupTabListeners();
    this.setupAlarms();
  }

  setupMessageListeners() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      // Queue requests to prevent overwhelming
      this.queueRequest(message, sender, sendResponse);
      return true;
    });
  }
  
  queueRequest(message, sender, sendResponse) {
    this.requestQueue.push({ message, sender, sendResponse });
    this.processRequestQueue();
  }
  
  async processRequestQueue() {
    if (this.isProcessingQueue || this.requestQueue.length === 0) return;
    
    this.isProcessingQueue = true;
    
    while (this.requestQueue.length > 0) {
      const { message, sender, sendResponse } = this.requestQueue.shift();
      
      try {
        switch (message.action) {
          case 'openPopup':
            chrome.action.openPopup();
            sendResponse({ success: true });
            break;
          case 'checkAuth':
            const authResult = await this.checkAuthStatus();
            sendResponse(authResult);
            break;
          case 'autoLock':
            await this.handleAutoLock();
            sendResponse({ success: true });
            break;
          case 'resetAutoLock':
            this.resetAutoLockTimer();
            sendResponse({ success: true });
            break;
          case 'generate_password':
            const password = this.generateSecurePassword(message.options);
            sendResponse({ success: true, password });
            break;
          default:
            sendResponse({ success: false, error: 'Unknown action' });
        }
      } catch (error) {
        console.error('Background script error:', error);
        sendResponse({ success: false, error: error.message });
      }
      
      // Small delay to prevent blocking
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    this.isProcessingQueue = false;
  }

  setupContextMenus() {
    chrome.runtime.onInstalled.addListener(() => {
      chrome.contextMenus.create({
        id: 'lok-fill-password',
        title: 'Fill password with Lok',
        contexts: ['editable']
      });

      chrome.contextMenus.create({
        id: 'lok-generate-password',
        title: 'Generate password with Lok',
        contexts: ['editable']
      });
    });

    chrome.contextMenus.onClicked.addListener(async (info, tab) => {
      const result = await chrome.storage.local.get(['token']);
      
      if (!result.token) {
        chrome.action.openPopup();
        return;
      }

      switch (info.menuItemId) {
        case 'lok-fill-password':
          chrome.tabs.sendMessage(tab.id, { action: 'showPasswordOptions' });
          break;
        case 'lok-generate-password':
          const password = this.generateSecurePassword();
          chrome.tabs.sendMessage(tab.id, { 
            action: 'fillGeneratedPassword', 
            password: password 
          });
          break;
      }
    });
  }

  setupTabListeners() {
    // Auto-detect login forms when tab updates
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('chrome://')) {
        chrome.tabs.sendMessage(tabId, { action: 'detectForms' }).catch(() => {
          // Ignore errors for tabs that don't have content script
        });
      }
    });
  }

  setupAlarms() {
    // Set up auto-lock alarm
    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === 'autoLock') {
        this.handleAutoLock();
      }
    });
  }

  async checkAuthStatus() {
    const cacheKey = 'auth-status';
    
    // Check cache first (5 second cache)
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < 5000) {
        return cached.data;
      }
    }
    
    const result = await chrome.storage.local.get(['token', 'lastActivity']);
    
    if (!result.token) {
      const authResult = { authenticated: false };
      this.cache.set(cacheKey, { data: authResult, timestamp: Date.now() });
      return authResult;
    }

    // Check if token is still valid
    try {
      const response = await fetch(`${this.apiUrl}/auth/verify`, {
        headers: { 'Authorization': `Bearer ${result.token}` }
      });

      if (response.ok) {
        this.resetAutoLockTimer();
        const authResult = { authenticated: true };
        this.cache.set(cacheKey, { data: authResult, timestamp: Date.now() });
        return authResult;
      } else {
        await chrome.storage.local.clear();
        const authResult = { authenticated: false };
        this.cache.set(cacheKey, { data: authResult, timestamp: Date.now() });
        return authResult;
      }
    } catch (error) {
      const authResult = { authenticated: false, error: 'Connection error' };
      this.cache.set(cacheKey, { data: authResult, timestamp: Date.now() });
      return authResult;
    }
  }

  async handleAutoLock() {
    await chrome.storage.local.clear();
    
    // Notify all tabs about logout
    const tabs = await chrome.tabs.query({});
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, { action: 'userLoggedOut' }).catch(() => {
        // Ignore errors for tabs that don't have content script
      });
    });

    // Show notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: '../icons/icon48.png',
      title: 'Lok Password Manager',
      message: 'Session expired. Please login again for security.'
    });
  }

  resetAutoLockTimer() {
    chrome.alarms.clear('autoLock');
    chrome.alarms.create('autoLock', { delayInMinutes: 15 }); // 15 minutes auto-lock
    
    chrome.storage.local.set({
      lastActivity: Date.now()
    });
  }

  generateSecurePassword(options = {}) {
    const length = options.length || 16;
    const includeSymbols = options.includeSymbols !== false;
    
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = includeSymbols ? '!@#$%^&*' : '';
    
    const charset = lowercase + uppercase + numbers + symbols;
    let password = '';
    
    // Ensure at least one character from each category
    const categories = [lowercase, uppercase, numbers];
    if (includeSymbols) categories.push(symbols);
    
    categories.forEach(category => {
      if (category) {
        password += category.charAt(Math.floor(Math.random() * category.length));
      }
    });
    
    // Fill remaining length
    for (let i = password.length; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    // Shuffle using Fisher-Yates algorithm
    const chars = password.split('');
    for (let i = chars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    return chars.join('');
  }
  
  cleanup() {
    this.cache.clear();
    this.requestQueue = [];
    this.isProcessingQueue = false;
  }
}

// Initialize background script
window.lokBackground = new LokBackground();

// Cleanup on extension unload
chrome.runtime.onSuspend.addListener(() => {
  if (window.lokBackground) {
    window.lokBackground.cleanup();
  }
});