import api from './api';

const syncService = {
  // Sincronizar todas las APIs
  async syncAll() {
    try {
      const response = await api.post('/sync/all', {});
      return response.data.data || response.data;
    } catch (error) {
      throw error;
    }
  },

  // Sincronizar API específica
  async syncByAPI(apiName) {
    try {
      const response = await api.post(`/sync/${apiName}`, {});
      return response.data.data || response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener logs de sincronización
  async getLogs(params = {}) {
    try {
      const response = await api.get('/sync/logs', { params });
      return response.data.data || response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener estadísticas de sincronización
  async getStats() {
    try {
      const response = await api.get('/sync/stats');
      return response.data.data || response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default syncService;