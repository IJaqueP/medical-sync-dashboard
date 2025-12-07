import api from './api';

const atencionesService = {
  // Obtener todas las atenciones con filtros
  async getAll(params = {}) {
    try {
      const response = await api.get('/atenciones', { params });
      return response.data.data || response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener una atención por ID
  async getById(id) {
    try {
      const response = await api.get(`/atenciones/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Crear nueva atención
  async create(atencionData) {
    try {
      const response = await api.post('/atenciones', atencionData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar atención
  async update(id, atencionData) {
    try {
      const response = await api.put(`/atenciones/${id}`, atencionData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar atención
  async delete(id) {
    try {
      const response = await api.delete(`/atenciones/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener estadísticas
  async getEstadisticas(fechaInicio, fechaFin) {
    try {
      const response = await api.get('/atenciones/estadisticas', {
        params: { fechaInicio, fechaFin },
      });
      return response.data.data || response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener atenciones pendientes de pago
  async getPendientesPago() {
    try {
      const response = await api.get('/atenciones/pendientes-pago');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default atencionesService;