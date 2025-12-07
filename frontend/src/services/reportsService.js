import api from './api';

const reportsService = {
  // Generar reporte PDF
  async generatePDF(params = {}) {
    try {
      const response = await api.get('/reports/pdf', {
        params,
        responseType: 'blob',
      });
      
      // Crear URL para descargar el archivo
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte-atenciones-${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return { success: true };
    } catch (error) {
      throw error;
    }
  },

  // Generar reporte Excel
  async generateExcel(params = {}) {
    try {
      const response = await api.get('/reports/excel', {
        params,
        responseType: 'blob',
      });
      
      // Crear URL para descargar el archivo
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte-atenciones-${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return { success: true };
    } catch (error) {
      throw error;
    }
  },

  // Obtener datos para vista previa
  async getPreview(params = {}) {
    try {
      const response = await api.get('/reports/preview', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default reportsService;