/* --- CONTROLADOR DE REPORTES --- */

import { Atencion, SyncLog } from '../models/index.js';
import { ApiError } from '../middleware/errorHandle.js';
import { catchAsync } from '../middleware/errorHandle.js';
import * as pdfGenerator from '../utils/pdfGenerator.js';
import * as excelGenerator from '../utils/excelGenerator.js';
import logger from '../utils/logger.js';
import { chileanToISO } from '../utils/dateHelper.js';
import { Op } from 'sequelize';

/**
 * Generar reporte de atenciones en PDF
 * GET /api/reports/atenciones/pdf
 */
export const generateAtencionesPDF = catchAsync(async (req, res) => {
    // Soportar ambos formatos: startDate/endDate y fechaInicio/fechaFin
    const { 
        startDate, 
        endDate, 
        fechaInicio, 
        fechaFin, 
        estadoPago, 
        estadoCita,
        origenDatos,
        profesional,
        especialidad
    } = req.query;
    
    const inicio = startDate || fechaInicio;
    const fin = endDate || fechaFin;
    
    // Construir filtros
    const where = {};
    const filters = {};
    
    if (inicio) {
        where.fechaCita = { [Op.gte]: new Date(inicio) };
        filters.startDate = inicio;
    }
    
    if (fin) {
        where.fechaCita = { 
            ...where.fechaCita,
            [Op.lte]: new Date(fin) 
        };
        filters.endDate = fin;
    }
    
    if (estadoPago && estadoPago !== '') {
        where.estadoPago = estadoPago;
        filters.estadoPago = estadoPago;
    }
    
    if (estadoCita && estadoCita !== '') {
        where.estadoCita = estadoCita;
        filters.estadoCita = estadoCita;
    }
    
    if (origenDatos && origenDatos !== '') {
        where.origenDatos = origenDatos;
        filters.origenDatos = origenDatos;
    }
    
    if (profesional && profesional !== '') {
        where.profesional = { [Op.iLike]: `%${profesional}%` };
        filters.profesional = profesional;
    }
    
    if (especialidad && especialidad !== '') {
        where.especialidad = { [Op.iLike]: `%${especialidad}%` };
        filters.especialidad = especialidad;
    }
    
    // Obtener atenciones
    logger.logInfo(`Buscando atenciones con filtros: ${JSON.stringify(where)}`);
    const atenciones = await Atencion.findAll({
        where,
        order: [['fechaCita', 'DESC']]
    });
    
    logger.logInfo(`Encontradas ${atenciones.length} atenciones`);
    
    if (atenciones.length === 0) {
        throw new ApiError(404, 'No se encontraron atenciones con los filtros especificados');
    }
    
    // Generar PDF
    logger.logInfo('Generando PDF...');
    const pdfBuffer = await pdfGenerator.generateAtencionesReport(atenciones, filters);
    
    logger.logInfo(`Reporte PDF generado por ${req.user.username}: ${atenciones.length} atenciones`);
    
    // Enviar PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=reporte-atenciones-${Date.now()}.pdf`);
    res.send(pdfBuffer);
});

/**
 * Generar reporte de atenciones en Excel
 * GET /api/reports/atenciones/excel
 */
export const generateAtencionesExcel = catchAsync(async (req, res) => {
    // Soportar ambos formatos: startDate/endDate y fechaInicio/fechaFin
    const { 
        startDate, 
        endDate, 
        fechaInicio, 
        fechaFin, 
        estadoPago, 
        estadoCita,
        origenDatos,
        profesional,
        especialidad
    } = req.query;
    
    const inicio = startDate || fechaInicio;
    const fin = endDate || fechaFin;
    
    // Construir filtros
    const where = {};
    const filters = {};
    
    if (inicio) {
        where.fechaCita = { [Op.gte]: new Date(inicio) };
        filters.startDate = inicio;
    }
    
    if (fin) {
        where.fechaCita = { 
            ...where.fechaCita,
            [Op.lte]: new Date(fin) 
        };
        filters.endDate = fin;
    }
    
    if (estadoPago && estadoPago !== '') {
        where.estadoPago = estadoPago;
        filters.estadoPago = estadoPago;
    }
    
    if (estadoCita && estadoCita !== '') {
        where.estadoCita = estadoCita;
        filters.estadoCita = estadoCita;
    }
    
    if (origenDatos && origenDatos !== '') {
        where.origenDatos = origenDatos;
        filters.origenDatos = origenDatos;
    }
    
    if (profesional && profesional !== '') {
        where.profesional = { [Op.iLike]: `%${profesional}%` };
        filters.profesional = profesional;
    }
    
    if (especialidad && especialidad !== '') {
        where.especialidad = { [Op.iLike]: `%${especialidad}%` };
        filters.especialidad = especialidad;
    }
    
    // Obtener atenciones
    const atenciones = await Atencion.findAll({
        where,
        order: [['fechaCita', 'DESC']]
    });
    
    if (atenciones.length === 0) {
        throw new ApiError(404, 'No se encontraron atenciones con los filtros especificados');
    }
    
    // Generar Excel
    const excelBuffer = await excelGenerator.generateAtencionesReport(atenciones, filters);
    
    logger.logInfo(`Reporte Excel generado por ${req.user.username}: ${atenciones.length} atenciones`);
    
    // Enviar Excel
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=reporte-atenciones-${Date.now()}.xlsx`);
    res.send(excelBuffer);
});

/**
 * Generar comprobante individual de atención en PDF
 * GET /api/reports/atenciones/:id/pdf
 */
export const generateComprobantePDF = catchAsync(async (req, res) => {
    const { id } = req.params;
    
    const atencion = await Atencion.findByPk(id);
    
    if (!atencion) {
        throw new ApiError(404, 'Atención no encontrada');
    }
    
    // Generar PDF
    const pdfBuffer = await pdfGenerator.generatePatientReport(atencion);
    
    logger.logInfo(`Comprobante PDF generado por ${req.user.username}: atención ${id}`);
    
    // Enviar PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=comprobante-${atencion.pacienteRut}-${Date.now()}.pdf`);
    res.send(pdfBuffer);
});

