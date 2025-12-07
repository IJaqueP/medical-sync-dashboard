/* --- RUTAS DE USUARIOS --- */

import express from 'express';
import * as userController from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin, requireOwnerOrAdmin } from '../middleware/roleCheck.js';
import { validatePagination } from '../middleware/validate.js';

const router = express.Router();

/**
 * GET /api/users
 * Obtener todos los usuarios
 * Requiere autenticación y rol admin
 */
router.get(
    '/',
    authenticateToken,
    requireAdmin,
    validatePagination,
    userController.getAllUsers
);

/**
 * GET /api/users/:id
 * Obtener usuario por ID
 * Requiere autenticación (admin o el mismo usuario)
 */
router.get(
    '/:id',
    authenticateToken,
    requireOwnerOrAdmin,
    userController.getUserById
);

/**
 * POST /api/users
 * Crear nuevo usuario
 * Requiere autenticación y rol admin
 */
router.post(
    '/',
    authenticateToken,
    requireAdmin,
    userController.createUser
);

/**
 * PUT /api/users/:id
 * Actualizar usuario
 * Requiere autenticación (admin o el mismo usuario)
 */
router.put(
    '/:id',
    authenticateToken,
    requireOwnerOrAdmin,
    userController.updateUser
);

/**
 * DELETE /api/users/:id
 * Desactivar usuario (soft delete)
 * Requiere autenticación y rol admin
 */
router.delete(
    '/:id',
    authenticateToken,
    requireAdmin,
    userController.deleteUser
);

/**
 * PATCH /api/users/:id/activate
 * Reactivar usuario
 * Requiere autenticación y rol admin
 */
router.patch(
    '/:id/activate',
    authenticateToken,
    requireAdmin,
    userController.activateUser
);

export default router;