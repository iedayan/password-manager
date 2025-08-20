/**
 * Background service worker for Lok Password Manager
 */

class BackgroundService {
  constructor() {
    this.API_BASE = 'https://password-manager-production-89ed.up.railway.app';
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
  
  openPopup(tab) {
    // Open the main web app in a new tab
    chrome.tabs.create({
      url: 'https://comforting-sunshine-65105a.netlify.app'
    });
  }
}

new BackgroundService();