/**
 * Generar reporte de sincronización en Excel
 * GET /api/reports/sync/excel
 */
export const generateSyncReportExcel = catchAsync(async (req, res) => {
    const { limit = 100, apiName } = req.query;
    
    const where = {};
    if (apiName) where.apiName = apiName;
    
    const syncLogs = await SyncLog.findAll({
        where,
        limit: parseInt(limit),
        order: [['startTime', 'DESC']]
    });
    
    if (syncLogs.length === 0) {
        throw new ApiError(404, 'No se encontraron logs de sincronización');
    }
    
    // Generar Excel
    const excelBuffer = await excelGenerator.generateSyncReport(syncLogs);
    
    logger.logInfo(`Reporte de sincronización Excel generado por ${req.user.username}: ${syncLogs.length} logs`);
    
    // Enviar Excel
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=reporte-sincronizacion-${Date.now()}.xlsx`);
    res.send(excelBuffer);
});

/**
 * Generar reporte de pagos pendientes en PDF
 * GET /api/reports/pagos-pendientes/pdf
 */
export const generatePagosPendientesPDF = catchAsync(async (req, res) => {
    const atenciones = await Atencion.findPendientesPago();
    
    if (atenciones.length === 0) {
        throw new ApiError(404, 'No hay pagos pendientes');
    }
    
    // Generar PDF
    const pdfBuffer = await pdfGenerator.generateAtencionesReport(atenciones, { 
        estadoPago: 'pendiente/parcial' 
    });
    
    logger.logInfo(`Reporte de pagos pendientes PDF generado por ${req.user.username}: ${atenciones.length} atenciones`);
    
    // Enviar PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=pagos-pendientes-${Date.now()}.pdf`);
    res.send(pdfBuffer);
});

/**
 * Generar reporte de pagos pendientes en Excel
 * GET /api/reports/pagos-pendientes/excel
 */
export const generatePagosPendientesExcel = catchAsync(async (req, res) => {
    const atenciones = await Atencion.findPendientesPago();
    
    if (atenciones.length === 0) {
        throw new ApiError(404, 'No hay pagos pendientes');
    }
    
    // Generar Excel
    const excelBuffer = await excelGenerator.generateAtencionesReport(atenciones, { 
        estadoPago: 'pendiente/parcial' 
    });
    
    logger.logInfo(`Reporte de pagos pendientes Excel generado por ${req.user.username}: ${atenciones.length} atenciones`);
    
    // Enviar Excel
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=pagos-pendientes-${Date.now()}.xlsx`);
    res.send(excelBuffer);
});

/**
 * Obtener resumen de reportes disponibles
 * GET /api/reports/summary
 */
export const getReportsSummary = catchAsync(async (req, res) => {
    // Contar atenciones totales
    const totalAtenciones = await Atencion.count();
    
    // Contar pendientes de pago
    const pendientesPago = await Atencion.count({
        where: {
            estadoPago: {
                [Op.in]: ['pendiente', 'parcial']
            }
        }
    });
    
    // Contar logs de sincronización
    const totalSyncLogs = await SyncLog.count();
    
    // Obtener última sincronización
    const lastSync = await SyncLog.findOne({
        order: [['startTime', 'DESC']]
    });
    
    res.json({
        success: true,
        data: {
            atenciones: {
                total: totalAtenciones,
                pendientesPago
            },
            sincronizacion: {
                totalLogs: totalSyncLogs,
                lastSync: lastSync ? {
                    apiName: lastSync.apiName,
                    status: lastSync.status,
                    startTime: lastSync.startTime
                } : null
            },
            reportesDisponibles: [
                'atenciones-pdf',
                'atenciones-excel',
                'comprobante-pdf',
                'sincronizacion-excel',
                'pagos-pendientes-pdf',
                'pagos-pendientes-excel'
            ]
        }
    });
});

export default {
    generateAtencionesPDF,
    generateAtencionesExcel,
    generateComprobantePDF,
    generateSyncReportExcel,
    generatePagosPendientesPDF,
    generatePagosPendientesExcel,
    getReportsSummary
};