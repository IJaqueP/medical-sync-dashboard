/* --- SERVIDOR PRINCIPAL - BACKEND --- */
// Updated: 2025-12-08 00:31 - Force restart after DB migration

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Importar configuraciones
import { config } from './src/config/config.js';
import { sequelize, testConnection, ensureDatabase } from './src/config/database.js';
import logger from './src/utils/logger.js';

// Importar rutas
import authRoutes from './src/routes/auth.js';
import userRoutes from './src/routes/users.js';
import atencionRoutes from './src/routes/atenciones.js';
import syncRoutes from './src/routes/sync.js';
import reportRoutes from './src/routes/reports.js';

// Importar middleware de manejo de errores
import { errorHandler, notFound } from './src/middleware/errorHandle.js';

// Importar utilidades
import { createInitialAdmin } from './src/utils/seedAdmin.js';
import { startCronJobs, stopCronJobs } from './src/utils/cronJobs.js';
import models from './src/models/index.js';

// Cargar variables de entorno
dotenv.config();

// Crear aplicación Express
const app = express();

// ===========================================
// CONFIGURACIÓN DE MIDDLEWARES
// ===========================================

// Seguridad con Helmet
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    crossOriginEmbedderPolicy: false
}));

// CORS - Permitir múltiples orígenes
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'https://ijaquep.github.io'
];

app.use(cors({
    origin: (origin, callback) => {
        // Permitir requests sin origin (como Postman) o desde orígenes permitidos
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parseo de JSON y URL-encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging de requests
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined', {
        stream: {
            write: (message) => logger.logInfo(message.trim())
        }
    }));
}

// ===========================================
// RUTAS
// ===========================================

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        database: sequelize.authenticate().then(() => 'connected').catch(() => 'disconnected')
    });
});

