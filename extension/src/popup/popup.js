class LokPopup {
  constructor() {
    this.apiUrl = 'http://localhost:5000/api';
    this.init();
  }

  async init() {
    await this.checkAuthStatus();
    this.bindEvents();
    await this.getCurrentTab();
    this.resetAutoLockTimer();
  }

  async checkAuthStatus() {
    const result = await chrome.runtime.sendMessage({ action: 'checkAuth' });
    
    if (result.authenticated) {
      this.showVault();
      await this.loadPasswords();
    } else {
      this.showLogin();
      if (result.error) {
        this.showNotification(result.error, 'error');
      }
    }
  }

  bindEvents() {
    document.getElementById('loginBtn').addEventListener('click', () => this.login());
    document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
    document.getElementById('generateBtn').addEventListener('click', () => this.authorizedAction(() => this.generatePassword()));
    document.getElementById('togglePasswordBtn').addEventListener('click', () => this.togglePassword());
    
    // Enter key for login
    document.getElementById('password').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.login();
    });
  }

  async authorizedAction(action) {
    const token = await this.getStoredToken();
    if (!token) {
      this.showNotification('Please login first', 'error');
      this.showLogin();
      return;
    }
    return action();
  }

  togglePassword() {
    const input = document.getElementById('password');
    const button = document.getElementById('togglePasswordBtn');
    
    if (input.type === 'password') {
      input.type = 'text';
      button.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
          <line x1="1" y1="1" x2="23" y2="23"></line>
        </svg>
      `;
      button.title = 'Hide password';
    } else {
      input.type = 'password';
      button.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      `;
      button.title = 'Show password';
    }
  }

  async getCurrentTab() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.url && !tab.url.startsWith('chrome://')) {
        const url = new URL(tab.url);
        const hostname = url.hostname.replace('www.', '');
        document.getElementById('siteName').textContent = hostname;
        this.currentSite = hostname;
      } else {
        document.getElementById('siteName').textContent = 'Chrome page';
        this.currentSite = null;
      }
    } catch (error) {
      console.error('Error getting current tab:', error);
      document.getElementById('siteName').textContent = 'Unknown site';
    }
  }

  async login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const loginBtn = document.getElementById('loginBtn');

    if (!email || !password) {
      this.showNotification('Please enter email and password', 'error');
      return;
    }

    // Add loading state
    const originalText = loginBtn.textContent;
    loginBtn.textContent = 'Signing In...';
    loginBtn.disabled = true;
    loginBtn.style.opacity = '0.7';

    try {
      console.log('Attempting login...', { email });
      
      // Try registration first (for new users)
      let response = await fetch(`${this.apiUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      let data = await response.json();
      
      // If registration fails because user exists, try login
      if (!response.ok && data.error?.includes('already registered')) {
        console.log('User exists, trying login...');
        response = await fetch(`${this.apiUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        data = await response.json();
      }
      
      if (response.ok) {
        console.log('Authentication successful');
        await chrome.storage.local.set({ 
          token: data.access_token,
          userId: data.user_id,
          lastActivity: Date.now()
        });
        chrome.runtime.sendMessage({ action: 'resetAutoLock' });
        this.showVault();
        await this.loadPasswords();
        this.showNotification('Welcome to Lok!', 'success');
      } else {
        console.error('Auth failed:', data);
        this.showNotification(data.error || 'Authentication failed', 'error');
      }
    } catch (error) {
      console.error('Connection error:', error);
      this.showNotification('Connection error - make sure backend is running on localhost:5000', 'error');
    } finally {
      // Reset button state
      loginBtn.textContent = originalText;
      loginBtn.disabled = false;
      loginBtn.style.opacity = '1';
    }
  }

  showNotification(message, type = 'info') {
    // Simple notification system - could be enhanced with a toast component
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
      existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: ${type === 'error' ? 'rgba(239, 68, 68, 0.9)' : 'rgba(16, 185, 129, 0.9)'};
      color: white;
      padding: 12px 20px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      z-index: 1000;
      backdrop-filter: blur(10px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
      animation: slideDown 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideUp 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  async logout() {
    try {
      await chrome.storage.local.clear();
      chrome.runtime.sendMessage({ action: 'autoLock' });
      this.showLogin();
      this.showNotification('Logged out successfully', 'success');
    } catch (error) {
      console.error('Error during logout:', error);
      // Still show login form even if storage clearing fails
      this.showLogin();
      this.showNotification('Logout completed with warnings', 'error');
    }
  }

  async loadPasswords() {
    const token = await this.getStoredToken();
    if (!token) return;

    try {
      const response = await fetch(`${this.apiUrl}/passwords`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const passwords = await response.json();
        this.displayPasswords(passwords);
        chrome.runtime.sendMessage({ action: 'resetAutoLock' });
      } else if (response.status === 401) {
        // Token expired
        await chrome.storage.local.clear();
        this.showLogin();
        this.showNotification('Session expired. Please login again.', 'error');
      }
    } catch (error) {
      console.error('Failed to load passwords:', error);
      this.showNotification('Failed to load passwords', 'error');
    }
  }

  displayPasswords(passwords) {
    const container = document.getElementById('passwordList');
    container.innercontainer.inncontainer.innerHTML = '';

    if (!this.currentSite) {
      container.innerHTML = `
        <div class="no-passwords">
          <div class="empty-state-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
          </div>
          Navigate to a website to see your saved passwords
        </div>`;
      return;
    }

    // Filter passwords for current site
    const sitePasswords = passwords.filter(p => {
      const siteName = p.site_name.toLowerCase();
      const siteUrl = p.site_url.toLowerCase();
      const currentSite = this.currentSite.toLowerCase();
      
      return siteUrl.includes(currentSite) || 
             siteName.includes(currentSite) ||
             currentSite.includes(siteName.replace(/\s+/g, ''));
    });

    if (sitePasswords.length === 0) {
      container.innerHTML = `
        <div class="no-passwords">
          <div class="empty-state-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <circle cx="12" cy="16" r="1"></circle>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          No passwords saved for<br>
          <strong style="font-weight: 700; margin: 6px 0; display: block; color: #06b6d4;">${this.currentSite}</strong>
          <small style="opacity: 0.7; margin-top: 6px; display: block; font-size: 11px;">Generate a password or login to save one</small>
        </div>`;
      return;
    }

    // Add header with password count
    if (sitePasswords.length > 0) {
      const header = document.createElement('div');
      header.className = 'password-list-header';
      header.innerHTML = `
        <div class="password-count">${sitePasswords.length} Password${sitePasswords.length > 1 ? 's' : ''}</div>
        <div class="list-actions">
          <button class="list-action-btn" title="Refresh">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23 4 23 10 17 10"></polyline>
              <polyline points="1 20 1 14 7 14"></polyline>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64l1.27 1.27m4.16 4.16l1.27 1.27A9 9 0 0 0 18.36 18.36"></path>
            </svg>
          </button>
        </div>
      `;
      container.appendChild(header);
    }

    sitePasswords.forEach((password, index) => {
      const strengthColor = this.getStrengthColor(password.strength_score);
      const strengthWidth = Math.max(password.strength_score, 10);
      const strengthText = this.getStrengthText(password.strength_score);
      const favicon = password.site_name.charAt(0).toUpperCase();
      
      const item = document.createElement('div');
      item.className = 'password-item';
      item.style.animationDelay = `${index * 0.1}s`;
      item.innerHTML = `
        <div class="password-item-header">
          <div class="site-name">
            <div class="site-favicon">${favicon}</div>
            <div class="site-name-text">${password.site_name}</div>
          </div>
          <div class="password-actions">
            <div class="action-btn" title="Copy password" data-action="copy">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </div>
            <div class="action-btn" title="Auto-fill" data-action="fill">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 11 12 14 22 4"></polyline>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
              </svg>
            </div>
          </div>
        </div>
        <div class="username">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 5px; opacity: 0.7; flex-shrink: 0;">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span style="overflow: hidden; text-overflow: ellipsis;">${password.username}</span>
        </div>
        <div class="password-item-footer">
          <div class="strength-container">
            <div class="strength-bar" style="background: ${strengthColor}; width: ${strengthWidth}%;"></div>
            <div class="strength-text">${strengthText}</div>
          </div>
        </div>
      `;
      
      // Add click handlers for action buttons
      item.addEventListener('click', (e) => {
        if (e.target.closest('.action-btn')) {
          e.stopPropagation();
          const action = e.target.closest('.action-btn').dataset.action;
          if (action === 'copy') {
            this.copyPassword(password);
          } else if (action === 'fill') {
            this.fillPassword(password);
          }
        } else {
          this.fillPassword(password);
        }
      });
      
      container.appendChild(item);
    });
  }

  getStrengthColor(score) {
    if (score >= 80) return 'linear-gradient(90deg, #10b981, #059669)';
    if (score >= 60) return 'linear-gradient(90deg, #f59e0b, #d97706)';
    if (score >= 40) return 'linear-gradient(90deg, #f97316, #ea580c)';
    return 'linear-gradient(90deg, #ef4444, #dc2626)';
  }

  getStrengthText(score) {
    if (score >= 80) return 'Strong';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Weak';
  }

  async copyPassword(passwordData) {
    const token = await this.getStoredToken();
    
    try {
      // Get the actual password from the API
      const response = await fetch(`${this.apiUrl}/passwords/${passwordData.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        await navigator.clipboard.writeText(data.password);
        this.showNotification('Password copied to clipboard', 'success');
      } else {
        this.showNotification('Failed to copy password', 'error');
      }
    } catch (error) {
      console.error('Failed to copy password:', error);
      this.showNotification('Failed to copy password', 'error');
    }
  }

  async fillPassword(passwordData) {
    const token = await this.getStoredToken();
    
    // Send message to content script to fill the password
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.tabs.sendMessage(tab.id, {
      action: 'fillPassword',
      username: passwordData.username,
      passwordId: passwordData.id,
      token: token
    });
    
    window.close();
  }

  async generatePassword() {
    const password = this.generateSecurePassword();
    
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.sendMessage(tab.id, {
      action: 'fillGeneratedPassword',
      password: password
    });
    
    window.close();
  }

  generateSecurePassword() {
    const length = 16;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    return password;
  }

  async getStoredToken() {
    const result = await chrome.storage.local.get(['token']);
    return result.token;
  }

  showLogin() {
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('vault').classList.add('hidden');
  }

  showVault() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('vault').classList.remove('hidden');
  }
  
  resetAutoLockTimer() {
    chrome.runtime.sendMessage({ action: 'resetAutoLock' });
  }
}

// Add notification animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideDown {
    from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
    to { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
  @keyframes slideUp {
    from { opacity: 1; transform: translateX(-50%) translateY(0); }
    to { opacity: 0; transform: translateX(-50%) translateY(-20px); }
  }
`;
document.head.appendChild(style);

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new LokPopup();
});