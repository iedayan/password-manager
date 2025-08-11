class LokAPI {
  constructor() {
    this.baseUrl = 'http://localhost:5000/api';
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const token = await this.getToken();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  async getPasswords() {
    return this.request('/passwords');
  }

  async savePassword(passwordData) {
    return this.request('/passwords', {
      method: 'POST',
      body: JSON.stringify(passwordData)
    });
  }

  async decryptPassword(passwordId, masterKey) {
    return this.request(`/passwords/${passwordId}/decrypt`, {
      method: 'POST',
      body: JSON.stringify({ master_key: masterKey })
    });
  }

  async getToken() {
    const result = await chrome.storage.local.get(['token']);
    return result.token;
  }

  async setToken(token, userId) {
    await chrome.storage.local.set({ token, userId });
  }

  async clearToken() {
    await chrome.storage.local.clear();
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LokAPI;
}