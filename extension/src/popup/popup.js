/**
 * Enhanced Popup interface for Lok Password Manager extension
 */

class PopupInterface {
  constructor() {
    this.API_BASE = 'https://password-manager-production-89ed.up.railway.app';
    this.WEB_APP_URL = 'https://comforting-sunshine-65105a.netlify.app';
    this.allCredentials = [];
    this.filteredCredentials = [];
    this.currentDomain = '';
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
    this.currentDomain = domain;
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
      this.showError('Failed to load credentials. Please check your connection.');
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
    this.allCredentials = credentials;
    this.filteredCredentials = credentials;
    this.renderCredentialsList();
    
    // Setup search functionality
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.filterCredentials(e.target.value);
      });
    }
  }
  
  renderCredentialsList() {
    const container = document.getElementById('credentials-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    this.filteredCredentials.forEach(credential => {
      const item = document.createElement('div');
      item.className = 'credential-item';
      
      item.innerHTML = `
        <div class="credential-icon">
          ${this.getCredentialIcon(credential)}
        </div>
        <div class="credential-info">
          <div class="credential-site">${this.escapeHtml(credential.site_name)}</div>
          <div class="credential-username">${this.escapeHtml(credential.username)}</div>
        </div>
        <div class="credential-actions">
          <div class="action-btn" title="Copy username" onclick="event.stopPropagation(); copyToClipboard('${this.escapeHtml(credential.username)}', 'Username copied!')">
            📄
          </div>
          <div class="action-btn" title="Auto-fill" onclick="event.stopPropagation(); fillCredential(${credential.id})">
            🔄
          </div>
        </div>
      `;
      
      // Add click handler for main area
      item.addEventListener('click', () => this.fillCredential(credential));
      
      container.appendChild(item);
    });
  }
  
  getCredentialIcon(credential) {
    // Try to get favicon or use first letter
    const domain = this.extractDomain(credential.site_url);
    if (domain) {
      return `<img src="https://www.google.com/s2/favicons?domain=${domain}&sz=32" 
                   onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'" 
                   style="width: 20px; height: 20px; border-radius: 4px;">
              <span style="display: none; font-size: 16px; font-weight: 600;">
                ${credential.site_name.charAt(0).toUpperCase()}
              </span>`;
    }
    return credential.site_name.charAt(0).toUpperCase();
  }
  
  extractDomain(url) {
    try {
      return new URL(url).hostname;
    } catch {
      return null;
    }
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  filterCredentials(query) {
    if (!query.trim()) {
      this.filteredCredentials = this.allCredentials;
    } else {
      const lowerQuery = query.toLowerCase();
      this.filteredCredentials = this.allCredentials.filter(cred => 
        cred.site_name.toLowerCase().includes(lowerQuery) ||
        cred.username.toLowerCase().includes(lowerQuery)
      );
    }
    this.renderCredentialsList();
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
  
  showError(message) {
    const loadingEl = document.getElementById('loading');
    const noCredentialsEl = document.getElementById('no-credentials');
    
    loadingEl.style.display = 'none';
    
    // Update no credentials message for error
    const titleEl = noCredentialsEl.querySelector('.no-credentials-title');
    const subtitleEl = noCredentialsEl.querySelector('.no-credentials-subtitle');
    
    if (titleEl) titleEl.textContent = 'Connection Error';
    if (subtitleEl) subtitleEl.textContent = message;
    
    noCredentialsEl.style.display = 'block';
  }
  
  async generatePassword() {
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'generate_password',
        options: { length: 16, includeSymbols: true }
      });
      
      if (response.success) {
        await this.copyToClipboard(response.password);
        this.showNotification('Secure password generated and copied!');
      }
    } catch (error) {
      console.error('Failed to generate password:', error);
      this.showNotification('Failed to generate password', 'error');
    }
  }
  
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }
  
  showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      background: ${type === 'error' ? '#ef4444' : '#10b981'};
      color: white;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 500;
      z-index: 10000;
      animation: slideDown 0.3s ease-out;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 2000);
  }
}

// Global functions for HTML onclick handlers
function openVault() {
  chrome.tabs.create({
    url: 'https://comforting-sunshine-65105a.netlify.app'
  });
  window.close();
}

function generatePassword() {
  if (window.popupInterface) {
    window.popupInterface.generatePassword();
  }
}

function autoFillCurrent() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'trigger_autofill' });
    window.close();
  });
}

function addNew() {
  chrome.tabs.create({
    url: 'https://comforting-sunshine-65105a.netlify.app/dashboard?action=add'
  });
  window.close();
}

function fillCredential(credentialId) {
  if (window.popupInterface && window.popupInterface.allCredentials) {
    const credential = window.popupInterface.allCredentials.find(c => c.id == credentialId);
    if (credential) {
      window.popupInterface.fillCredential(credential);
    }
  }
}

async function copyToClipboard(text, successMessage = 'Copied!') {
  try {
    await navigator.clipboard.writeText(text);
    if (window.popupInterface) {
      window.popupInterface.showNotification(successMessage);
    }
  } catch (error) {
    console.error('Failed to copy:', error);
  }
}

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.popupInterface = new PopupInterface();
  
  // Add CSS animation for notifications
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideDown {
      from {
        transform: translateX(-50%) translateY(-100%);
        opacity: 0;
      }
      to {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
});