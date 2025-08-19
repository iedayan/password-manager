const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://password-manager-production-89ed.up.railway.app';

export const api = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.error('API Error Response:', errorData);
        } catch {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        
        // Handle validation errors from Pydantic
        if (errorData.detail && Array.isArray(errorData.detail)) {
          const validationErrors = errorData.detail.map(err => err.msg).join(', ');
          throw new Error(validationErrors);
        }
        
        throw new Error(errorData.error || errorData.message || `Request failed with status ${response.status}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error('Network error: Unable to connect to server');
      }
      throw error;
    }
  },

  // Auth endpoints
  auth: {
    login: (credentials) => api.request('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
    register: (userData) => api.request('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
    logout: async () => {
      try {
        // Call server to invalidate token
        await api.request('/api/v1/auth/logout', { method: 'POST' });
      } catch (error) {
        console.warn('Server logout failed:', error);
      } finally {
        // Always clear client-side data
        localStorage.removeItem('token');
        localStorage.removeItem('user_id');
        localStorage.removeItem('remember_me');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user_id');
        sessionStorage.removeItem('remember_me');
        
        // Clear any cached data
        localStorage.removeItem('activeTab');
        localStorage.removeItem('onboarding_completed');
        localStorage.removeItem('2fa_enabled');
      }
    },
    logoutAll: () => api.request('/api/v1/auth/logout-all', { method: 'POST' }),
    getSessions: () => api.request('/api/v1/auth/sessions'),
    terminateSession: (sessionId) => api.request(`/api/v1/auth/sessions/${sessionId}`, { method: 'DELETE' }),
  },

  // Password endpoints
  passwords: {
    getAll: () => api.request('/api/v1/passwords'),
    create: (password) => api.request('/api/v1/passwords', {
      method: 'POST',
      body: JSON.stringify(password),
    }),
    update: (id, password) => api.request(`/api/v1/passwords/${id}`, {
      method: 'PUT',
      body: JSON.stringify(password),
    }),
    decrypt: (id, masterKey) => api.request(`/api/v1/passwords/${id}/decrypt`, {
      method: 'POST',
      body: JSON.stringify({ master_password: masterKey }),
    }),
    delete: (id) => api.request(`/api/v1/passwords/${id}`, {
      method: 'DELETE',
    }),
    toggleFavorite: (id) => api.request(`/api/v1/passwords/${id}/favorite`, {
      method: 'POST',
    }),
    getStats: () => api.request('/api/v1/passwords/stats'),
    bulkDelete: (ids) => api.request('/api/v1/passwords/bulk', {
      method: 'POST',
      body: JSON.stringify({ operation: 'delete', password_ids: ids }),
    }),
    export: () => api.request('/api/v1/passwords/bulk', {
      method: 'POST',
      body: JSON.stringify({ operation: 'export' }),
    }),
    import: (passwords) => api.request('/api/v1/passwords/bulk', {
      method: 'POST',
      body: JSON.stringify({ operation: 'import', passwords }),
    }),
    search: (query) => api.request(`/api/v1/passwords/search?q=${encodeURIComponent(query)}`),
    analyze: () => api.request('/api/v1/passwords/analyze'),
    generate: (options = {}) => api.request('/api/v1/passwords/generate', {
      method: 'POST',
      body: JSON.stringify(options),
    }),
    // Onboarding endpoints
    getOnboardingProgress: () => api.request('/api/v1/passwords/onboarding/progress'),
    completeOnboardingStep: (stepId) => api.request('/api/v1/passwords/onboarding/complete-step', {
      method: 'POST',
      body: JSON.stringify({ step_id: stepId }),
    }),
    getSecurityAssessment: () => api.request('/api/v1/passwords/security-assessment'),
    generateMigrationPlan: (currentManager, passwordCount) => api.request('/api/v1/passwords/migration-plan', {
      method: 'POST',
      body: JSON.stringify({ current_manager: currentManager, password_count: passwordCount }),
    }),
  },

  // Import/Export endpoints
  import: {
    passwords: (file, format) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('format', format);
      return api.request('/api/v1/passwords/import', {
        method: 'POST',
        body: formData,
        headers: {} // Remove Content-Type to let browser set it for FormData
      });
    }
  },

  // Security endpoints
  security: {
    // Advanced analysis
    getAdvancedAnalysis: () => api.request('/api/v1/security/advanced-analysis'),
    getRealTimeThreats: () => api.request('/api/v1/security/threats/realtime'),
    
    // 2FA endpoints
    setup2FA: () => api.request('/api/v1/security/2fa/setup', { method: 'POST' }),
    verify2FA: (code) => api.request('/api/v1/security/2fa/verify', {
      method: 'POST',
      body: JSON.stringify({ code })
    }),
    disable2FA: (password) => api.request('/api/v1/security/2fa/disable', {
      method: 'POST',
      body: JSON.stringify({ password })
    }),
    get2FAStatus: () => api.request('/api/v1/security/2fa/status'),
    regenerateBackupCodes: (password) => api.request('/api/v1/security/2fa/backup-codes', {
      method: 'POST',
      body: JSON.stringify({ password })
    }),
    
    // Biometric endpoints
    setupBiometric: (data) => api.request('/api/v1/security/biometric/setup', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    verifyBiometric: (data) => api.request('/api/v1/security/biometric/verify', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    
    // AI-powered endpoints
    getAIRecommendations: () => api.request('/api/v1/security/ai/recommendations'),
    getSecurityTrends: () => api.request('/api/v1/security/trends'),
    getBehavioralAnalysis: () => api.request('/api/v1/security/behavioral-analysis'),
    
    // Health and monitoring
    getHealthCheck: () => api.request('/api/v1/security/health-check'),
    getDashboard: () => api.request('/api/v1/security/dashboard'),
    getBreachCheck: (passwordIds) => api.request('/api/v1/security/breach-check', {
      method: 'POST',
      body: JSON.stringify({ password_ids: passwordIds })
    }),
    
    // Export with security
    secureExport: (options) => api.request('/api/v1/security/export', {
      method: 'POST',
      body: JSON.stringify(options)
    })
  },

  // User endpoints
  user: {
    getProfile: () => api.request('/api/v1/user/profile'),
    updateProfile: (data) => api.request('/api/v1/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    getSessions: () => api.request('/api/v1/user/sessions'),
    terminateSession: (sessionId) => api.request(`/api/v1/user/sessions/${sessionId}`, {
      method: 'DELETE',
    }),
    changePassword: (data) => api.request('/api/v1/user/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    deleteAccount: (password) => api.request('/api/v1/user/delete', {
      method: 'DELETE',
      body: JSON.stringify({ password }),
    }),
  },

  // Password History & Versioning
  history: {
    getPasswordHistory: (passwordId) => api.request(`/api/v1/passwords/${passwordId}/history`),
    restoreVersion: (passwordId, versionId) => api.request(`/api/v1/passwords/${passwordId}/restore/${versionId}`, { method: 'POST' }),
  },

  // Secure Notes
  notes: {
    getAll: () => api.request('/api/v1/notes'),
    create: (note) => api.request('/api/v1/notes', { method: 'POST', body: JSON.stringify(note) }),
    update: (id, note) => api.request(`/api/v1/notes/${id}`, { method: 'PUT', body: JSON.stringify(note) }),
    delete: (id) => api.request(`/api/v1/notes/${id}`, { method: 'DELETE' }),
    attachFile: (noteId, file) => {
      const formData = new FormData();
      formData.append('file', file);
      return api.request(`/api/v1/notes/${noteId}/attachments`, { method: 'POST', body: formData, headers: {} });
    },
  },

  // Emergency Access
  emergency: {
    setupAccess: (contacts) => api.request('/api/v1/emergency/setup', {
      method: 'POST', body: JSON.stringify(contacts)
    }),
    getContacts: () => api.request('/api/v1/emergency/contacts'),
    requestAccess: (userId) => api.request('/api/v1/emergency/request', {
      method: 'POST', body: JSON.stringify({ user_id: userId })
    }),
    grantAccess: (requestId) => api.request(`/api/v1/emergency/grant/${requestId}`, { method: 'POST' }),
    revokeAccess: (contactId) => api.request(`/api/v1/emergency/revoke/${contactId}`, { method: 'POST' }),
  },

  // Basic Analytics
  analytics: {
    getSecurityScore: () => api.request('/api/v1/analytics/security-score'),
    getPasswordStrengthReport: () => api.request('/api/v1/analytics/password-strength'),
    getUsageStats: () => api.request('/api/v1/analytics/usage'),
  },

  // Dark Web Monitoring
  monitoring: {
    scanCredentials: () => api.request('/api/v1/monitoring/scan', { method: 'POST' }),
    getBreachAlerts: () => api.request('/api/v1/monitoring/alerts'),
    markAlertRead: (alertId) => api.request(`/api/v1/monitoring/alerts/${alertId}/read`, { method: 'POST' }),
  },

  // Browser Extension Support
  extension: {
    getCredentials: (domain) => api.request(`/api/v1/extension/credentials?domain=${encodeURIComponent(domain)}`),
    saveCredentials: (data) => api.request('/api/v1/extension/save', {
      method: 'POST', body: JSON.stringify(data)
    }),
    getAutofillData: (url) => api.request(`/api/v1/extension/autofill?url=${encodeURIComponent(url)}`),
    ping: () => api.request('/api/v1/extension/ping'),
  },

  // Beta Feedback System
  feedback: {
    submit: (feedback) => {
      console.log('Mock feedback submission:', feedback);
      return Promise.resolve({ success: true, id: Date.now() });
    }
  },

  // Feature Requests
  features: {
    getAll: () => Promise.resolve({ features: [] }),
    create: (request) => {
      console.log('Mock feature request:', request);
      return Promise.resolve({ success: true, id: Date.now() });
    },
    vote: (id) => {
      console.log('Mock vote for feature:', id);
      return Promise.resolve({ success: true });
    }
  },

  // Onboarding
  onboarding: {
    getProgress: () => api.request('/api/v1/onboarding/progress'),
    getSecurityAssessment: () => api.request('/api/v1/onboarding/security-assessment'),
    complete: () => api.request('/api/v1/onboarding/complete', { method: 'POST' })
  }
};

export default api;