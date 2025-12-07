import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Interceptor para agregar token a cada petición
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // El servidor respondió con un código de error
      const { status, data } = error.response;
      
      if (status === 401) {
        // Token inválido o expirado
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      
      // Formatear mensaje de error
      const errorMessage = data.message || data.error || 'Error en la petición';
      return Promise.reject(new Error(errorMessage));
    } else if (error.request) {
      // La petición se hizo pero no hubo respuesta
      return Promise.reject(new Error('No se pudo conectar con el servidor'));
    } else {
      // Error al configurar la petición
      return Promise.reject(new Error(error.message));
    }
  }
);

export default api;