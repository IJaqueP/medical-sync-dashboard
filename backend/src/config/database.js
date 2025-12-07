/* --- CONFIGURACIÓN DE BASE DE DATOS --- */

import { Sequelize } from 'sequelize';
import { config } from './config.js';
import logger from '../utils/logger.js';

/* --- INSTANCIA DE SEQUELIZE --- */
const sequelize = new Sequelize(
    config.database.name,
    config.database.user,
    config.database.password,
    {
        host: config.database.host,
        port: config.database.port,
        dialect: config.database.dialect,
        logging: config.database.logging,
        pool: config.database.pool,
        dialectOptions: {
            ssl: process.env.NODE_ENV === 'production' ? {
                require: true,
                rejectUnauthorized: false
            } : false,
            connectTimeout: 60000
        },
        define: {
            // Configuración por defecto para todos los modelos
            timestamps: true,           // Agrega createdAt y updateAt
            underscored: false,         // Usar camelCase en vez de snake_case
            freezeTableName: false      // Pluralizar nombres de tablas automáticamente
        }
    }
);


/* PROBAR CONEXIÓN */
export const testConnection = async () => {
    try {
        await sequelize.authenticate();
        logger.logInfo('Conexión a PostgreSQL exitosa');
        logger.logInfo(`Base de Datos: ${config.database.name}`);
        return true;

    } catch (err) {
        logger.logError('Error al conectar a PostgreSQL', err);
        throw err;
    }
};


/* CERRAR CONEXIÓN */
export const closeConnection = async () => {
    try {
        await sequelize.close();
        logger.logInfo('Conexión a PostgreSQL cerrada');
        return true;

    } catch (err) {
        logger.logError('Error al cerrar conexión a PostgreSQL', err);
        throw err;
    }
};


/* ASEGURAR QUE LA BASE DE DATOS EXISTE */
export const ensureDatabase = async () => {
    // Solo en desarrollo, verificar/crear la base de datos
    if (process.env.NODE_ENV === 'production') {
        logger.logInfo('MODO PRODUCCIÓN: ASUMIENDO QUE LA BASE DE DATOS YA EXISTE');
        return true;
    }

    try {
        // Conectar a PostgreSQL para crear la BD si no existe
        const { Sequelize } = await import('sequelize');
        const tempSequelize = new Sequelize(
            'postgres',
            config.database.user,
            config.database.password,
            {
                host: config.database.host,
                port: config.database.port,
                dialect: 'postgres',
                logging: false
            }
        );

        // Verificar existencia de la base de datos
        const [results] = await tempSequelize.query(
            `SELECT 1 FROM pg_database WHERE datname = '${config.database.name}'`
        );

        if (results.length === 0) {
            // Crear la base de datos
            await tempSequelize.query(`CREATE DATABASE ${config.database.name}`);
            logger.logInfo(`✅ Base de Datos ${config.database.name} creada exitosamente`);
        } else {
            logger.logInfo(`✅ Base de Datos ${config.database.name} ya existe`);
        }

        await tempSequelize.close();
        return true;


    } catch (err) {
        logger.logError('Error al verificar/crear la base de datos', err);
        throw err;
    }
};

export { sequelize };
export default sequelize;