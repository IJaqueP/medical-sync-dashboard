/* --- CONFIGURACIÓN DE CRON JOBS PARA SINCRONIZACIÓN AUTOMÁTICA --- */

import cron from 'node-cron';
import { syncConfig } from '../config/sync.js';
import { syncAll } from '../services/syncService.js';
import logger from './logger.js';

let syncJob = null;

/**
 * Iniciar cron job de sincronización automática
 */
export const startCronJobs = () => {
    if (!syncConfig.autoSync) {
        logger.logInfo('🔴 Sincronización automática desactivada');
        return;
    }
    
    const intervalMinutes = syncConfig.intervalMs / 60000;
    
    // Convertir minutos a expresión cron
    let cronExpression;
    
    if (intervalMinutes >= 60) {
        // Si es 1 hora o más, usar expresión de horas
        const hours = Math.floor(intervalMinutes / 60);
        cronExpression = `0 */${hours} * * *`; // Cada X horas
    } else {
        // Si es menos de 1 hora, usar expresión de minutos
        cronExpression = `*/${intervalMinutes} * * * *`; // Cada X minutos
    }
    
    logger.logInfo(`⏰ Iniciando sincronización automática cada ${intervalMinutes} minutos`);
    logger.logInfo(`   Expresión cron: ${cronExpression}`);
    
    syncJob = cron.schedule(cronExpression, async () => {
        try {
            logger.logInfo('🔄 Iniciando sincronización automática programada');
            
            // Calcular rango de fechas (últimos días según config)
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - syncConfig.timeWindow.daysBack);
            
            // Ejecutar sincronización
            const results = await syncAll(
                startDate.toISOString().split('T')[0],
                endDate.toISOString().split('T')[0],
                null // userId = null para sincronización automática
            );
            
            logger.logInfo(`✅ Sincronización automática completada: ${results.summary.created} creados, ${results.summary.updated} actualizados`);
            
        } catch (error) {
            logger.logError('❌ Error en sincronización automática:', error);
        }
    });
    
    logger.logInfo('✅ Cron job de sincronización iniciado');
};

/**
 * Detener cron job de sincronización
 */
export const stopCronJobs = () => {
    if (syncJob) {
        syncJob.stop();
        logger.logInfo('🛑 Cron job de sincronización detenido');
    }
};

/**
 * Obtener estado del cron job
 */
export const getCronStatus = () => {
    return {
        active: syncJob ? true : false,
        intervalMinutes: syncConfig.intervalMs / 60000,
        autoSync: syncConfig.autoSync
    };
};

export default {
    startCronJobs,
    stopCronJobs,
    getCronStatus
};