/* --- CONTROLADOR DE SINCRONIZACIÓN --- */

import * as syncService from '../services/syncService.js';
import { SyncLog, User } from '../models/index.js';
import { ApiError } from '../middleware/errorHandle.js';
import { catchAsync } from '../middleware/errorHandle.js';
import logger from '../utils/logger.js';
import { chileanToISO } from '../utils/dateHelper.js';
import { Op } from 'sequelize';

/**
 * Sincronizar todas las APIs
 * POST /api/sync/all
 */
export const syncAll = catchAsync(async (req, res) => {
    const { startDate, endDate } = req.body || {};
    
    // Si no se proporcionan fechas, usar los últimos 30 días
    let isoStartDate, isoEndDate;
    
    if (startDate && endDate) {
        isoStartDate = chileanToISO(startDate);
        isoEndDate = chileanToISO(endDate);
    } else {
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        isoStartDate = thirtyDaysAgo.toISOString().split('T')[0];
        isoEndDate = today.toISOString().split('T')[0];
    }
    
    logger.logInfo(`Sincronización manual iniciada por ${req.user.username}`);
    
    // Ejecutar sincronización
    const results = await syncService.syncAll(isoStartDate, isoEndDate, req.user.id);
    
    res.json({
        success: true,
        message: 'Sincronización completada',
        data: results
    });
});

/**
 * Sincronizar una API específica
 * POST /api/sync/:apiName
 */
export const syncByAPI = catchAsync(async (req, res) => {
    const { apiName } = req.params;
    const { startDate, endDate } = req.body || {};
    
    if (!['reservo', 'snabb', 'dtemite'].includes(apiName)) {
        throw new ApiError(400, 'API no válida. Debe ser: reservo, snabb o dtemite');
    }
    
    // Si no se proporcionan fechas, usar los últimos 30 días
    let isoStartDate, isoEndDate;
    
    if (startDate && endDate) {
        isoStartDate = chileanToISO(startDate);
        isoEndDate = chileanToISO(endDate);
    } else {
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        isoStartDate = thirtyDaysAgo.toISOString().split('T')[0];
        isoEndDate = today.toISOString().split('T')[0];
    }
    
    logger.logInfo(`Sincronización manual de ${apiName} por ${req.user.username}`);
    
    // Ejecutar sincronización
    const result = await syncService.syncByAPI(apiName, isoStartDate, isoEndDate, req.user.id);
    
    res.json({
        success: true,
        message: `Sincronización de ${apiName} completada`,
        data: result
    });
});

/**
 * Obtener historial de sincronizaciones
 * GET /api/sync/history
 */
export const getSyncHistory = catchAsync(async (req, res) => {
    const { limit = 50, apiName, status } = req.query;
    
    const where = {};
    if (apiName) where.apiName = apiName;
    if (status) where.status = status;
    
    const syncLogs = await SyncLog.findAll({
        where,
        limit: parseInt(limit),
        order: [['startTime', 'DESC']],
        include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'fullName'],
            required: false // Hacer el join opcional
        }]
    });
    
    // Deshabilitar caché para esta respuesta
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
    res.json({
        success: true,
        data: syncLogs
    });
});

/**
 * Obtener última sincronización por API
 * GET /api/sync/last/:apiName
 */
export const getLastSyncByAPI = catchAsync(async (req, res) => {
    const { apiName } = req.params;
    
    if (!['reservo', 'snabb', 'dtemite'].includes(apiName)) {
        throw new ApiError(400, 'API no válida');
    }
    
    const lastSync = await SyncLog.findOne({
        where: { apiName },
        order: [['startTime', 'DESC']],
        include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'fullName'],
            required: false // Hacer el join opcional
        }]
    });
    
    if (!lastSync) {
        return res.json({
            success: true,
            message: 'No hay sincronizaciones previas',
            data: null
        });
    }
    
    res.json({
        success: true,
        data: lastSync
    });
});

/**
 * Verificar estado de conexión de todas las APIs
 * GET /api/sync/status
 */
export const checkAPIsStatus = catchAsync(async (req, res) => {
    const status = await syncService.checkAllAPIs();
    
    // Calcular estado general
    const allOk = Object.values(status).every(api => api.status === 'ok');
    
    res.json({
        success: true,
        data: {
            overall: allOk ? 'ok' : 'error',
            apis: status
        }
    });
});

/**
 * Obtener resumen de sincronizaciones
 * GET /api/sync/summary
 */
export const getSyncSummary = catchAsync(async (req, res) => {
    const { days = 7 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const syncLogs = await SyncLog.findAll({
        where: {
            startTime: {
                [Op.gte]: startDate
            }
        },
        order: [['startTime', 'DESC']]
    });
    
    // Calcular resumen
    const summary = {
        total: syncLogs.length,
        porAPI: {},
        porEstado: {
            success: 0,
            error: 0,
            partial: 0
        },
        totales: {
            procesados: 0,
            creados: 0,
            actualizados: 0,
            errores: 0
        },
        promediosDuracion: {}
    };
    
    syncLogs.forEach(log => {
        // Por API
        if (!summary.porAPI[log.apiName]) {
            summary.porAPI[log.apiName] = {
                total: 0,
                success: 0,
                error: 0,
                procesados: 0,
                duracionTotal: 0
            };
        }
        summary.porAPI[log.apiName].total++;
        summary.porAPI[log.apiName][log.status]++;
        summary.porAPI[log.apiName].procesados += log.recordsProcessed || 0;
        summary.porAPI[log.apiName].duracionTotal += log.duration || 0;
        
        // Por estado
        summary.porEstado[log.status]++;
        
        // Totales
        summary.totales.procesados += log.recordsProcessed || 0;
        summary.totales.creados += log.recordsCreated || 0;
        summary.totales.actualizados += log.recordsUpdated || 0;
        summary.totales.errores += log.recordsError || 0;
    });
    
    // Calcular promedios de duración
    Object.keys(summary.porAPI).forEach(api => {
        const data = summary.porAPI[api];
        summary.promediosDuracion[api] = data.total > 0 
            ? Math.round(data.duracionTotal / data.total)
            : 0;
    });
    
    res.json({
        success: true,
        data: summary
    });
});

/**
 * Obtener detalle de una sincronización específica
 * GET /api/sync/log/:id
 */
export const getSyncLogById = catchAsync(async (req, res) => {
    const { id } = req.params;
    
    const syncLog = await SyncLog.findByPk(id, {
        include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'fullName']
        }]
    });
    
    if (!syncLog) {
        throw new ApiError(404, 'Log de sincronización no encontrado');
    }
    
    res.json({
        success: true,
        data: syncLog
    });
});

export default {
    syncAll,
    syncByAPI,
    getSyncHistory,
    getLastSyncByAPI,
    checkAPIsStatus,
    getSyncSummary,
    getSyncLogById
};