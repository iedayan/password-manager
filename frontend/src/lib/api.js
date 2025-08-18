const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://password-manager-production-89ed.up.railway.app';

export const api = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
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
  },

  // Password endpoints
  passwords: {
    getAll: () => api.request('/api/v1/passwords'),
    create: (password) => api.request('/api/v1/passwords', {
      method: 'POST',
      body: JSON.stringify(password),
    }),
    decrypt: (id, masterKey) => api.request(`/api/v1/passwords/${id}/decrypt`, {
      method: 'POST',
      body: JSON.stringify({ master_password: masterKey }),
    }),
    delete: (id) => api.request(`/api/v1/passwords/${id}`, {
      method: 'DELETE',
    }),
  },
};

export default api;