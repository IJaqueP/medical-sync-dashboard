/* --- CONTROLADOR DE AUTENTICACIÓN --- */

import * as authService from '../services/authService.js';
import { ApiError } from '../middleware/errorHandle.js';
import { catchAsync } from '../middleware/errorHandle.js';
import logger from '../utils/logger.js';

/**
 * Login de usuario
 * POST /api/auth/login
 */
export const login = catchAsync(async (req, res) => {
    const { credential, password } = req.body;
    
    // Validar campos requeridos
    if (!credential || !password) {
        throw new ApiError(400, 'Credencial y contraseña son requeridos');
    }
    
    // Ejecutar login
    const result = await authService.login(credential, password);
    
    res.json({
        success: true,
        message: 'Login exitoso',
        data: result
    });
});

/**
 * Registrar nuevo usuario (solo admin)
 * POST /api/auth/register
 */
export const register = catchAsync(async (req, res) => {
    const { username, email, password, fullName, role } = req.body;
    
    // Validar campos requeridos
    if (!username || !email || !password || !fullName) {
        throw new ApiError(400, 'Todos los campos son requeridos');
    }
    
    // Validar que solo admin pueda crear otros admins
    if (role === 'admin' && req.user.role !== 'admin') {
        throw new ApiError(403, 'Solo un administrador puede crear otros administradores');
    }
    
    // Crear usuario
    const user = await authService.register({
        username,
        email,
        password,
        fullName,
        role: role || 'employee'
    });
    
    logger.logInfo(`Usuario registrado por ${req.user.username}: ${username}`);
    
    res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: user
    });
});

/**
 * Cambiar contraseña
 * POST /api/auth/change-password
 */
export const changePassword = catchAsync(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
        throw new ApiError(400, 'Contraseña actual y nueva son requeridas');
    }
    
    if (newPassword.length < 6) {
        throw new ApiError(400, 'La nueva contraseña debe tener al menos 6 caracteres');
    }
    
    await authService.changePassword(req.user.id, oldPassword, newPassword);
    
    logger.logInfo(`Contraseña cambiada: ${req.user.username}`);
    
    res.json({
        success: true,
        message: 'Contraseña actualizada exitosamente'
    });
});

/**
 * Obtener información del usuario actual
 * GET /api/auth/me
 */
export const getMe = catchAsync(async (req, res) => {
    res.json({
        success: true,
        data: req.user
    });
});

/**
 * Logout (cliente debe eliminar el token)
 * POST /api/auth/logout
 */
export const logout = catchAsync(async (req, res) => {
    logger.logInfo(`Logout: ${req.user.username}`);
    
    res.json({
        success: true,
        message: 'Logout exitoso'
    });
});

/**
 * Verificar si el token es válido
 * GET /api/auth/verify
 */
export const verifyToken = catchAsync(async (req, res) => {
    res.json({
        success: true,
        message: 'Token válido',
        data: { valid: true }
    });
});

export default {
    login,
    register,
    changePassword,
    getMe,
    logout,
    verifyToken
};