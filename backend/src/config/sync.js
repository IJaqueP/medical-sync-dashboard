import { config } from './config.js';
import logger from '../utils/logger.js';

/* CONFIGURACIÓN DE SINCRONIZACIÓN CON APIs EXTERNAS */

export const syncConfig = {
    // Intervalo de sincronización en milisegundos
    intervalMs: config.sync.intervalMinutes * 60 * 1000,

    // Configuración de reintentos
    retries: {
        maxAttempts: 3,
        delayMs: 5000,
        backoffMultiplier: 2 // Incremento exponencial
    },

    // Timeouts para cada API
    timeouts: {
        reservo: 30000,
        snabb: 30000,
        dtemite: 30000
    },

    // Configuración de ventana de tiempo para sincronización
    timeWindow: {
        daysBack: 30,               // Sincronización últimos 30 días por defecto
        daysForward: 90             // Sincronizar próximos 90 días para citas futuras
    },

    // Batch size para procesamiento en lotes
    batchSize: 100,

    // Activar/desactivar sincronización automática
    autoSync: true,

    // Activar/desactivar cada API individualmente
    apis: {
        reservo: {
            enabled: config.reservo.apiKey ? true : false,
            name: 'Reservo'
        },
        snabb: {
            enabled: config.snabb.apiKey ? true : false,
            name: 'Snabb'
        },
        dtemite: {
            enabled: config.dtemite.apiKey ? true : false,
            name: 'DTEmite'
        }
    }
};

/* Valida la configuración de sincronización */
export function validateSyncConfig() {
    const errors = [];

    if (syncConfig.intervalMs < 60000) {
        errors.push('El intervalo de sincronización no puede ser menor a 1 minuto');
    }

    if (syncConfig.retries.maxAttempts < 1) {
        errors.push('Debe haber al menos 1 intento de sincronización');
    }

    if (!Object.values(syncConfig.apis).some(api => api.enabled)) {
        logger.logWarn('⚠️  Ninguna API está habilitada para sincronización');
    }

    if (errors.length > 0) {
        logger.logError('❌ Errores en configuración de sincronización:', errors);
        throw new Error(`Configuración de sincronización inválida: ${errors.join(', ')}`);
    }

    logger.logInfo('✅ Configuración de sincronización validada correctamente');
    return true;
}

// Validar configuración al cargar el módulo
validateSyncConfig();

export default syncConfig;