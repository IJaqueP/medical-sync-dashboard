/* --- SERVICIO DE SINCRONIZACIÓN CONSOLIDADA --- */

import { Atencion, SyncLog } from '../models/index.js';
import * as reservoService from './reservoService.js';
import * as snabbService from './snabbService.js';
import * as dtemiteService from './dtemiteService.js';
import logger from '../utils/logger.js';
import { syncConfig } from '../config/sync.js';

/**
 * Consolidar datos de múltiples fuentes por RUT
 */
const consolidateByRut = (reservoData, snabbData, dtemiteData) => {
    const consolidated = new Map();
    
    // Procesar datos de Reservo (citas)
    reservoData.forEach(cita => {
        const rut = cita.pacienteRut;
        if (!consolidated.has(rut)) {
            consolidated.set(rut, []);
        }
        consolidated.get(rut).push({ ...cita, source: 'reservo' });
    });
    
    // Agregar datos de Snabb (bonos)
    snabbData.forEach(bono => {
        const rut = bono.pacienteRut;
        if (!consolidated.has(rut)) {
            consolidated.set(rut, []);
        }
        
        // Buscar cita matching por fecha aproximada
        const citasDelPaciente = consolidated.get(rut);
        const citaMatching = citasDelPaciente.find(c => 
            c.source === 'reservo' && 
            !c.snabbId &&
            Math.abs(new Date(c.fechaCita) - new Date(bono.bonoFechaEmision)) < 86400000 // 1 día
        );
        
        if (citaMatching) {
            // Fusionar con cita existente
            Object.assign(citaMatching, {
                snabbId: bono.snabbId,
                prevision: bono.prevision,
                planSalud: bono.planSalud,
                bonoNumero: bono.bonoNumero,
                bonoEstado: bono.bonoEstado,
                bonoMonto: bono.bonoMonto,
                bonoFechaEmision: bono.bonoFechaEmision,
                copago: bono.copago
            });
        } else {
            // Crear registro nuevo
            citasDelPaciente.push({ ...bono, source: 'snabb' });
        }
    });
    
    // Agregar datos de DTEmite (facturas)
    dtemiteData.forEach(factura => {
        const rut = factura.pacienteRut;
        if (!consolidated.has(rut)) {
            consolidated.set(rut, []);
        }
        
        const citasDelPaciente = consolidated.get(rut);
        const citaMatching = citasDelPaciente.find(c => 
            !c.dtemiteId &&
            Math.abs(new Date(c.fechaCita || c.bonoFechaEmision) - new Date(factura.facturaFechaEmision)) < 86400000
        );
        
        if (citaMatching) {
            // Fusionar con registro existente
            Object.assign(citaMatching, {
                dtemiteId: factura.dtemiteId,
                facturaNumero: factura.facturaNumero,
                facturaTipo: factura.facturaTipo,
                facturaEstado: factura.facturaEstado,
                facturaFechaEmision: factura.facturaFechaEmision,
                facturaMontoNeto: factura.facturaMontoNeto,
                facturaMontoIva: factura.facturaMontoIva,
                facturaMontoTotal: factura.facturaMontoTotal,
                metodoPago: factura.metodoPago,
                estadoPago: factura.estadoPago,
                fechaPago: factura.fechaPago,
                montoPagado: factura.montoPagado
            });
        } else {
            // Crear registro nuevo
            citasDelPaciente.push({ ...factura, source: 'dtemite' });
        }
    });
    
    // Convertir Map a array plano
    const result = [];
    consolidated.forEach(records => {
        result.push(...records);
    });
    
    return result;
};

/**
 * Guardar o actualizar atención en base de datos
 */
const saveOrUpdateAtencion = async (atencionData) => {
    try {
        // Buscar si ya existe por IDs externos
        let atencion = null;
        
        if (atencionData.reservoId) {
            atencion = await Atencion.findOne({ where: { reservoId: atencionData.reservoId } });
        }
        
        if (!atencion && atencionData.snabbId) {
            atencion = await Atencion.findOne({ where: { snabbId: atencionData.snabbId } });
        }
        
        if (!atencion && atencionData.dtemiteId) {
            atencion = await Atencion.findOne({ where: { dtemiteId: atencionData.dtemiteId } });
        }
        
        if (atencion) {
            // Actualizar existente
            await atencion.update(atencionData);
            return { action: 'updated', atencion };
        } else {
            // Crear nueva
            atencion = await Atencion.create(atencionData);
            return { action: 'created', atencion };
        }
        
    } catch (error) {
        logger.logError('Error al guardar atención:', error);
        throw error;
    }
};

/**
 * Sincronizar API individual
 */
