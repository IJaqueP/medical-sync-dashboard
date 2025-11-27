/* --- MIDDLEWARE DE MANEJO DE ERRORES --- */

import logger from '../utils/logger.js';


/* Clase de error personalizada para errores de la API */
export class ApiError extends Error {
    constructor(statusCode, message, isOperational = true, stack = '') {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}


/* Middleware principal de manejo de errores */
export const errorHandler = (err, req, res, next) => {
    let { statusCode, message } = err;
    
    // Si no hay statusCode, es un error 500
    if (!statusCode) {
        statusCode = 500;
    }
    
    // Logging del error
    if (statusCode >= 500) {
        logger.logError(`ERROR ${statusCode}: ${message}`, err);
    } else {
        logger.logWarn(`WARN ${statusCode}: ${message}`);
    }
    
    // En desarrollo, enviar stack trace
    const response = {
        success: false,
        statusCode,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    };
    
    res.status(statusCode).json(response);
};


/* Middleware para rutas no encontradas (404) */
export const notFound = (req, res, next) => {
    const error = new ApiError(404, `Ruta no encontrada: ${req.originalUrl}`);
    next(error);
};


/* Wrapper para funciones async para capturar errores */
export const catchAsync = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};


/* Errores comunes predefinidos */
export const errors = {
    unauthorized: () => new ApiError(401, 'No autorizado. Token inválido o expirado'),
    forbidden: () => new ApiError(403, 'No tienes permisos para realizar esta acción'),
    notFound: (resource) => new ApiError(404, `${resource} no encontrado`),
    badRequest: (message) => new ApiError(400, message),
    conflict: (message) => new ApiError(409, message),
    internalServer: (message = 'Error interno del servidor') => new ApiError(500, message)
};

export default errorHandler;