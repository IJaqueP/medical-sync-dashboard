/* --- SERVICIO DE INTEGRACIÓN CON RESERVO --- */

import axios from 'axios';
import { config } from '../config/config.js';
import logger from '../utils/logger.js';
import { ApiError } from '../middleware/errorHandle.js';

/**
 * Cliente HTTP configurado para Reservo
 */
const reservoClient = axios.create({
    baseURL: config.reservo.apiUrl,
    timeout: config.reservo.timeout || 30000,
    headers: {
        'Authorization': `Bearer ${config.reservo.token}`,
        'Content-Type': 'application/json'
    }
});

/**
 * Obtener citas de Reservo por rango de fechas
 * NOTA: Endpoint temporal - verificar estructura real de la API
 */
export const getAppointments = async (startDate, endDate) => {
    try {
        logger.logInfo(`[Reservo] Obteniendo citas: ${startDate} - ${endDate}`);
        
        // TODO: Verificar endpoint correcto de Reservo API
        // El endpoint actual puede no ser el correcto
        const response = await reservoClient.get('/appointments', {
            params: {
                start_date: startDate,
                end_date: endDate
            }
        });
        
        logger.logInfo(`[Reservo] Citas obtenidas: ${response.data.length}`);
        
        return response.data;
        
    } catch (error) {
        logger.logError('[Reservo] Error al obtener citas:', error.message);
        
        // Retornar array vacío en lugar de lanzar error para no bloquear la sincronización
        logger.logInfo('[Reservo] Retornando array vacío - API no disponible temporalmente');
        return [];
    }
};

/**
 * Obtener detalle de una cita específica
 */
export const getAppointmentById = async (appointmentId) => {
    try {
        logger.logInfo(`Obteniendo detalle de cita Reservo: ${appointmentId}`);
        
        const response = await reservoClient.get(`/appointments/${appointmentId}`);
        
        return response.data;
        
    } catch (error) {
        logger.logError(`Error al obtener cita ${appointmentId} de Reservo:`, error);
        
        if (error.response?.status === 404) {
            throw new ApiError(404, 'Cita no encontrada en Reservo');
        }
        
        throw new ApiError(500, 'Error al obtener cita de Reservo');
    }
};

/**
 * Obtener citas por paciente (RUT)
 */
export const getAppointmentsByPatient = async (patientRut) => {
    try {
        logger.logInfo(`Obteniendo citas de paciente ${patientRut} en Reservo`);
        
        const response = await reservoClient.get('/appointments/patient', {
            params: { rut: patientRut }
        });
        
        return response.data;
        
    } catch (error) {
        logger.logError(`Error al obtener citas del paciente ${patientRut}:`, error);
        throw new ApiError(500, 'Error al consultar paciente en Reservo');
    }
};

/**
 * Transformar datos de Reservo a formato interno
 */
export const transformReservoData = (reservoAppointment) => {
    return {
        reservoId: reservoAppointment.id?.toString(),
        pacienteRut: reservoAppointment.patient?.rut,
        pacienteNombre: reservoAppointment.patient?.full_name,
        pacienteEmail: reservoAppointment.patient?.email,
        pacienteTelefono: reservoAppointment.patient?.phone,
        pacienteFechaNacimiento: reservoAppointment.patient?.birth_date,
        fechaCita: reservoAppointment.appointment_date,
        especialidad: reservoAppointment.specialty,
        profesional: reservoAppointment.professional?.name,
        tipoCita: reservoAppointment.type, // presencial, telemedicina
        estadoCita: reservoAppointment.status, // confirmada, cancelada, completada
        motivoConsulta: reservoAppointment.reason,
        origenDatos: 'reservo',
        datosRaw: reservoAppointment // Guardar datos originales
    };
};

/**
 * Sincronizar citas de Reservo
 */
export const syncAppointments = async (startDate, endDate) => {
    try {
        const appointments = await getAppointments(startDate, endDate);
        
        // Transformar cada cita al formato interno
        const transformedAppointments = appointments.map(apt => transformReservoData(apt));
        
        logger.logInfo(`${transformedAppointments.length} citas transformadas de Reservo`);
        
        return transformedAppointments;
        
    } catch (error) {
        logger.logError('Error en sincronización de Reservo:', error);
        throw error;
    }
};

/**
 * Verificar estado de conexión con Reservo
 */
export const checkConnection = async () => {
    try {
        const response = await reservoClient.get('/health');
        return { status: 'ok', message: 'Conexión con Reservo exitosa' };
    } catch (error) {
        logger.logError('Error de conexión con Reservo:', error);
        return { status: 'error', message: error.message };
    }
};

export default {
    getAppointments,
    getAppointmentById,
    getAppointmentsByPatient,
    transformReservoData,
    syncAppointments,
    checkConnection
};