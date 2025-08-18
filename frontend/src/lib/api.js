const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
        const error = await response.json().catch(() => ({ 
          error: `HTTP ${response.status}: ${response.statusText}` 
        }));
        throw new Error(error.error || `Request failed with status ${response.status}`);
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