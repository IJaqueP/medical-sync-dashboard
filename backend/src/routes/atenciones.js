/* --- RUTAS DE ATENCIONES --- */

import express from 'express';
import * as atencionController from '../controllers/atencionControllers.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireEmployee } from '../middleware/roleCheck.js';
import { validatePagination, validateDateRange } from '../middleware/validate.js';

const router = express.Router();

/**
 * GET /api/atenciones
 * Obtener todas las atenciones con filtros
 * Requiere autenticación
 */
router.get(
    '/',
    authenticateToken,
    requireEmployee,
    validatePagination,
    validateDateRange,
    atencionController.getAllAtenciones
);

/**
 * GET /api/atenciones/pendientes/pago
 * Obtener atenciones pendientes de pago
 * Requiere autenticación
 */
router.get(
    '/pendientes/pago',
    authenticateToken,
    requireEmployee,
    atencionController.getPendientesPago
);

/**
 * GET /api/atenciones/estadisticas
 * Obtener estadísticas de atenciones
 * Requiere autenticación
 */
router.get(
    '/estadisticas',
    authenticateToken,
    requireEmployee,
    validateDateRange,
    atencionController.getEstadisticas
);

/**
 * GET /api/atenciones/paciente/:rut
 * Obtener atenciones por RUT del paciente
 * Requiere autenticación
 */
router.get(
    '/paciente/:rut',
    authenticateToken,
    requireEmployee,
    atencionController.getAtencionesByRut
);

/**
 * GET /api/atenciones/:id
 * Obtener atención por ID
 * Requiere autenticación
 */
router.get(
    '/:id',
    authenticateToken,
    requireEmployee,
    atencionController.getAtencionById
);

/**
 * POST /api/atenciones
 * Crear nueva atención manualmente
 * Requiere autenticación
 */
router.post(
    '/',
    authenticateToken,
    requireEmployee,
    atencionController.createAtencion
);

/**
 * PUT /api/atenciones/:id
 * Actualizar atención
 * Requiere autenticación
 */
router.put(
    '/:id',
    authenticateToken,
    requireEmployee,
    atencionController.updateAtencion
);

/**
 * DELETE /api/atenciones/:id
 * Eliminar atención
 * Requiere autenticación
 */
router.delete(
    '/:id',
    authenticateToken,
    requireEmployee,
    atencionController.deleteAtencion
);

export default router;