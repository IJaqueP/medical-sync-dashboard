/* --- MIDDLEWARE DE VERIFICACIÓN DE ROLES --- */

import { ApiError } from './errorHandle.js';

/**
 * Verificar que el usuario tenga uno de los roles permitidos
 */
export const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        // Verificar que el usuario esté autenticado
        if (!req.user) {
            throw new ApiError(401, 'Usuario no autenticado');
        }
        
        // Verificar que tenga el rol necesario
        if (!allowedRoles.includes(req.user.role)) {
            throw new ApiError(
                403, 
                `Acceso denegado. Se requiere uno de estos roles: ${allowedRoles.join(', ')}`
            );
        }
        
        next();
    };
};

/**
 * Verificar que el usuario sea administrador
 */
export const requireAdmin = requireRole('admin');

/**
 * Verificar que el usuario sea admin o empleado
 */
export const requireEmployee = requireRole('admin', 'employee');

/**
 * Verificar que el usuario esté accediendo a su propia información
 * o sea administrador
 */
export const requireOwnerOrAdmin = (req, res, next) => {
    if (!req.user) {
        throw new ApiError(401, 'Usuario no autenticado');
    }
    
    const requestedUserId = parseInt(req.params.id || req.params.userId);
    
    // Permitir si es admin o si está accediendo a su propia info
    if (req.user.role === 'admin' || req.user.id === requestedUserId) {
        return next();
    }
    
    throw new ApiError(403, 'No tienes permisos para acceder a esta información');
};

export default {
    requireRole,
    requireAdmin,
    requireEmployee,
    requireOwnerOrAdmin
};