/* --- RUTA PARA CALLBACKS DE SNABB --- */

import express from 'express';
import logger from '../utils/logger.js';
import { Atencion } from '../models/index.js';
import { transformVoucherToAtencion } from '../services/snabbService.js';

const router = express.Router();

/**
 * POST /api/snabb/callback
 * Recibe actualizaciones de estado de vouchers desde Snabb
 */
router.post('/callback', async (req, res) => {
    try {
        const voucherData = req.body;
        
        logger.logInfo(`[Snabb Callback] Recibido voucher: ${voucherData.id} - Estado: ${voucherData.status}`);
        
        // Buscar si ya existe el voucher en la BD
        const existingAtencion = await Atencion.findOne({
            where: { snabbId: voucherData.id }
        });
        
        // Transformar datos de Snabb a formato interno
        const atencionData = {
            snabbId: voucherData.id,
            folio: voucherData.folio,
            pacienteRut: voucherData.beneficiario?.run,
            pacienteNombre: voucherData.beneficiario?.nombre || 'N/A',
            prevision: 'Fonasa',
            planSalud: voucherData.beneficiario?.tramo,
            bonoNumero: voucherData.folio || voucherData.id,
            bonoEstado: voucherData.status,
            bonoMonto: parseFloat(voucherData.amount?.montoTotal || 0),
            bonoFechaEmision: voucherData.fechaEmision || voucherData.createdAt,
            copago: parseFloat(voucherData.amount?.montoCopago || 0),
            montoBonificado: parseFloat(voucherData.amount?.montoBonificado || 0),
            prestacion: voucherData.prestaciones?.[0]?.descripcion || voucherData.prestaciones?.[0]?.codigo || 'N/A',
            codigoPrestacion: voucherData.prestaciones?.[0]?.codigo,
            fechaAtencion: voucherData.fechaHoraAtencion || voucherData.createdAt,
            fechaExpiracion: voucherData.fechaExpiracion,
            voucherHash: voucherData.paymentInfo?.authorizationCode,
            voucherUrl: voucherData.voucherUrl,
            sistema: 'Snabb',
            estadoSincronizacion: 'sincronizado'
        };
        
        if (existingAtencion) {
            // Actualizar atencion existente
            await existingAtencion.update(atencionData);
            logger.logInfo(`[Snabb Callback] Atencion actualizada: ${existingAtencion.id}`);
        } else {
            // Crear nueva atencion
            const newAtencion = await Atencion.create(atencionData);
            logger.logInfo(`[Snabb Callback] Nueva atencion creada: ${newAtencion.id}`);
        }
        
        // Responder con 200 OK para confirmar recepción
        res.status(200).json({
            success: true,
            message: 'Callback procesado correctamente'
        });
        
    } catch (error) {
        logger.logError('[Snabb Callback] Error procesando callback:', error);
        
        // Aún así responder 200 para que Snabb no reintente
        res.status(200).json({
            success: false,
            message: 'Error procesando callback',
            error: error.message
        });
    }
});

/**
 * GET /api/snabb/test-callback
 * Endpoint de prueba para simular un callback
 */
router.get('/test-callback', (req, res) => {
    res.json({
        message: 'Endpoint de callback de Snabb activo',
        expectedUrl: 'POST /api/snabb/callback',
        expectedFormat: {
            id: 'voucher_id',
            folio: 'voucher_folio',
            status: 'Payed',
            beneficiario: { run: '12345678-9', nombre: 'Nombre Paciente' },
            amount: {
                montoTotal: 45870,
                montoCopago: 28670,
                montoBonificado: 17200
            },
            prestaciones: [
                { codigo: '0101212', descripcion: 'Consulta médica' }
            ],
            createdAt: new Date().toISOString()
        }
    });
});

export default router;
