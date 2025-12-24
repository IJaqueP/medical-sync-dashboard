/* --- CONTROLADOR DE ATENCIONES --- */

import { Atencion, User } from '../models/index.js';
import { ApiError } from '../middleware/errorHandle.js';
import { catchAsync } from '../middleware/errorHandle.js';
import { Op } from 'sequelize';
import logger from '../utils/logger.js';
import { chileanToISO } from '../utils/dateHelper.js';

/**
 * Obtener todas las atenciones con filtros
 * GET /api/atenciones
 */
export const getAllAtenciones = catchAsync(async (req, res) => {
    const { 
        page = 1, 
        limit = 10, 
        startDate, 
        endDate,
        estadoPago,
        estadoCita,
        pacienteRut,
        search
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    // Construir filtros
    const where = {};
    
    if (startDate) {
        const isoStartDate = chileanToISO(startDate);
        where.fechaCita = { [Op.gte]: new Date(isoStartDate) };
    }
    
    if (endDate) {
        const isoEndDate = chileanToISO(endDate);
        where.fechaCita = { 
            ...where.fechaCita,
            [Op.lte]: new Date(isoEndDate) 
        };
    }
    
    if (estadoPago) {
        where.estadoPago = estadoPago;
    }
    
    if (estadoCita) {
        where.estadoCita = estadoCita;
    }
    
    if (pacienteRut) {
        where.pacienteRut = pacienteRut;
    }
    
    if (search) {
        where[Op.or] = [
            { pacienteNombre: { [Op.iLike]: `%${search}%` } },
            { pacienteRut: { [Op.iLike]: `%${search}%` } },
            { pacienteEmail: { [Op.iLike]: `%${search}%` } }
        ];
    }
    
    const { count, rows: atenciones } = await Atencion.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
    });
    
    res.json({
        success: true,
        data: {
            atenciones,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(count / limit)
            }
        }
    });
});

/**
 * Obtener atención por ID
 * GET /api/atenciones/:id
 */
export const getAtencionById = catchAsync(async (req, res) => {
    const { id } = req.params;
    
    const atencion = await Atencion.findByPk(id, {
        include: [{
            model: User,
            as: 'modifier',
            attributes: ['id', 'username', 'fullName']
        }]
    });
    
    if (!atencion) {
        throw new ApiError(404, 'Atención no encontrada');
    }
    
    res.json({
        success: true,
        data: atencion
    });
});

/**
 * Obtener atenciones por RUT del paciente
 * GET /api/atenciones/paciente/:rut
 */
export const getAtencionesByRut = catchAsync(async (req, res) => {
    const { rut } = req.params;
    
    const atenciones = await Atencion.findByPacienteRut(rut);
    
    res.json({
        success: true,
        data: atenciones
    });
});

/**
 * Crear nueva atención manualmente
 * POST /api/atenciones
 */
export const createAtencion = catchAsync(async (req, res) => {
    const atencionData = {
        ...req.body,
        lastModifiedBy: req.user.id,
        origenDatos: 'manual'
    };
    
    // Validar campos obligatorios
    if (!atencionData.pacienteRut || !atencionData.pacienteNombre || !atencionData.fechaCita) {
        throw new ApiError(400, 'RUT, nombre y fecha de cita son obligatorios');
    }
    
    const atencion = await Atencion.create(atencionData);
    
    logger.logInfo(`Atención creada manualmente por ${req.user.username}: ${atencion.id}`);
    
    res.status(201).json({
        success: true,
        message: 'Atención creada exitosamente',
        data: atencion
    });
});

/**
 * Actualizar atención
 * PUT /api/atenciones/:id
 */
export const updateAtencion = catchAsync(async (req, res) => {
    const { id } = req.params;
    
    const atencion = await Atencion.findByPk(id);
    
    if (!atencion) {
        throw new ApiError(404, 'Atención no encontrada');
    }
    
    // Agregar usuario que modifica
    const updateData = {
        ...req.body,
        lastModifiedBy: req.user.id
    };
    
    await atencion.update(updateData);
    
    logger.logInfo(`Atención actualizada por ${req.user.username}: ${id}`);
    
    res.json({
        success: true,
        message: 'Atención actualizada exitosamente',
        data: atencion
    });
});

/**
 * Eliminar atención
 * DELETE /api/atenciones/:id
 */
export const deleteAtencion = catchAsync(async (req, res) => {
    const { id } = req.params;
    
    const atencion = await Atencion.findByPk(id);
    
    if (!atencion) {
        throw new ApiError(404, 'Atención no encontrada');
    }
    
    await atencion.destroy();
    
    logger.logInfo(`Atención eliminada por ${req.user.username}: ${id}`);
    
    res.json({
        success: true,
        message: 'Atención eliminada exitosamente'
    });
});

/**
 * Obtener atenciones pendientes de pago
 * GET /api/atenciones/pendientes/pago
 */
export const getPendientesPago = catchAsync(async (req, res) => {
    const atenciones = await Atencion.findPendientesPago();
    
    // Calcular total pendiente
    const totalPendiente = atenciones.reduce((sum, a) => {
        const total = parseFloat(a.facturaMontoTotal) || 0;
        const pagado = parseFloat(a.montoPagado) || 0;
        return sum + (total - pagado);
    }, 0);
    
    res.json({
        success: true,
        data: {
            atenciones,
            resumen: {
                cantidad: atenciones.length,
                totalPendiente
            }
        }
    });
});

/**
 * Obtener estadísticas de atenciones
 * GET /api/atenciones/estadisticas
 */
export const getEstadisticas = catchAsync(async (req, res) => {
    const { startDate, endDate } = req.query;
    
    const where = {};
    
    if (startDate && endDate) {
        where.fechaCita = {
            [Op.between]: [
                new Date(chileanToISO(startDate)),
                new Date(chileanToISO(endDate))
            ]
        };
    }
    
    const atenciones = await Atencion.findAll({ where });
    
    // Calcular estadísticas
    const stats = {
        total: atenciones.length,
        porEstadoCita: {},
        porEstadoPago: {},
        porPrevision: {},
        totales: {
            facturado: 0,
            pagado: 0,
            pendiente: 0
        }
    };
    
    atenciones.forEach(a => {
        // Por estado de cita
        const estadoCita = a.estadoCita || 'Sin estado';
        stats.porEstadoCita[estadoCita] = (stats.porEstadoCita[estadoCita] || 0) + 1;
        
        // Por estado de pago
        const estadoPago = a.estadoPago || 'Sin estado';
        stats.porEstadoPago[estadoPago] = (stats.porEstadoPago[estadoPago] || 0) + 1;
        
        // Por previsión
        const prevision = a.prevision || 'Sin información';
        stats.porPrevision[prevision] = (stats.porPrevision[prevision] || 0) + 1;
        
        // Totales
        stats.totales.facturado += parseFloat(a.facturaMontoTotal) || 0;
        stats.totales.pagado += parseFloat(a.montoPagado) || 0;
    });
    
    stats.totales.pendiente = stats.totales.facturado - stats.totales.pagado;
    
    res.json({
        success: true,
        data: stats
    });
});

export default {
    getAllAtenciones,
    getAtencionById,
    getAtencionesByRut,
    createAtencion,
    updateAtencion,
    deleteAtencion,
    getPendientesPago,
    getEstadisticas
};