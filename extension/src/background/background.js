class LokBackground {
  constructor() {
    this.apiUrl = 'http://localhost:5000/api';
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
      switch (message.action) {
        case 'openPopup':
          chrome.action.openPopup();
          break;
        case 'checkAuth':
          this.checkAuthStatus().then(sendResponse);
          return true;
        case 'autoLock':
          this.handleAutoLock();
          break;
        case 'resetAutoLock':
          this.resetAutoLockTimer();
          break;
      }
    });
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
    const result = await chrome.storage.local.get(['token', 'lastActivity']);
    
    if (!result.token) {
      return { authenticated: false };
    }

    // Check if token is still valid
    try {
      const response = await fetch(`${this.apiUrl}/auth/verify`, {
        headers: { 'Authorization': `Bearer ${result.token}` }
      });

      if (response.ok) {
        this.resetAutoLockTimer();
        return { authenticated: true };
      } else {
        await chrome.storage.local.clear();
        return { authenticated: false };
      }
    } catch (error) {
      return { authenticated: false, error: 'Connection error' };
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

  generateSecurePassword() {
    const length = 16;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    // Ensure at least one character from each category
    const categories = [
      'abcdefghijklmnopqrstuvwxyz',
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      '0123456789',
      '!@#$%^&*'
    ];
    
    categories.forEach(category => {
      password += category.charAt(Math.floor(Math.random() * category.length));
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
}

// Initialize background script
new LokBackground();