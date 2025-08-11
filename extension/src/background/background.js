class LokBackground {
  constructor() {
    this.init();
  }

  init() {
    this.setupMessageListener();
    this.setupContextMenu();
    this.setupTabListener();
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      switch (message.action) {
        case 'openPopup':
          chrome.action.openPopup();
          break;
        case 'generatePassword':
          sendResponse({ password: this.generatePassword() });
          break;
      }
    });
  }

  setupContextMenu() {
    chrome.runtime.onInstalled.addListener(() => {
      chrome.contextMenus.create({
        id: 'lokFillPassword',
        title: 'Fill password with Lok',
        contexts: ['editable']
      });

      chrome.contextMenus.create({
        id: 'lokGeneratePassword',
        title: 'Generate password',
        contexts: ['editable']
      });
    });

    chrome.contextMenus.onClicked.addListener((info, tab) => {
      switch (info.menuItemId) {
        case 'lokFillPassword':
          chrome.action.openPopup();
          break;
        case 'lokGeneratePassword':
          const password = this.generatePassword();
          chrome.tabs.sendMessage(tab.id, {
            action: 'fillGeneratedPassword',
            password: password
          });
          break;
      }
    });
  }

  setupTabListener() {
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && tab.url) {
        // Update badge based on saved passwords for this site
        this.updateBadge(tab);
      }
    });
  }

  async updateBadge(tab) {
    try {
      const result = await chrome.storage.local.get(['token']);
      if (!result.token) return;

      const url = new URL(tab.url);
      const hostname = url.hostname;

      // Get passwords for this site
      const response = await fetch('http://localhost:5000/api/passwords', {
        headers: { 'Authorization': `Bearer ${result.token}` }
      });

      if (response.ok) {
        const passwords = await response.json();
        const sitePasswords = passwords.filter(p => 
          p.site_url.includes(hostname) || 
          p.site_name.toLowerCase().includes(hostname.toLowerCase())
        );

        if (sitePasswords.length > 0) {
          chrome.action.setBadgeText({
            text: sitePasswords.length.toString(),
            tabId: tab.id
          });
          chrome.action.setBadgeBackgroundColor({
            color: '#4CAF50',
            tabId: tab.id
          });
        } else {
          chrome.action.setBadgeText({
            text: '',
            tabId: tab.id
          });
        }
      }
    } catch (error) {
      console.error('Failed to update badge:', error);
    }
  }

  generatePassword() {
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
    
    // Add one character from each category
    categories.forEach(category => {
      password += category.charAt(Math.floor(Math.random() * category.length));
    });
    
    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
}

// Initialize background script
new LokBackground();