const syncSingleAPI = async (apiName, syncFunction, startDate, endDate, userId = null) => {
    const logData = {
        apiName,
        syncType: userId ? 'manual' : 'automatic',
        status: 'success',
        startTime: new Date(),
        userId,
        recordsProcessed: 0,
        recordsCreated: 0,
        recordsUpdated: 0,
        recordsError: 0
    };
    
    try {
        logger.logInfo(`Iniciando sincronización de ${apiName}`);
        
        // Ejecutar sincronización
        const data = await syncFunction(startDate, endDate);
        logData.recordsProcessed = data.length;
        
        // Guardar/actualizar cada registro
        for (const item of data) {
            try {
                const result = await saveOrUpdateAtencion(item);
                
                if (result.action === 'created') {
                    logData.recordsCreated++;
                } else {
                    logData.recordsUpdated++;
                }
            } catch (error) {
                logData.recordsError++;
                logger.logError(`Error procesando registro de ${apiName}:`, error);
            }
        }
        
        logData.endTime = new Date();
        logData.duration = logData.endTime - logData.startTime;
        logData.status = logData.recordsError > 0 ? 'partial' : 'success';
        
        logger.logInfo(`Sincronización de ${apiName} completada: ${logData.recordsCreated} creados, ${logData.recordsUpdated} actualizados`);
        
    } catch (error) {
        logData.endTime = new Date();
        logData.duration = logData.endTime - logData.startTime;
        logData.status = 'error';
        logData.errorMessage = error.message;
        logData.errorDetails = { stack: error.stack };
        
        logger.logError(`Error en sincronización de ${apiName}:`, error);
    }
    
    // Guardar log de sincronización
    await SyncLog.create(logData);
    
    return logData;
};

/**
 * Sincronización completa de todas las APIs
 */
export const syncAll = async (startDate, endDate, userId = null) => {
    try {
        logger.logInfo(`Iniciando sincronización completa: ${startDate} - ${endDate}`);
        
        const results = {
            startTime: new Date(),
            apis: {},
            summary: {
                total: 0,
                created: 0,
                updated: 0,
                errors: 0
            }
        };
        
        // Sincronizar cada API habilitada
        if (syncConfig.apis.reservo.enabled) {
            const result = await syncSingleAPI('reservo', reservoService.syncAppointments, startDate, endDate, userId);
            results.apis.reservo = result;
            results.summary.total += result.recordsProcessed;
            results.summary.created += result.recordsCreated;
            results.summary.updated += result.recordsUpdated;
            results.summary.errors += result.recordsError;
        }
        
        if (syncConfig.apis.snabb.enabled) {
            const result = await syncSingleAPI('snabb', snabbService.syncBonos, startDate, endDate, userId);
            results.apis.snabb = result;
            results.summary.total += result.recordsProcessed;
            results.summary.created += result.recordsCreated;
            results.summary.updated += result.recordsUpdated;
            results.summary.errors += result.recordsError;
        }
        
        if (syncConfig.apis.dtemite.enabled) {
            const result = await syncSingleAPI('dtemite', dtemiteService.syncDocuments, startDate, endDate, userId);
            results.apis.dtemite = result;
            results.summary.total += result.recordsProcessed;
            results.summary.created += result.recordsCreated;
            results.summary.updated += result.recordsUpdated;
            results.summary.errors += result.recordsError;
        }
        
        results.endTime = new Date();
        results.duration = results.endTime - results.startTime;
        
        logger.logInfo(`Sincronización completa finalizada: ${results.summary.created} creados, ${results.summary.updated} actualizados, ${results.summary.errors} errores`);
        
        return results;
        
    } catch (error) {
        logger.logError('Error en sincronización completa:', error);
        throw error;
    }
};

/**
 * Sincronizar solo una API específica
 */
export const syncByAPI = async (apiName, startDate, endDate, userId = null) => {
    const syncFunctions = {
        reservo: reservoService.syncAppointments,
        snabb: snabbService.syncBonos,
        dtemite: dtemiteService.syncDocuments
    };
    
    if (!syncFunctions[apiName]) {
        throw new Error(`API no válida: ${apiName}`);
    }
    
    if (!syncConfig.apis[apiName]?.enabled) {
        throw new Error(`API ${apiName} no está habilitada`);
    }
    
    return await syncSingleAPI(apiName, syncFunctions[apiName], startDate, endDate, userId);
};

/**
 * Verificar estado de todas las APIs
 */
export const checkAllAPIs = async () => {
    const status = {};
    
    if (syncConfig.apis.reservo.enabled) {
        status.reservo = await reservoService.checkConnection();
    }
    
    if (syncConfig.apis.snabb.enabled) {
        status.snabb = await snabbService.checkConnection();
    }
    
    if (syncConfig.apis.dtemite.enabled) {
        status.dtemite = await dtemiteService.checkConnection();
    }
    
    return status;
};

/**
 * Obtener historial de sincronizaciones
 */
export const getSyncHistory = async (limit = 50) => {
    return await SyncLog.findAll({
        order: [['startTime', 'DESC']],
        limit
    });
};

export default {
    syncAll,
    syncByAPI,
    checkAllAPIs,
    getSyncHistory
};