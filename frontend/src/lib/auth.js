export const auth = {
  getToken: () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  },
  
  getUserId: () => {
    return localStorage.getItem('user_id') || sessionStorage.getItem('user_id');
  },
  
  isAuthenticated: () => {
    return !!auth.getToken();
  },
  
  isRemembered: () => {
    return localStorage.getItem('remember_me') === 'true';
  }
};