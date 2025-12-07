/* --- RUTAS DE AUTENTICACIÓN --- */

import express from 'express';
import * as authController from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateRequiredFields } from '../middleware/validate.js';

const router = express.Router();

/**
 * POST /api/auth/login
 * Login de usuario
 * Público
 */
router.post('/login', authController.login);

/**
 * POST /api/auth/register
 * Registrar nuevo usuario
 * Requiere autenticación y rol admin
 */
router.post(
    '/register',
    authenticateToken,
    validateRequiredFields(['username', 'email', 'password', 'fullName']),
    authController.register
);

/**
 * POST /api/auth/change-password
 * Cambiar contraseña del usuario actual
 * Requiere autenticación
 */
router.post(
    '/change-password',
    authenticateToken,
    validateRequiredFields(['oldPassword', 'newPassword']),
    authController.changePassword
);

/**
 * GET /api/auth/me
 * Obtener información del usuario actual
 * Requiere autenticación
 */
router.get('/me', authenticateToken, authController.getMe);

/**
 * POST /api/auth/logout
 * Logout (cliente elimina token)
 * Requiere autenticación
 */
router.post('/logout', authenticateToken, authController.logout);

/**
 * GET /api/auth/verify
 * Verificar si el token es válido
 * Requiere autenticación
 */
router.get('/verify', authenticateToken, authController.verifyToken);

export default router;