/* --- SISTEMA DE LOGS CON WINSTON --- */

import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtención de __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ============================================= 
Niveles de log disponibles:
- error: Errores críticos.
- warn: Advertencias.
- info: Información general.
- debug: Información detallada para debugging.
================================================ */

/* --- Formato personalizado para los log --- 
Se incluirán timestamp, nivel y mensaje personalizado */

const customFormat = winston.format.combine(
    // Timestamp
    winston.format.timestamp(
        {
            format: 'YYYY-MM-DD HH:mm:ss'
        }
    ),

    // Stack trace
    winston.format.errors({ stack: true }),

    // Formateo final
    winston.format.printf((info) => {
        const { timestamp, level, message, stack } = info;

        // Si hay un error con el stack trace, mostrarlo
        if (stack) {
            return `${timestamp} [${level.toUpperCase()}]: ${message}\n${stack}`;
        }

        return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
);


// Formato con colores para la consola
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(
        {
            format: 'YYYY-MM-DD HH:mm:ss'
        }
    ),
    winston.format.printf((info) => {
        const { timestamp, level, message } = info;
        return `${timestamp} [${level}]: ${message}`;
    })
);


// Transports (donde se guardan los logs)
const transports = [
    // 1. Logs en consola (SIEMPRE!)
    new winston.transports.Console(
        {
            format: consoleFormat,
            level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
        }
    )
];


// En producción también guardar logs en archivos
if (process.env.NODE_ENV === 'production') {
    // Logs de errores en archivos separados
    transports.push(
        new winston.transports.File(
            {
                filename: path.join(__dirname, '../../logs/error.log'),
                level: 'error',
                format: customFormat,
                maxsize: 5242880, // 5MB
                maxFiles: 5 // Máximo 5 archivos
            }
        )
    );

    // Todos los logs en archivo general
    transports.push(
        new winston.transports.File(
            {
                filename: path.join(__dirname, '../../logs/combined.log'),
                format: customFormat,
                maxsize: 5242880,
                maxFiles: 5
            }
        )
    );
}


// --- CREACIÓN DEL LOGGER ---
const logger = winston.createLogger(
    {
        level: process.env.LOG_LEVEL || 'info',
        format: customFormat,
        transports,
        exitOnError: false
    }
);


/* --- MÉTODOS DE AYUDA PARA LOGGING --- */
/*
 * Ejemplos de uso:
 * 
 * logger.info('Servidor iniciado en puerto 3000');
 * logger.warn('API de Reservo respondiendo lento');
 * logger.error('Error al conectar a PostgreSQL');
 * logger.debug('Query SQL ejecutada: SELECT * FROM users');
 * 
 * O con los métodos helper:
 * logger.logInfo('Servidor iniciado');
 * logger.logError('Error de conexión', error);
 */

// Log de error
logger.logError = (message, error = null) => {
    if (error) {
        logger.error(`${message}: ${error.message}`, { stack: error.stack });
    } else {
        logger.error(message);
    }
};

// Log de información
logger.logInfo = (message) => {
    logger.info(message);
};

// Log de warning
logger.logWarn = (message) => {
    logger.warn(message);
};

// Log de debug
logger.logDebug = (message) => {
    if (process.env.NODE_ENV !== 'production') {
        logger.debug(message);
    }
};


export default logger;