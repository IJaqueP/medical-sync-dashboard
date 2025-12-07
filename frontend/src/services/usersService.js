import api from './api';

const usersService = {
  // Obtener todos los usuarios
  async getAll(params = {}) {
    try {
      const response = await api.get('/users', { params });
      return response.data.data || response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener un usuario por ID
  async getById(id) {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Crear nuevo usuario
  async create(userData) {
    try {
      const response = await api.post('/users', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar usuario
  async update(id, userData) {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar usuario
  async delete(id) {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Activar/desactivar usuario
  async toggleActive(id) {
    try {
      const response = await api.patch(`/users/${id}/toggle-active`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default usersService;