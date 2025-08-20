/**
 * Popup interface for Lok Password Manager extension
 */

class PopupInterface {
  constructor() {
    this.API_BASE = 'https://password-manager-production-89ed.up.railway.app';
    this.init();
  }
  
  async init() {
    try {
      const tab = await this.getCurrentTab();
      const domain = new URL(tab.url).hostname;
      
      await this.loadCredentials(domain);
    } catch (error) {
      console.error('Popup initialization failed:', error);
      this.showError();
    }
  }
  
  async getCurrentTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab;
  }
  
  async loadCredentials(domain) {
    const loadingEl = document.getElementById('loading');
    const credentialsEl = document.getElementById('credentials');
    const noCredentialsEl = document.getElementById('no-credentials');
    
    try {
      const credentials = await this.getCredentialsForDomain(domain);
      
      loadingEl.style.display = 'none';
      
      if (credentials.length > 0) {
        this.displayCredentials(credentials);
        credentialsEl.style.display = 'block';
      } else {
        noCredentialsEl.style.display = 'block';
      }
    } catch (error) {
      console.error('Failed to load credentials:', error);
      loadingEl.style.display = 'none';
      noCredentialsEl.style.display = 'block';
    }
  }
  
  async getCredentialsForDomain(domain) {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    const response = await fetch(`${this.API_BASE}/api/v1/extension/credentials?domain=${domain}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch credentials');
    }
    
    const data = await response.json();
    return data.credentials || [];
  }
  
  async getAuthToken() {
    const result = await chrome.storage.local.get(['authToken']);
    return result.authToken;
  }
  
  displayCredentials(credentials) {
    const container = document.getElementById('credentials');
    
    credentials.forEach(credential => {
      const item = document.createElement('div');
      item.className = 'credential-item';
      item.onclick = () => this.fillCredential(credential);
      
      item.innerHTML = `
        <div class="credential-icon">
          ${credential.site_name.charAt(0).toUpperCase()}
        </div>
        <div class="credential-info">
          <div class="credential-site">${credential.site_name}</div>
          <div class="credential-username">${credential.username}</div>
        </div>
      `;
      
      container.appendChild(item);
    });
  }
  
  async fillCredential(credential) {
    try {
      const tab = await this.getCurrentTab();
      
      await chrome.tabs.sendMessage(tab.id, {
        action: 'fill_form',
        data: credential
      });
      
      // Close popup after filling
      window.close();
    } catch (error) {
      console.error('Failed to fill credential:', error);
    }
  }
  
  showError() {
    const loadingEl = document.getElementById('loading');
    const noCredentialsEl = document.getElementById('no-credentials');
    
    loadingEl.style.display = 'none';
    noCredentialsEl.style.display = 'block';
  }
}

function openVault() {
  chrome.tabs.create({
    url: 'https://comforting-sunshine-65105a.netlify.app'
  });
  window.close();
}

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new PopupInterface();
});