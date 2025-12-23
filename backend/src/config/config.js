/* En este archivo leeremos todas las variables de entorno del archivo .env
y se expondrán de forma estructurada para trabajar durante todo el proyecto */

import dotenv from 'dotenv';

dotenv.config();

/* --- OBJETO DE CONFIGURACIÓN GLOBAL --- */
export const config = {
    // Configuración del servidor
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',

    // Configuración de la base de datos
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 5432,
        name: process.env.DB_NAME || 'servicio_medico_db',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
        dialect: 'postgres',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 5,         // Máximo 5 conexiones simultáneas
            min: 0,         // Mínimo 0 conexiones
            acquire: 30000, // Tiempo máximo para obtener conexión (30s)
            idle: 100000     // Tiempo antes de cerrar conexión inactiva (100s)
        }
    },


/* --- CONFIGURACIÓN DE JWT --- */
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN
    },


/* --- CONFIGURACIÓN API RESERVO --- */
    reservo: {
        apiUrl: process.env.RESERVO_API_URL,
        token: process.env.RESERVO_API_TOKEN,
        timeout: 300000
    },


/* --- CONFIGURACIÓN API SNABB --- */
    snabb: {
        apiUrl: process.env.SNABB_API_URL,
        apiKey: process.env.SNABB_API_KEY,
        organizationRut: process.env.SNABB_ORGANIZATION_RUT,
        timeout: 30000
    },


/* --- CONFIGURACIÓN API DTEMITE --- */
    dtemite: {
        apiUrl: process.env.DTEMITE_API_URL,
        apiKey: process.env.DTEMITE_API_KEY,
        companyId: process.env.DTEMITE_COMPANY_ID,
        timeout: 300000
    },


/* --- CONFIGURACIÓN DE SINCRONIZACIÓN --- */
    sync: {
        intervalMinutes: parseInt(process.env.SYNC_INTERVAL_MINUTES)
    },


/* --- CONFIGURACIÓN CORS --- */
    corsOrigin: process.env.CORS_ORIGIN,


/* --- CONFIGURACIÓN RATE LIMITING --- */
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS),
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS)
    }

};


/* Validar que las variables críticas estén configuradas, sino, mostrar un WARNING  */
export const validateConfig = () => {
    const requiredVars = [
        'DB_HOST',
        'DB_NAME',
        'DB_USER',
        'DB_PASSWORD',
        'JWT_SECRET'
    ];

    const missing = requiredVars.filter(varName => !process.env[varName]);

    if (missing.length > 0) {
        console.warn('🅰️ Variables de entorno faltantes: ', missing.join(', '));
        console.warn('🅰️ El sistema puede no funcionar correctamente');
    }
};




validateConfig();