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

/**
 * POST /api/snabb/import-voucher
 * Importar un voucher específico por ID
 */
router.post('/import-voucher', async (req, res) => {
    try {
        const { voucherId } = req.body;
        
        if (!voucherId) {
            return res.status(400).json({
                error: 'Se requiere voucherId'
            });
        }
        
        logger.logInfo(`[Snabb] Importando voucher: ${voucherId}`);
        
        // Importar el servicio de Snabb
        const snabbService = await import('../services/snabbService.js');
        
        // Obtener el voucher de Snabb
        const voucherData = await snabbService.getVoucherById(voucherId);
        
        // Buscar si ya existe
        const existingAtencion = await Atencion.findOne({
            where: { snabbId: voucherData.id }
        });
        
        // Transformar y guardar
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
        
        let atencion;
        if (existingAtencion) {
            await existingAtencion.update(atencionData);
            atencion = existingAtencion;
        } else {
            atencion = await Atencion.create(atencionData);
        }
        
        res.json({
            success: true,
            message: 'Voucher importado correctamente',
            atencion
        });
        
    } catch (error) {
        logger.logError('[Snabb] Error importando voucher:', error);
        res.status(500).json({
            error: error.message,
            details: error.response?.data || null
        });
    }
});

/**
 * POST /api/snabb/import-batch
 * Importar múltiples vouchers por IDs
 */
router.post('/import-batch', async (req, res) => {
    try {
        const { voucherIds } = req.body;
        
        if (!Array.isArray(voucherIds) || voucherIds.length === 0) {
            return res.status(400).json({
                error: 'Se requiere un array de voucherIds'
            });
        }
        
        logger.logInfo(`[Snabb] Importando ${voucherIds.length} vouchers`);
        
        const snabbService = await import('../services/snabbService.js');
        const results = {
            success: [],
            errors: []
        };
        
        for (const voucherId of voucherIds) {
            try {
                const voucherData = await snabbService.getVoucherById(voucherId);
                
                const existingAtencion = await Atencion.findOne({
                    where: { snabbId: voucherData.id }
                });
                
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
                    await existingAtencion.update(atencionData);
                } else {
                    await Atencion.create(atencionData);
                }
                
                results.success.push(voucherId);
                
            } catch (error) {
                logger.logError(`[Snabb] Error importando voucher ${voucherId}:`, error);
                results.errors.push({
                    voucherId,
                    error: error.message
                });
            }
        }
        
        res.json({
            success: true,
            message: `Importación completada: ${results.success.length} exitosos, ${results.errors.length} errores`,
            results
        });
        
    } catch (error) {
        logger.logError('[Snabb] Error en importación batch:', error);
        res.status(500).json({
            error: error.message
        });
    }
});

/**
 * POST /api/snabb/simulate-callback
 * Simular callback de Snabb con datos de prueba
 * Útil para poblar la base de datos con vouchers de ejemplo
 */
router.post('/simulate-callback', async (req, res) => {
    try {
        logger.logInfo('[Snabb] Simulando callback con datos de prueba');
        
        // Datos de ejemplo basados en los vouchers reales que mostraste
        const testVouchers = [
            {
                id: '1231eb0e9f292ec5c71402583eaa5db1f20345846b88d3a6eed8b2e0a77fc58e',
                folio: '432103997',
                status: 'Payed',
                beneficiario: {
                    run: '20032385-8',
                    nombre: 'Carolina Jiménez Chureo'
                },
                amount: {
                    montoTotal: 45870,
                    montoCopago: 28670,
                    montoBonificado: 17200
                },
                prestaciones: [{
                    codigo: '0101212',
                    descripcion: 'CONSULTA MEDICA DE ESPECIALIDAD EN PSIQUIATRIA ADULTOS (1RA'
                }],
                createdAt: '2025-12-23T20:39:50Z',
                fechaEmision: '2025-12-23T20:39:50Z'
            },
            {
                id: 'voucher-' + Date.now() + '-1',
                folio: null,
                status: 'Requested',
                beneficiario: {
                    run: '20501567-1',
                    nombre: 'María Fernanda Azócar Navarrete'
                },
                amount: {
                    montoTotal: 0,
                    montoCopago: 0,
                    montoBonificado: 0
                },
                prestaciones: [{
                    codigo: '0101212',
                    descripcion: 'Consulta médica'
                }],
                createdAt: '2025-12-23T20:51:36Z',
                fechaEmision: '2025-12-23T20:51:36Z'
            },
            {
                id: 'voucher-' + Date.now() + '-2',
                folio: null,
                status: 'Requested',
                beneficiario: {
                    run: '13510278-4',
                    nombre: 'Lisette García Mesina'
                },
                amount: {
                    montoTotal: 0,
                    montoCopago: 0,
                    montoBonificado: 0
                },
                prestaciones: [{
                    codigo: '0101212',
                    descripcion: 'Consulta médica'
                }],
                createdAt: '2025-12-23T20:53:09Z',
                fechaEmision: '2025-12-23T20:53:09Z'
            }
        ];
        
        let created = 0;
        let updated = 0;
        
        for (const voucher of testVouchers) {
            const existingAtencion = await Atencion.findOne({
                where: { snabbId: voucher.id }
            });
            
            const atencionData = {
                snabbId: voucher.id,
                folio: voucher.folio,
                pacienteRut: voucher.beneficiario?.run,
                pacienteNombre: voucher.beneficiario?.nombre || 'N/A',
                prevision: 'Fonasa',
                bonoNumero: voucher.folio || voucher.id,
                bonoEstado: voucher.status,
                bonoMonto: parseFloat(voucher.amount?.montoTotal || 0),
                bonoFechaEmision: voucher.fechaEmision || voucher.createdAt,
                copago: parseFloat(voucher.amount?.montoCopago || 0),
                montoBonificado: parseFloat(voucher.amount?.montoBonificado || 0),
                prestacion: voucher.prestaciones?.[0]?.descripcion || voucher.prestaciones?.[0]?.codigo || 'N/A',
                codigoPrestacion: voucher.prestaciones?.[0]?.codigo,
                fechaAtencion: voucher.createdAt,
                voucherHash: voucher.paymentInfo?.authorizationCode,
                sistema: 'Snabb',
                estadoSincronizacion: 'sincronizado'
            };
            
            if (existingAtencion) {
                await existingAtencion.update(atencionData);
                updated++;
            } else {
                await Atencion.create(atencionData);
                created++;
            }
        }
        
        res.json({
            success: true,
            message: `Callbacks simulados: ${created} creados, ${updated} actualizados`,
            total: testVouchers.length
        });
        
    } catch (error) {
        logger.logError('[Snabb] Error simulando callbacks:', error);
        res.status(500).json({
            error: error.message
        });
    }
});

export default router;
