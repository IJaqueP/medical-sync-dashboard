import api from './api';

const authService = {
  // Login de usuario
  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials);
      const { token, user } = response.data.data;
      
      // Guardar token y usuario en localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { token, user };
    } catch (error) {
      throw error;
    }
  },

  // Registro de usuario (solo admin)
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Logout
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  // Obtener usuario actual
  async getMe() {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cambiar contraseña
  async changePassword(passwordData) {
    try {
      const response = await api.post('/auth/change-password', passwordData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Verificar si hay token
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  // Obtener usuario del localStorage
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Verificar si el usuario es admin
  isAdmin() {
    const user = this.getCurrentUser();
    return user && user.role === 'admin';
  },
};

export default authService;