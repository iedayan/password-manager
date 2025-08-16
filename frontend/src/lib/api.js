const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const api = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  },

  // Auth endpoints
  auth: {
    login: (credentials) => api.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
    register: (userData) => api.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  },

  // Password endpoints
  passwords: {
    getAll: () => api.request('/api/passwords'),
    create: (password) => api.request('/api/passwords', {
      method: 'POST',
      body: JSON.stringify(password),
    }),
    decrypt: (id, masterKey) => api.request(`/api/passwords/${id}/decrypt`, {
      method: 'POST',
      body: JSON.stringify({ master_key: masterKey }),
    }),
    delete: (id) => api.request(`/api/passwords/${id}`, {
      method: 'DELETE',
    }),
  },
};

export default api;