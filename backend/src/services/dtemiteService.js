/* --- SERVICIO DE INTEGRACIÓN CON DTEMITE (FACTURACIÓN ELECTRÓNICA) --- */

import axios from 'axios';
import { config } from '../config/config.js';
import logger from '../utils/logger.js';
import { ApiError } from '../middleware/errorHandle.js';

/**
 * Cliente HTTP configurado para DTEmite
 */
const dtemiteClient = axios.create({
    baseURL: config.dtemite.apiUrl,
    timeout: config.dtemite.timeout || 30000,
    headers: {
        'X-API-Key': config.dtemite.apiKey,
        'X-Company-Id': config.dtemite.companyId,
        'Content-Type': 'application/json'
    }
});

/**
 * Obtener documentos tributarios por rango de fechas
 */
export const getDocuments = async (startDate, endDate) => {
    try {
        logger.logInfo(`Obteniendo documentos de DTEmite: ${startDate} - ${endDate}`);
        
        const response = await dtemiteClient.get('/documentos', {
            params: {
                fecha_desde: startDate,
                fecha_hasta: endDate,
                tipos: '33,39,61' // 33=Factura, 39=Boleta, 61=Nota Crédito
            }
        });
        
        logger.logInfo(`Documentos obtenidos de DTEmite: ${response.data.length}`);
        
        return response.data;
        
    } catch (error) {
        logger.logError('Error al obtener documentos de DTEmite:', error);
        
        if (error.response) {
            throw new ApiError(
                error.response.status,
                `Error DTEmite: ${error.response.data.message || error.message}`
            );
        }
        
        throw new ApiError(500, 'Error de conexión con DTEmite');
    }
};

/**
 * Obtener detalle de un documento específico
 */
export const getDocumentById = async (documentId) => {
    try {
        logger.logInfo(`Obteniendo detalle de documento DTEmite: ${documentId}`);
        
        const response = await dtemiteClient.get(`/documentos/${documentId}`);
        
        return response.data;
        
    } catch (error) {
        logger.logError(`Error al obtener documento ${documentId} de DTEmite:`, error);
        
        if (error.response?.status === 404) {
            throw new ApiError(404, 'Documento no encontrado en DTEmite');
        }
        
        throw new ApiError(500, 'Error al obtener documento de DTEmite');
    }
};

/**
 * Obtener documentos por RUT del cliente
 */
export const getDocumentsByPatient = async (patientRut) => {
    try {
        logger.logInfo(`Obteniendo documentos de paciente ${patientRut} en DTEmite`);
        
        const response = await dtemiteClient.get('/documentos/cliente', {
            params: { rut: patientRut }
        });
        
        return response.data;
        
    } catch (error) {
        logger.logError(`Error al obtener documentos del paciente ${patientRut}:`, error);
        throw new ApiError(500, 'Error al consultar paciente en DTEmite');
    }
};

/**
 * Emitir nueva factura electrónica
 */
export const emitirFactura = async (facturaData) => {
    try {
        logger.logInfo('Emitiendo nueva factura en DTEmite');
        
        const response = await dtemiteClient.post('/documentos/emitir', {
            tipo_documento: facturaData.tipo || 33, // 33 = Factura electrónica
            receptor: {
                rut: facturaData.clienteRut,
                razon_social: facturaData.clienteNombre,
                direccion: facturaData.clienteDireccion,
                comuna: facturaData.clienteComuna
            },
            items: facturaData.items,
            referencias: facturaData.referencias
        });
        
        logger.logInfo(`Factura emitida: ${response.data.folio}`);
        
        return response.data;
        
    } catch (error) {
        logger.logError('Error al emitir factura:', error);
        throw new ApiError(500, 'Error al emitir factura en DTEmite');
    }
};

/**
 * Obtener estado de un documento en el SII
 */
export const getEstadoSII = async (documentId) => {
    try {
        const response = await dtemiteClient.get(`/documentos/${documentId}/estado-sii`);
        
        return {
            estado: response.data.estado, // ACEPTADO, RECHAZADO, REPARO
            glosa: response.data.glosa,
            fechaConsulta: response.data.fecha_consulta
        };
        
    } catch (error) {
        logger.logError(`Error al consultar estado SII del documento ${documentId}:`, error);
        return null;
    }
};

/**
 * Transformar datos de DTEmite a formato interno
 */
export const transformDtemiteData = (dtemiteDoc) => {
    return {
        dtemiteId: dtemiteDoc.id?.toString(),
        pacienteRut: dtemiteDoc.receptor?.rut,
        pacienteNombre: dtemiteDoc.receptor?.razon_social,
        facturaNumero: dtemiteDoc.folio?.toString(),
        facturaTipo: dtemiteDoc.tipo_documento?.toString(), // 33, 39, 61
        facturaEstado: dtemiteDoc.estado, // emitida, pagada, anulada
        facturaFechaEmision: dtemiteDoc.fecha_emision,
        facturaMontoNeto: parseFloat(dtemiteDoc.monto_neto),
        facturaMontoIva: parseFloat(dtemiteDoc.monto_iva),
        facturaMontoTotal: parseFloat(dtemiteDoc.monto_total),
        metodoPago: dtemiteDoc.forma_pago, // efectivo, tarjeta, transferencia
        estadoPago: dtemiteDoc.estado_pago, // pendiente, pagado, parcial
        fechaPago: dtemiteDoc.fecha_pago,
        montoPagado: parseFloat(dtemiteDoc.monto_pagado || 0),
        origenDatos: 'dtemite',
        datosRaw: dtemiteDoc
    };
};

/**
 * Sincronizar documentos de DTEmite
 */
export const syncDocuments = async (startDate, endDate) => {
    try {
        const documents = await getDocuments(startDate, endDate);
        
        // Transformar cada documento al formato interno
        const transformedDocuments = documents.map(doc => transformDtemiteData(doc));
        
        logger.logInfo(`${transformedDocuments.length} documentos transformados de DTEmite`);
        
        return transformedDocuments;
        
    } catch (error) {
        logger.logError('Error en sincronización de DTEmite:', error);
        throw error;
    }
};

/**
 * Verificar estado de conexión con DTEmite
 */
export const checkConnection = async () => {
    try {
        const response = await dtemiteClient.get('/health');
        return { status: 'ok', message: 'Conexión con DTEmite exitosa' };
    } catch (error) {
        logger.logError('Error de conexión con DTEmite:', error);
        return { status: 'error', message: error.message };
    }
};

export default {
    getDocuments,
    getDocumentById,
    getDocumentsByPatient,
    emitirFactura,
    getEstadoSII,
    transformDtemiteData,
    syncDocuments,
    checkConnection
};