/* --- SERVICIO DE INTEGRACIÓN CON SNABB (BONOS FONASA) --- */

import axios from 'axios';
import { config } from '../config/config.js';
import logger from '../utils/logger.js';
import { ApiError } from '../middleware/errorHandle.js';

/**
 * Cliente HTTP configurado para Snabb
 */
const snabbClient = axios.create({
    baseURL: config.snabb.apiUrl,
    timeout: config.snabb.timeout || 30000,
    headers: {
        'X-API-Key': config.snabb.apiKey,
        'X-Organization-Id': config.snabb.organizationId,
        'Content-Type': 'application/json'
    }
});

/**
 * Obtener bonos emitidos por rango de fechas
 */
export const getBonos = async (startDate, endDate) => {
    try {
        logger.logInfo(`Obteniendo bonos de Snabb: ${startDate} - ${endDate}`);
        
        const response = await snabbClient.get('/bonos', {
            params: {
                fecha_inicio: startDate,
                fecha_fin: endDate,
                estado: 'all' // emitido, utilizado, anulado
            }
        });
        
        logger.logInfo(`Bonos obtenidos de Snabb: ${response.data.length}`);
        
        return response.data;
        
    } catch (error) {
        logger.logError('Error al obtener bonos de Snabb:', error);
        
        if (error.response) {
            throw new ApiError(
                error.response.status,
                `Error Snabb: ${error.response.data.message || error.message}`
            );
        }
        
        throw new ApiError(500, 'Error de conexión con Snabb');
    }
};

/**
 * Obtener detalle de un bono específico
 */
export const getBonoById = async (bonoId) => {
    try {
        logger.logInfo(`Obteniendo detalle de bono Snabb: ${bonoId}`);
        
        const response = await snabbClient.get(`/bonos/${bonoId}`);
        
        return response.data;
        
    } catch (error) {
        logger.logError(`Error al obtener bono ${bonoId} de Snabb:`, error);
        
        if (error.response?.status === 404) {
            throw new ApiError(404, 'Bono no encontrado en Snabb');
        }
        
        throw new ApiError(500, 'Error al obtener bono de Snabb');
    }
};

/**
 * Obtener bonos por paciente (RUT)
 */
export const getBonosByPatient = async (patientRut) => {
    try {
        logger.logInfo(`Obteniendo bonos de paciente ${patientRut} en Snabb`);
        
        const response = await snabbClient.get('/bonos/paciente', {
            params: { rut: patientRut }
        });
        
        return response.data;
        
    } catch (error) {
        logger.logError(`Error al obtener bonos del paciente ${patientRut}:`, error);
        throw new ApiError(500, 'Error al consultar paciente en Snabb');
    }
};

/**
 * Obtener información de previsión Fonasa del paciente
 */
export const getPrevisionInfo = async (patientRut) => {
    try {
        logger.logInfo(`Consultando previsión Fonasa de ${patientRut}`);
        
        const response = await snabbClient.get('/prevision', {
            params: { rut: patientRut }
        });
        
        return {
            prevision: 'Fonasa',
            planSalud: response.data.tramo, // A, B, C, D
            isActive: response.data.activo
        };
        
    } catch (error) {
        logger.logError(`Error al consultar previsión de ${patientRut}:`, error);
        return null;
    }
};

/**
 * Transformar datos de Snabb a formato interno
 */
export const transformSnabbData = (snabbBono) => {
    return {
        snabbId: snabbBono.id?.toString(),
        pacienteRut: snabbBono.paciente?.rut,
        pacienteNombre: snabbBono.paciente?.nombre_completo,
        prevision: 'Fonasa',
        planSalud: snabbBono.paciente?.tramo, // A, B, C, D
        bonoNumero: snabbBono.numero_bono,
        bonoEstado: snabbBono.estado, // emitido, utilizado, anulado
        bonoMonto: parseFloat(snabbBono.monto_bono),
        bonoFechaEmision: snabbBono.fecha_emision,
        copago: parseFloat(snabbBono.copago || 0),
        origenDatos: 'snabb',
        datosRaw: snabbBono
    };
};

/**
 * Sincronizar bonos de Snabb
 */
export const syncBonos = async (startDate, endDate) => {
    try {
        const bonos = await getBonos(startDate, endDate);
        
        // Transformar cada bono al formato interno
        const transformedBonos = bonos.map(bono => transformSnabbData(bono));
        
        logger.logInfo(`${transformedBonos.length} bonos transformados de Snabb`);
        
        return transformedBonos;
        
    } catch (error) {
        logger.logError('Error en sincronización de Snabb:', error);
        throw error;
    }
};

/**
 * Verificar estado de conexión con Snabb
 */
export const checkConnection = async () => {
    try {
        const response = await snabbClient.get('/health');
        return { status: 'ok', message: 'Conexión con Snabb exitosa' };
    } catch (error) {
        logger.logError('Error de conexión con Snabb:', error);
        return { status: 'error', message: error.message };
    }
};

export default {
    getBonos,
    getBonoById,
    getBonosByPatient,
    getPrevisionInfo,
    transformSnabbData,
    syncBonos,
    checkConnection
};