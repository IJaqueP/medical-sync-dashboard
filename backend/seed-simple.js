/* SCRIPT PARA POBLAR LA BASE DE DATOS CON DATOS DE PRUEBA */

import dotenv from 'dotenv';
import models from './src/models/index.js';
import { sequelize } from './src/config/database.js';

dotenv.config();

// Datos de ejemplo
const nombres = ['Juan', 'María', 'Pedro', 'Ana', 'Carlos', 'Sofía', 'Luis', 'Carmen', 'José', 'Laura'];
const apellidos = ['González', 'Rodríguez', 'García', 'Martínez', 'López', 'Pérez', 'Sánchez', 'Ramírez', 'Torres', 'Flores'];
const especialidades = ['Medicina General', 'Pediatría', 'Cardiología', 'Dermatología', 'Traumatología'];
const tiposAtencion = ['Consulta', 'Control', 'Urgencia', 'Procedimiento'];
const estados = ['Completada', 'Pendiente', 'Cancelada'];
const prevision = ['FONASA', 'ISAPRE', 'Particular'];

function randomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function randomRut() {
    const num = Math.floor(Math.random() * 20000000) + 5000000;
    return `${num}-${Math.floor(Math.random() * 10)}`;
}

function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function seedDatabase() {
    try {
        console.log('🔄 Conectando a la base de datos...');
        await sequelize.authenticate();
        console.log('✅ Conexión exitosa');

        console.log('🗑️  Limpiando datos existentes...');
        await models.Atencion.destroy({ where: {}, truncate: true });
        await models.SyncLog.destroy({ where: {}, truncate: true });
        console.log('✅ Datos limpiados');

        console.log('📝 Creando 50 atenciones...');
        const atenciones = [];
        for (let i = 0; i < 50; i++) {
            const fecha = randomDate(new Date(2024, 0, 1), new Date());
            const atencion = await models.Atencion.create({
                pacienteRut: randomRut(),
                pacienteNombre: `${randomItem(nombres)} ${randomItem(apellidos)}`,
                pacienteEmail: `paciente${i}@example.com`,
                pacienteTelefono: `+569${Math.floor(Math.random() * 90000000) + 10000000}`,
                fechaCita: fecha,
                horaCita: `${String(Math.floor(Math.random() * 12) + 8).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
                especialidad: randomItem(especialidades),
                profesional: `Dr. ${randomItem(nombres)} ${randomItem(apellidos)}`,
                tipoAtencion: randomItem(tiposAtencion),
                motivoConsulta: 'Control de rutina',
                diagnostico: 'Sin observaciones',
                tratamiento: 'Reposo y medicación',
                estadoCita: randomItem(estados),
                prevision: randomItem(prevision),
                montoPagado: Math.floor(Math.random() * 50000) + 10000,
                observaciones: `Atención número ${i + 1}`,
                origen: i % 3 === 0 ? 'reservo' : (i % 3 === 1 ? 'dtemite' : 'manual')
            });
            atenciones.push(atencion);
            
            if ((i + 1) % 10 === 0) {
                console.log(`   ✓ ${i + 1}/50 atenciones creadas`);
            }
        }
        console.log('✅ 50 atenciones creadas exitosamente');

        console.log('📝 Creando 30 registros de sincronización...');
        const syncLogs = [];
        for (let i = 0; i < 30; i++) {
            const fecha = randomDate(new Date(2024, 0, 1), new Date());
            const exitoso = Math.random() > 0.2; // 80% exitosos
            const apiName = randomItem(['reservo', 'snabb', 'dtemite']);
            
            const syncLog = await models.SyncLog.create({
                apiName: apiName,
                syncType: 'manual',
                status: exitoso ? 'success' : 'error',
                recordsProcessed: exitoso ? Math.floor(Math.random() * 20) + 5 : 0,
                recordsCreated: exitoso ? Math.floor(Math.random() * 10) : 0,
                recordsUpdated: exitoso ? Math.floor(Math.random() * 5) : 0,
                recordsFailed: exitoso ? 0 : Math.floor(Math.random() * 5) + 1,
                message: exitoso ? 'Sincronización completada exitosamente' : 'Error de conexión con la API',
                errorDetails: exitoso ? null : 'Timeout en la conexión',
                startedAt: fecha,
                completedAt: new Date(fecha.getTime() + (Math.floor(Math.random() * 120) + 30) * 1000)
            });
            syncLogs.push(syncLog);
            
            if ((i + 1) % 10 === 0) {
                console.log(`   ✓ ${i + 1}/30 logs creados`);
            }
        }
        console.log('✅ 30 registros de sincronización creados exitosamente');

        console.log('\n='.repeat(50));
        console.log('✅ BASE DE DATOS POBLADA EXITOSAMENTE');
        console.log('='.repeat(50));
        console.log(`📊 Total atenciones: ${atenciones.length}`);
        console.log(`📋 Total registros sync: ${syncLogs.length}`);
        console.log('='.repeat(50));

        await sequelize.close();
        process.exit(0);

    } catch (error) {
        console.error('❌ Error al poblar la base de datos:', error);
        await sequelize.close();
        process.exit(1);
    }
}

// Ejecutar
seedDatabase();
