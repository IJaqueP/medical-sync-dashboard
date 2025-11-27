import { ApiError } from './errorHandle.js';

/* --- Validar que el body de la request tenga campos requeridos */
export const validateRequiredFields = (requiredFields) => {
    return (req, res, next) => {
        const missingFields = [];

        for (const field of requiredFields) {
            if (!req.body[field]) {
                missingFields.push(field);
            }
        }

        if (missingFields.length > 0) {
            throw new ApiError(
                400,
                `Campos faltantes: ${missingFields.join(', ')}`
            );
        }

        next();
    };
};


/* Validar formato de Email */

export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};


/* Validar formato de RUT chileno */

export const validateRut = (rut) => {
    // Eliminar punto y guión
    const cleanRut = rut.replace(/\./g, '').replace('-', '');

    if (cleanRut.length < 2) return false;

    const body = cleanRut.slice(0, -1);
    const dv = cleanRut.slice(-1).toLowerCase();

    // Calcular dígito verificador
    let sum = 0;
    let multiplier = 2;

    for (let i = body.length - 1; i >= 0; i--) {
        sum += parseInt(body.charAt(i)) * multiplier;
        multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }

    const expectedDv = 11 - (sum % 11);
    const finalDv = expectedDv === 11 ? '0' : expectedDv === 10 ? 'k' : expectedDv.toString();

    return dv === finalDv;
};


/* Validar formato de fecha (DD-MM-YYYY) */

export const validateDate = (dateString) => {
    // Formato chileno: DD-MM-YYYY
    const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
    
    if (!dateRegex.test(dateString)) return false;
    
    // Separar día, mes, año
    const [day, month, year] = dateString.split('-').map(Number);
    
    // Validar rangos
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    
    // Validar fecha real
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && 
        date.getMonth() === month - 1 && 
        date.getDate() === day;
};


/* Validar que un valor esté dentro de un conjunto permitido */

export const validateEnum = (value, allowedValues) => {
    return allowedValues.includes(value);
};


/* Sanitizar input removiendo caracteres peligrosos */

export const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    
    // Remover caracteres potencialmente peligrosos
    return input
        .replace(/[<>]/g, '') // Remover < y >
        .trim();
};


/* Middleware para validar paginación */

export const validatePagination = (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    if (page < 1) {
        throw new ApiError(400, 'El número de página debe ser mayor a 0');
    }
    
    if (limit < 1 || limit > 100) {
        throw new ApiError(400, 'El límite debe estar entre 1 y 100');
    }
    
    req.pagination = {
        page,
        limit,
        offset: (page - 1) * limit
    };
    
    next();
};


/* Middleware para validar rango de fechas */

export const validateDateRange = (req, res, next) => {
    const { startDate, endDate } = req.query;
    
    if (startDate && !validateDate(startDate)) {
        throw new ApiError(400, 'Formato de fecha de inicio inválido. Use DD-MM-YYYY');
    }
    
    if (endDate && !validateDate(endDate)) {
        throw new ApiError(400, 'Formato de fecha de fin inválido. Use DD-MM-YYYY');
    }
    
    if (startDate && endDate) {
        // Convertir DD-MM-YYYY a objeto Date
        const [dayStart, monthStart, yearStart] = startDate.split('-').map(Number);
        const [dayEnd, monthEnd, yearEnd] = endDate.split('-').map(Number);
        
        const start = new Date(yearStart, monthStart - 1, dayStart);
        const end = new Date(yearEnd, monthEnd - 1, dayEnd);
        
        if (start > end) {
            throw new ApiError(400, 'La fecha de inicio no puede ser mayor a la fecha de fin');
        }
    }
    
    next();
};

export default {
    validateRequiredFields,
    validateEmail,
    validateRut,
    validateDate,
    validateEnum,
    sanitizeInput,
    validatePagination,
    validateDateRange
};