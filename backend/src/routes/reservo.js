/* --- RUTA PARA WEBHOOKS DE RESERVO --- */

import express from 'express';
import logger from '../utils/logger.js';
import { Atencion } from '../models/index.js';

const router = express.Router();

/**
 * POST /api/reservo/webhook
 * Recibe notificaciones de citas desde Reservo
 */
router.post('/webhook', async (req, res) => {
    try {
        const appointmentData = req.body;
        
        logger.logInfo(`[Reservo Webhook] Recibida cita: ${appointmentData.id} - Estado: ${appointmentData.status}`);
        
        // Buscar si ya existe la cita en la BD
        const existingAtencion = await Atencion.findOne({
            where: { reservoId: appointmentData.id?.toString() }
        });
        
        // Transformar datos de Reservo a formato interno
        const atencionData = {
            reservoId: appointmentData.id?.toString(),
            pacienteRut: appointmentData.patient?.rut || appointmentData.patient?.document_number,
            pacienteNombre: appointmentData.patient?.full_name || appointmentData.patient?.name,
            pacienteEmail: appointmentData.patient?.email,
            pacienteTelefono: appointmentData.patient?.phone,
            pacienteFechaNacimiento: appointmentData.patient?.birth_date,
            fechaCita: appointmentData.appointment_date || appointmentData.date,
            fechaAtencion: appointmentData.appointment_date || appointmentData.date,
            especialidad: appointmentData.specialty,
            profesional: appointmentData.professional?.name || appointmentData.doctor?.name,
            tipoCita: appointmentData.type,
            estadoCita: appointmentData.status,
            motivoConsulta: appointmentData.reason || appointmentData.consultation_reason,
            sistema: 'Reservo',
            estadoSincronizacion: 'sincronizado'
        };
        
        if (existingAtencion) {
            // Actualizar atencion existente
            await existingAtencion.update(atencionData);
            logger.logInfo(`[Reservo Webhook] Atencion actualizada: ${existingAtencion.id}`);
        } else {
            // Crear nueva atencion
            const newAtencion = await Atencion.create(atencionData);
            logger.logInfo(`[Reservo Webhook] Nueva atencion creada: ${newAtencion.id}`);
        }
        
        // Responder con 200 OK
        res.status(200).json({
            success: true,
            message: 'Webhook procesado correctamente'
        });
        
    } catch (error) {
        logger.logError('[Reservo Webhook] Error procesando webhook:', error);
        
        res.status(200).json({
            success: false,
            message: 'Error procesando webhook',
            error: error.message
        });
    }
});

/**
 * POST /api/reservo/sync-now
 * Sincronizar manualmente las citas de Reservo de los últimos 30 días
 */
router.post('/sync-now', async (req, res) => {
    try {
        logger.logInfo('[Reservo] Iniciando sincronización manual');
        
        const reservoService = await import('../services/reservoService.js');
        
        // Obtener citas de los últimos 30 días
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        const appointments = await reservoService.getAppointments(startDate, endDate);
        
        let created = 0;
        let updated = 0;
        let errors = 0;
        
        for (const appointment of appointments) {
            try {
                const existingAtencion = await Atencion.findOne({
                    where: { reservoId: appointment.id?.toString() }
                });
                
                const atencionData = {
                    reservoId: appointment.id?.toString(),
                    pacienteRut: appointment.patient?.rut || appointment.patient?.document_number,
                    pacienteNombre: appointment.patient?.full_name || appointment.patient?.name,
                    pacienteEmail: appointment.patient?.email,
                    pacienteTelefono: appointment.patient?.phone,
                    pacienteFechaNacimiento: appointment.patient?.birth_date,
                    fechaCita: appointment.appointment_date || appointment.date,
                    fechaAtencion: appointment.appointment_date || appointment.date,
                    especialidad: appointment.specialty,
                    profesional: appointment.professional?.name || appointment.doctor?.name,
                    tipoCita: appointment.type,
                    estadoCita: appointment.status,
                    motivoConsulta: appointment.reason || appointment.consultation_reason,
                    sistema: 'Reservo',
                    estadoSincronizacion: 'sincronizado'
                };
                
                if (existingAtencion) {
                    await existingAtencion.update(atencionData);
                    updated++;
                } else {
                    await Atencion.create(atencionData);
                    created++;
                }
            } catch (error) {
                logger.logError(`[Reservo] Error procesando cita ${appointment.id}:`, error);
                errors++;
            }
        }
        
        logger.logInfo(`[Reservo] Sincronización completada: ${created} creadas, ${updated} actualizadas, ${errors} errores`);
        
        res.json({
            success: true,
            message: 'Sincronización de Reservo completada',
            stats: {
                total: appointments.length,
                created,
                updated,
                errors
            }
        });
        
    } catch (error) {
        logger.logError('[Reservo] Error en sincronización:', error);
        res.status(500).json({
            error: error.message
        });
    }
});

/**
 * GET /api/reservo/test-webhook
 * Endpoint de prueba
 */
router.get('/test-webhook', (req, res) => {
    res.json({
        message: 'Endpoint de webhook de Reservo activo',
        expectedUrl: 'POST /api/reservo/webhook',
        syncUrl: 'POST /api/reservo/sync-now',
        expectedFormat: {
            id: 123456,
            patient: {
                rut: '12345678-9',
                full_name: 'Nombre Paciente',
                email: 'paciente@email.com',
                phone: '+56912345678'
            },
            appointment_date: '2025-12-24T10:00:00Z',
            specialty: 'Medicina General',
            professional: {
                name: 'Dr. Juan Pérez'
            },
            type: 'presencial',
            status: 'confirmada',
            reason: 'Control rutinario'
        }
    });
});

export default router;
