/* --- SERVICIO DE INTEGRACIÓN CON SNABB (BONOS FONASA) --- */

import axios from 'axios';
import { config } from '../config/config.js';
import logger from '../utils/logger.js';
import { ApiError } from '../middleware/errorHandle.js';

/**
 * Cliente HTTP configurado para Snabb API v1
 * Documentación: https://api.fonasa.snabb.cl/dev/docs
 */
const snabbClient = axios.create({
    baseURL: config.snabb.apiUrl || 'https://api.fonasa.snabb.cl/dev',
    timeout: config.snabb.timeout || 30000,
    headers: {
        'x-api-key': config.snabb.apiKey,
        'Content-Type': 'application/json'
    }
});

// Interceptor para logging de requests
snabbClient.interceptors.request.use(
    (config) => {
        logger.logInfo(`[Snabb] ${config.method.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        logger.logError('[Snabb] Request error:', error);
        return Promise.reject(error);
    }
);

// Interceptor para manejo de errores
snabbClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            logger.logError(`[Snabb] Error ${error.response.status}:`, error.response.data);
        } else {
            logger.logError('[Snabb] Network error:', error.message);
        }
        return Promise.reject(error);
    }
);

/**
 * Obtener todos los vouchers (bonos) de la organización
 * GET /vouchers
 */
export const getVouchers = async (startDate, endDate) => {
    try {
        logger.logInfo(`[Snabb] Obteniendo vouchers: ${startDate} - ${endDate}`);
        
        // La API de Snabb no tiene endpoint directo para listar todos los vouchers con filtro de fecha
        // Necesitaremos implementar según la documentación real o usar otro endpoint
        
        // Por ahora retornamos array vacío hasta tener más información
        logger.logInfo('[Snabb] Endpoint de listado de vouchers no disponible en la documentación');
        return [];
        
    } catch (error) {
        logger.logError('[Snabb] Error al obtener vouchers:', error);
        
        if (error.response) {
            throw new ApiError(
                error.response.status,
                `Error Snabb: ${error.response.data?.message || error.message}`
            );
        }
        
        throw new ApiError(500, 'Error de conexión con Snabb');
    }
};

/**
 * Obtener detalle de un voucher específico
 * GET /voucher/{id}
 */
export const getVoucherById = async (voucherId) => {
    try {
        logger.logInfo(`[Snabb] Obteniendo voucher: ${voucherId}`);
        
        const response = await snabbClient.get(`/voucher/${voucherId}`);
        
        return response.data;
        
    } catch (error) {
        logger.logError(`[Snabb] Error al obtener voucher ${voucherId}:`, error);
        
        if (error.response?.status === 404) {
            throw new ApiError(404, 'Voucher no encontrado en Snabb');
        }
        
        throw new ApiError(500, 'Error al obtener voucher de Snabb');
    }
};

/**
 * Crear un voucher (bono) para un paciente
 * POST /vouchers
 */
export const createVoucher = async (voucherData) => {
    try {
        logger.logInfo('[Snabb] Creando voucher');
        
        const payload = {
            beneficiario: {
                run: voucherData.beneficiarioRun
            },
            codigoSucursal: voucherData.codigoSucursal || "0",
            prestaciones: {
                codigo: voucherData.codigoPrestacion
            },
            callback_url: voucherData.callbackUrl,
            redirect_url: voucherData.redirectUrl,
            fechaExpiracion: voucherData.fechaExpiracion,
            organization: {
                rut: voucherData.organizationRut
            },
            practitioner: {
                nombre: voucherData.practitionerNombre,
                run: voucherData.practitionerRun
            }
        };
        
        const response = await snabbClient.post('/vouchers', payload);
        
        logger.logInfo(`[Snabb] Voucher creado: ${response.data.id}`);
        
        return response.data;
        
    } catch (error) {
        logger.logError('[Snabb] Error al crear voucher:', error);
        throw new ApiError(
            error.response?.status || 500,
            error.response?.data?.message || 'Error al crear voucher en Snabb'
        );
    }
};

/**
 * Actualizar el estado de un voucher
 * POST /voucher/{id}/update-status
 */
export const updateVoucherStatus = async (voucherId, newStatus) => {
    try {
        logger.logInfo(`[Snabb] Actualizando status de voucher ${voucherId} a ${newStatus}`);
        
        const response = await snabbClient.post(`/voucher/${voucherId}/update-status`, {
            status: newStatus
        });
        
        return response.data;
        
    } catch (error) {
        logger.logError(`[Snabb] Error al actualizar status de voucher ${voucherId}:`, error);
        throw new ApiError(500, 'Error al actualizar status del voucher');
    }
};

/**
 * Verificar documento del paciente
 * POST /voucher/{voucher_id}/verify
 */
export const verifyPatientDocument = async (voucherId, documentData) => {
    try {
        logger.logInfo(`[Snabb] Verificando documento de voucher ${voucherId}`);
        
        const response = await snabbClient.post(`/voucher/${voucherId}/verify`, documentData);
        
        return response.data;
        
    } catch (error) {
        logger.logError(`[Snabb] Error al verificar documento:`, error);
        throw new ApiError(500, 'Error al verificar documento del paciente');
    }
};

/**
 * Verificar código de email
 * POST /voucher/{voucher_id}/verify-email
 */
export const verifyEmail = async (voucherId, emailCode) => {
    try {
        logger.logInfo(`[Snabb] Verificando email de voucher ${voucherId}`);
        
        const response = await snabbClient.post(`/voucher/${voucherId}/verify-email`, {
            code: emailCode
        });
        
        return response.data;
        
    } catch (error) {
        logger.logError(`[Snabb] Error al verificar email:`, error);
        throw new ApiError(500, 'Error al verificar email');
    }
};

/**
 * Transformar datos de voucher de Snabb a formato de Atencion interno
 */
export const transformVoucherToAtencion = (voucherData) => {
    return {
        snabbId: voucherData.id?.toString(),
        pacienteRut: voucherData.beneficiario?.run,
        pacienteNombre: voucherData.beneficiario?.nombre || 'N/A',
        prevision: 'Fonasa',
        planSalud: voucherData.beneficiario?.tramo,
        bonoNumero: voucherData.voucher_id || voucherData.id?.toString(),
        bonoEstado: voucherData.status, // Requested, PendingVerification, Pending, Payed, Done, Canceled, etc.
        bonoMonto: parseFloat(voucherData.monto || 0),
        bonoFechaEmision: voucherData.createdAt || new Date().toISOString(),
        copago: parseFloat(voucherData.copago || 0),
        prestacion: voucherData.prestaciones?.descripcion || voucherData.prestaciones?.codigo,
        codigoPrestacion: voucherData.prestaciones?.codigo,
        fechaExpiracion: voucherData.fechaExpiracion,
        callbackUrl: voucherData.callback_url,
        redirectUrl: voucherData.redirect_url,
        organizationRut: voucherData.organization?.rut,
        practitionerNombre: voucherData.practitioner?.nombre,
        practitionerRun: voucherData.practitioner?.run,
        sistema: 'Snabb'
    };
};

/**
 * Sincronizar vouchers de Snabb con la base de datos local
 * Nota: Snabb no tiene endpoint de listado masivo, esta función es para referencia futura
 */
export const syncVouchers = async (startDate, endDate) => {
    try {
        logger.logInfo(`[Snabb] Iniciando sincronización de vouchers: ${startDate} - ${endDate}`);
        
        // Por ahora, Snabb no proporciona endpoint para listar todos los vouchers
        // Esta función se implementará cuando esté disponible o se consultarán vouchers individuales
        
        const vouchers = await getVouchers(startDate, endDate);
        
        const transformedVouchers = vouchers.map(voucher => transformVoucherToAtencion(voucher));
        
        logger.logInfo(`[Snabb] ${transformedVouchers.length} vouchers transformados`);
        
        return transformedVouchers;
        
    } catch (error) {
        logger.logError('[Snabb] Error en sincronización de vouchers:', error);
        throw error;
    }
};

/**
 * Verificar estado de conexión con Snabb API
 */
export const checkConnection = async () => {
    try {
        // Intentar crear un voucher de prueba o consultar uno existente
        logger.logInfo('[Snabb] Verificando conexión con API');
        
        // Por ahora, verificamos que la configuración esté presente
        if (!config.snabb.apiKey) {
            return { 
                status: 'error', 
                message: 'API Key de Snabb no configurada' 
            };
        }
        
        return { 
            status: 'ok', 
            message: 'Configuración de Snabb OK',
            apiUrl: config.snabb.apiUrl
        };
        
    } catch (error) {
        logger.logError('[Snabb] Error de conexión:', error);
        return { 
            status: 'error', 
            message: error.message 
        };
    }
};

export default {
    getVouchers,
    getVoucherById,
    createVoucher,
    updateVoucherStatus,
    verifyPatientDocument,
    verifyEmail,
    transformVoucherToAtencion,
    syncVouchers,
    checkConnection
};