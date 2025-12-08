/* Script para probar la API de sync logs */

import 'dotenv/config';
import { sequelize } from './src/config/database.js';
import { SyncLog, User } from './src/models/index.js';

async function testSyncLogsQuery() {
    try {
        // Conectar a producción
        process.env.DATABASE_URL = 'postgresql://servicio_medico_db_user:HUd9GuwMv4TmakREK7gesSVoI2lV5xF7@dpg-d4qu1amuk2gs73ftt4ig-a.virginia-postgres.render.com/servicio_medico_db';
        process.env.NODE_ENV = 'production';
        
        await sequelize.authenticate();
        console.log('✅ Conectado a producción\n');
        
        // Prueba 1: Query sin include (debería funcionar)
        console.log('📝 Test 1: Query sin include de User...');
        const logsSimple = await SyncLog.findAll({
            limit: 5,
            order: [['startTime', 'DESC']]
        });
        console.log(`✅ Encontrados: ${logsSimple.length} logs`);
        console.log('Primer log:', logsSimple[0]?.dataValues);
        
        // Prueba 2: Query con include INNER JOIN (fallará si no hay user_id)
        console.log('\n📝 Test 2: Query con include INNER JOIN...');
        try {
            const logsInner = await SyncLog.findAll({
                limit: 5,
                order: [['startTime', 'DESC']],
                include: [{
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username', 'fullName'],
                    required: true // INNER JOIN - falla si no hay user
                }]
            });
            console.log(`✅ Encontrados: ${logsInner.length} logs`);
        } catch (error) {
            console.log('❌ ERROR (esperado):', error.message);
        }
        
        // Prueba 3: Query con include LEFT JOIN (debería funcionar)
        console.log('\n📝 Test 3: Query con include LEFT JOIN (required: false)...');
        const logsLeft = await SyncLog.findAll({
            limit: 5,
            order: [['startTime', 'DESC']],
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'username', 'fullName'],
                required: false // LEFT JOIN - permite nulls
            }]
        });
        console.log(`✅ Encontrados: ${logsLeft.length} logs`);
        console.log('Primer log con user:', logsLeft[0]?.dataValues);
        
        console.log('\n' + '='.repeat(50));
        console.log('✅ TODAS LAS PRUEBAS COMPLETADAS');
        console.log('='.repeat(50));
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

testSyncLogsQuery();