// Debug endpoint - TEMPORAL
app.get('/debug/sync-logs', async (req, res) => {
    try {
        // Query directa SQL para verificar
        const [rawResults] = await sequelize.query('SELECT COUNT(*) as count FROM sync_logs');
        const [rawLogs] = await sequelize.query('SELECT * FROM sync_logs ORDER BY id DESC LIMIT 3');
        
        // Query usando modelo
        const { SyncLog } = models;
        const modelCount = await SyncLog.count();
        const modelLogs = await SyncLog.findAll({ limit: 3, order: [['id', 'DESC']] });
        
        res.json({
            rawQuery: {
                total: rawResults[0].count,
                sample: rawLogs
            },
            modelQuery: {
                total: modelCount,
                sample: modelLogs
            },
            dbConfig: {
                host: config.database.host,
                database: config.database.name,
                dialect: config.database.dialect
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message, stack: error.stack });
    }
});

// Endpoint para limpiar base de datos - SOLO PRODUCCIÓN
app.post('/debug/clean-db', async (req, res) => {
    if (process.env.NODE_ENV !== 'production') {
        return res.status(403).json({ error: 'Solo disponible en producción' });
    }
    
    try {
        // Limpiar tablas
        await sequelize.query('TRUNCATE TABLE atenciones RESTART IDENTITY CASCADE');
        await sequelize.query('TRUNCATE TABLE sync_logs RESTART IDENTITY CASCADE');
        
        // Verificar
        const [atencionesCount] = await sequelize.query('SELECT COUNT(*) as count FROM atenciones');
        const [syncLogsCount] = await sequelize.query('SELECT COUNT(*) as count FROM sync_logs');
        
        res.json({
            success: true,
            message: 'Base de datos limpia - Lista para datos reales',
            atenciones: atencionesCount[0].count,
            syncLogs: syncLogsCount[0].count
        });
    } catch (error) {
        res.status(500).json({ error: error.message, stack: error.stack });
    }
});

// Endpoint para probar creación de voucher en Snabb - TEMPORAL
app.post('/debug/test-snabb', async (req, res) => {
    if (process.env.NODE_ENV !== 'production') {
        return res.status(403).json({ error: 'Solo disponible en producción' });
    }
    
    try {
        const snabbService = await import('./src/services/snabbService.js');
        
        // Verificar conexión
        const connectionStatus = await snabbService.checkConnection();
        
        if (connectionStatus.status === 'error') {
            return res.status(500).json({
                error: 'Error de configuración de Snabb',
                details: connectionStatus
            });
        }
        
        // Datos de prueba para crear un voucher
        const testVoucherData = {
            beneficiarioRun: req.body.beneficiarioRun || '12345678-9',
            codigoSucursal: '0',
            codigoPrestacion: req.body.codigoPrestacion || '0101001',
            callbackUrl: 'https://medical-sync-dashboard-1.onrender.com/api/snabb/callback',
            redirectUrl: 'https://ijaquep.github.io/medical-sync-dashboard',
            fechaExpiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días
            organizationRut: process.env.SNABB_ORGANIZATION_RUT,
            practitionerNombre: req.body.practitionerNombre || 'Dr. Test',
            practitionerRun: req.body.practitionerRun || '11111111-1'
        };
        
        // Intentar crear el voucher
        const voucher = await snabbService.createVoucher(testVoucherData);
        
        res.json({
            success: true,
            message: 'Voucher creado exitosamente en Snabb',
            connectionStatus,
            voucherData: testVoucherData,
            voucherResponse: voucher
        });
    } catch (error) {
        res.status(500).json({ 
            error: error.message, 
            stack: error.stack,
            response: error.response?.data || null
        });
    }
});

// Ruta raíz
app.get('/', (req, res) => {
    res.json({
        message: 'API Médica - Sistema de Gestión de Atenciones',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            users: '/api/users',
            atenciones: '/api/atenciones',
            sync: '/api/sync',
            reports: '/api/reports'
        },
        documentation: '/api/docs',
        health: '/health'
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/atenciones', atencionRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/reports', reportRoutes);

// Ruta 404 - debe estar antes del errorHandler
app.use(notFound);

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);

// ===========================================
// INICIALIZACIÓN DEL SERVIDOR
// ===========================================

async function startServer() {
    try {
        logger.logInfo('🚀 Iniciando servidor...');
        
        // 1. Asegurar que la base de datos existe
        logger.logInfo('📦 Verificando base de datos...');
        await ensureDatabase();
        
        // 2. Probar conexión a la base de datos
        await testConnection();
        
        // 3. Sincronizar modelos con la base de datos
        logger.logInfo('🔄 Sincronizando modelos con la base de datos...');
        if (process.env.NODE_ENV !== 'production') {
            await sequelize.sync({ alter: true });
            logger.logInfo('✅ Modelos sincronizados (desarrollo)');
        } else {
            // En producción: crear tablas si no existen (sin alter)
            await sequelize.sync({ alter: false });
            logger.logInfo('✅ Tablas verificadas/creadas (producción)');
        }
        
        // 4. Crear usuario admin inicial si no existe
        logger.logInfo('👤 Verificando usuario administrador...');
        await createInitialAdmin(models.User);
        
        // 5. Iniciar cron jobs para sincronización automática
        if (process.env.NODE_ENV !== 'test') {
            startCronJobs();
        } else {
            logger.logInfo('🧪 Modo test: cron jobs desactivados');
        }
        
        // 6. Iniciar servidor Express
        const PORT = config.port || 3000;
        const server = app.listen(PORT, () => {
            logger.logInfo('='.repeat(50));
            logger.logInfo('✅ SERVIDOR INICIADO CORRECTAMENTE');
            logger.logInfo('='.repeat(50));
            logger.logInfo(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
            logger.logInfo(`🚀 Servidor corriendo en puerto ${PORT}`);
            logger.logInfo(`📡 API disponible en: http://localhost:${PORT}/api`);
            logger.logInfo(`💚 Health check: http://localhost:${PORT}/health`);
            logger.logInfo(`📚 Base de datos: ${config.database.name}`);
            logger.logInfo('='.repeat(50));
        });
        
        // ===========================================
        // MANEJO DE CIERRE GRACEFUL
        // ===========================================
        
        const gracefulShutdown = async (signal) => {
            logger.logInfo('='.repeat(50));
            logger.logInfo(`⚠️  ${signal} recibido. Iniciando cierre graceful...`);
            logger.logInfo('='.repeat(50));
            
            // Detener cron jobs
            logger.logInfo('⏹️  Deteniendo cron jobs...');
            stopCronJobs();
            
            // Cerrar servidor Express
            server.close(async () => {
                logger.logInfo('🔌 Servidor Express cerrado');
                
                // Cerrar conexión a base de datos
                try {
                    await sequelize.close();
                    logger.logInfo('🔌 Conexión a base de datos cerrada');
                    logger.logInfo('✅ Cierre graceful completado');
                    process.exit(0);
                } catch (error) {
                    logger.logError('❌ Error al cerrar conexión a base de datos:', error);
                    process.exit(1);
                }
            });
            
            // Forzar cierre después de 10 segundos
            setTimeout(() => {
                logger.logError('⚠️  Forzando cierre después de timeout (10s)');
                process.exit(1);
            }, 10000);
        };
        
        // Escuchar señales de terminación
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
        
        // Manejo de errores no capturados
        process.on('unhandledRejection', (reason, promise) => {
            logger.logError('❌ Unhandled Rejection:', reason);
            logger.logError('Promise:', promise);
        });
        
        process.on('uncaughtException', (error) => {
            logger.logError('❌ Uncaught Exception:', error);
            logger.logError('Stack:', error.stack);
            // En producción, deberíamos cerrar el servidor
            if (process.env.NODE_ENV === 'production') {
                gracefulShutdown('UNCAUGHT_EXCEPTION');
            }
        });
        
    } catch (error) {
        logger.logError('='.repeat(50));
        logger.logError('❌ ERROR CRÍTICO AL INICIAR SERVIDOR');
        logger.logError('='.repeat(50));
        logger.logError('Error:', error.message);
        logger.logError('Stack:', error.stack);
        logger.logError('='.repeat(50));
        process.exit(1);
    }
}

// Iniciar servidor solo si no estamos en modo test
if (process.env.NODE_ENV !== 'test') {
    startServer();
}

// Exportar app para testing
export default app;