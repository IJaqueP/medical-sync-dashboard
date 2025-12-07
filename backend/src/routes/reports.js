/* --- RUTAS DE REPORTES --- */

import express from 'express';
import * as reportController from '../controllers/reportController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireEmployee } from '../middleware/roleCheck.js';
import { validateDateRange } from '../middleware/validate.js';

const router = express.Router();

/**
 * GET /api/reports/summary
 * Obtener resumen de reportes disponibles
 * Requiere autenticación
 */
router.get(
    '/summary',
    authenticateToken,
    requireEmployee,
    reportController.getReportsSummary
);

/**
 * GET /api/reports/pdf
 * Generar reporte de atenciones en PDF (alias genérico)
 * Requiere autenticación
 */
router.get(
    '/pdf',
    authenticateToken,
    requireEmployee,
    reportController.generateAtencionesPDF
);

/**
 * GET /api/reports/excel
 * Generar reporte de atenciones en Excel (alias genérico)
 * Requiere autenticación
 */
router.get(
    '/excel',
    authenticateToken,
    requireEmployee,
    reportController.generateAtencionesExcel
);

/**
 * GET /api/reports/atenciones/pdf
 * Generar reporte de atenciones en PDF
 * Requiere autenticación
 */
router.get(
    '/atenciones/pdf',
    authenticateToken,
    requireEmployee,
    validateDateRange,
    reportController.generateAtencionesPDF
);

/**
 * GET /api/reports/atenciones/excel
 * Generar reporte de atenciones en Excel
 * Requiere autenticación
 */
router.get(
    '/atenciones/excel',
    authenticateToken,
    requireEmployee,
    validateDateRange,
    reportController.generateAtencionesExcel
);

/**
 * GET /api/reports/atenciones/:id/pdf
 * Generar comprobante individual en PDF
 * Requiere autenticación
 */
router.get(
    '/atenciones/:id/pdf',
    authenticateToken,
    requireEmployee,
    reportController.generateComprobantePDF
);

/**
 * GET /api/reports/sync/excel
 * Generar reporte de sincronización en Excel
 * Requiere autenticación
 */
router.get(
    '/sync/excel',
    authenticateToken,
    requireEmployee,
    reportController.generateSyncReportExcel
);

/**
 * GET /api/reports/pagos-pendientes/pdf
 * Generar reporte de pagos pendientes en PDF
 * Requiere autenticación
 */
router.get(
    '/pagos-pendientes/pdf',
    authenticateToken,
    requireEmployee,
    reportController.generatePagosPendientesPDF
);

/**
 * GET /api/reports/pagos-pendientes/excel
 * Generar reporte de pagos pendientes en Excel
 * Requiere autenticación
 */
router.get(
    '/pagos-pendientes/excel',
    authenticateToken,
    requireEmployee,
    reportController.generatePagosPendientesExcel
);

export default router;