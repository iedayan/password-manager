class LokAPI {
  constructor() {
    this.baseUrl = 'http://localhost:5000/api';
    this.cache = new Map();
    this.requestQueue = [];
    this.isProcessingQueue = false;
  }

  async request(endpoint, options = {}) {
    const cacheKey = `${endpoint}-${JSON.stringify(options)}`;
    const cacheTTL = options.cacheTTL || 0;
    
    // Check cache for GET requests
    if (!options.method || options.method === 'GET') {
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < cacheTTL) {
          return cached.data;
        }
      }
    }
    
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
      
      // Cache successful GET requests
      if ((!options.method || options.method === 'GET') && cacheTTL > 0) {
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now()
        });
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
    return this.request('/passwords', { cacheTTL: 30000 }); // 30 second cache
  }

  async savePassword(passwordData) {
    const result = await this.request('/passwords', {
      method: 'POST',
      body: JSON.stringify(passwordData)
    });
    
    // Clear cache after successful save
    this.clearCache('/passwords');
    return result;
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
    this.cache.clear();
  }
  
  clearCache(pattern) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }
  
  cleanup() {
    this.cache.clear();
    this.requestQueue = [];
    this.isProcessingQueue = false;
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LokAPI;
}