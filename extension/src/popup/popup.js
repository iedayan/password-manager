class LokPopup {
  constructor() {
    this.apiUrl = 'http://localhost:5000/api';
    this.init();
  }

  async init() {
    await this.checkAuthStatus();
    this.bindEvents();
    await this.getCurrentTab();
  }

  async checkAuthStatus() {
    const token = await this.getStoredToken();
    if (token) {
      this.showVault();
      await this.loadPasswords();
    } else {
      this.showLogin();
    }
  }

  bindEvents() {
    document.getElementById('loginBtn').addEventListener('click', () => this.login());
    document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
    document.getElementById('generateBtn').addEventListener('click', () => this.generatePassword());
    
    // Enter key for login
    document.getElementById('password').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.login();
    });
  }

  async getCurrentTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url) {
      const url = new URL(tab.url);
      document.getElementById('siteName').textContent = url.hostname;
      this.currentSite = url.hostname;
    }
  }

  async login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) return;

    try {
      const response = await fetch(`${this.apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      
      if (response.ok) {
        await chrome.storage.local.set({ 
          token: data.access_token,
          userId: data.user_id 
        });
        this.showVault();
        await this.loadPasswords();
      } else {
        alert(data.error || 'Login failed');
      }
    } catch (error) {
      alert('Connection error');
    }
  }

  async logout() {
    await chrome.storage.local.clear();
    this.showLogin();
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
      }
    } catch (error) {
      console.error('Failed to load passwords:', error);
    }
  }

  displayPasswords(passwords) {
    const container = document.getElementById('passwordList');
    container.innerHTML = '';

    // Filter passwords for current site
    const sitePasswords = passwords.filter(p => 
      p.site_url.includes(this.currentSite) || 
      p.site_name.toLowerCase().includes(this.currentSite?.toLowerCase() || '')
    );

    if (sitePasswords.length === 0) {
      container.innerHTML = '<div style="text-align: center; opacity: 0.6; padding: 20px;">No passwords for this site</div>';
      return;
    }

    sitePasswords.forEach(password => {
      const item = document.createElement('div');
      item.className = 'password-item';
      item.innerHTML = `
        <div class="site-name">${password.site_name}</div>
        <div class="username">${password.username}</div>
      `;
      
      item.addEventListener('click', () => this.fillPassword(password));
      container.appendChild(item);
    });
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
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new LokPopup();
});