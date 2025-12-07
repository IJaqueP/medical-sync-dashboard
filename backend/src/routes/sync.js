/* --- RUTAS DE SINCRONIZACIÓN --- */

import express from 'express';
import * as syncController from '../controllers/syncController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireEmployee, requireAdmin } from '../middleware/roleCheck.js';

const router = express.Router();

/**
 * GET /api/sync/status
 * Verificar estado de conexión de todas las APIs
 * Requiere autenticación
 */
router.get(
    '/status',
    authenticateToken,
    requireEmployee,
    syncController.checkAPIsStatus
);

/**
 * GET /api/sync/history
 * Obtener historial de sincronizaciones
 * Requiere autenticación
 */
router.get(
    '/history',
    authenticateToken,
    requireEmployee,
    syncController.getSyncHistory
);

/**
 * GET /api/sync/summary
 * Obtener resumen de sincronizaciones
 * Requiere autenticación
 */
router.get(
    '/summary',
    authenticateToken,
    requireEmployee,
    syncController.getSyncSummary
);

/**
 * GET /api/sync/logs
 * Obtener logs de sincronización con paginación
 * Requiere autenticación
 */
router.get(
    '/logs',
    authenticateToken,
    requireEmployee,
    syncController.getSyncHistory
);

/**
 * GET /api/sync/stats
 * Obtener estadísticas de sincronización
 * Requiere autenticación
 */
router.get(
    '/stats',
    authenticateToken,
    requireEmployee,
    syncController.getSyncSummary
);

/**
 * GET /api/sync/last/:apiName
 * Obtener última sincronización por API
 * Requiere autenticación
 */
router.get(
    '/last/:apiName',
    authenticateToken,
    requireEmployee,
    syncController.getLastSyncByAPI
);

/**
 * GET /api/sync/log/:id
 * Obtener detalle de una sincronización específica
 * Requiere autenticación
 */
router.get(
    '/log/:id',
    authenticateToken,
    requireEmployee,
    syncController.getSyncLogById
);

/**
 * POST /api/sync/all
 * Sincronizar todas las APIs
 * Requiere autenticación y rol admin
 */
router.post(
    '/all',
    authenticateToken,
    requireAdmin,
    syncController.syncAll
);

/**
 * POST /api/sync/:apiName
 * Sincronizar una API específica
 * Requiere autenticación y rol admin
 */
router.post(
    '/:apiName',
    authenticateToken,
    requireAdmin,
    syncController.syncByAPI
);

export default router;