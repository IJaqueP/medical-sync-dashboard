/* --- GENERADOR DE REPORTES EXCEL --- */

import ExcelJS from 'exceljs';
import { formatToChileanDate, formatToChileanDateTime } from './dateHelper.js';
import logger from './logger.js';

/**
 * Generar Excel de reporte de atenciones
 */
export const generateAtencionesReport = async (atenciones, filters = {}) => {
    try {
        const workbook = new ExcelJS.Workbook();
        
        // Metadata del workbook
        workbook.creator = 'Sistema Médico Carmona';
        workbook.created = new Date();
        
        // Hoja principal: Atenciones
        const sheet = workbook.addWorksheet('Atenciones');
        
        // Configurar columnas
        sheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Fecha Cita', key: 'fechaCita', width: 15 },
            { header: 'RUT Paciente', key: 'pacienteRut', width: 15 },
            { header: 'Nombre Paciente', key: 'pacienteNombre', width: 30 },
            { header: 'Email', key: 'pacienteEmail', width: 25 },
            { header: 'Teléfono', key: 'pacienteTelefono', width: 15 },
            { header: 'Especialidad', key: 'especialidad', width: 20 },
            { header: 'Profesional', key: 'profesional', width: 25 },
            { header: 'Tipo Cita', key: 'tipoCita', width: 15 },
            { header: 'Estado Cita', key: 'estadoCita', width: 15 },
            { header: 'Previsión', key: 'prevision', width: 15 },
            { header: 'Plan Salud', key: 'planSalud', width: 10 },
            { header: 'N° Bono', key: 'bonoNumero', width: 15 },
            { header: 'Monto Bono', key: 'bonoMonto', width: 12 },
            { header: 'Copago', key: 'copago', width: 12 },
            { header: 'N° Factura', key: 'facturaNumero', width: 15 },
            { header: 'Tipo Factura', key: 'facturaTipo', width: 12 },
            { header: 'Monto Neto', key: 'facturaMontoNeto', width: 12 },
            { header: 'IVA', key: 'facturaMontoIva', width: 12 },
            { header: 'Total Factura', key: 'facturaMontoTotal', width: 15 },
            { header: 'Método Pago', key: 'metodoPago', width: 15 },
            { header: 'Estado Pago', key: 'estadoPago', width: 15 },
            { header: 'Monto Pagado', key: 'montoPagado', width: 15 },
            { header: 'Fecha Pago', key: 'fechaPago', width: 15 },
            { header: 'Origen Datos', key: 'origenDatos', width: 15 },
            { header: 'Observaciones', key: 'observaciones', width: 30 }
        ];
        
        // Estilo del encabezado
        sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        sheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF0070C0' }
        };
        sheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
        sheet.getRow(1).height = 25;
        
        // Agregar datos
        atenciones.forEach(atencion => {
            sheet.addRow({
                id: atencion.id,
                fechaCita: atencion.fechaCita ? formatToChileanDate(atencion.fechaCita) : '',
                pacienteRut: atencion.pacienteRut,
                pacienteNombre: atencion.pacienteNombre,
                pacienteEmail: atencion.pacienteEmail || '',
                pacienteTelefono: atencion.pacienteTelefono || '',
                especialidad: atencion.especialidad || '',
                profesional: atencion.profesional || '',
                tipoCita: atencion.tipoCita || '',
                estadoCita: atencion.estadoCita || '',
                prevision: atencion.prevision || '',
                planSalud: atencion.planSalud || '',
                bonoNumero: atencion.bonoNumero || '',
                bonoMonto: atencion.bonoMonto || 0,
                copago: atencion.copago || 0,
                facturaNumero: atencion.facturaNumero || '',
                facturaTipo: atencion.facturaTipo || '',
                facturaMontoNeto: atencion.facturaMontoNeto || 0,
                facturaMontoIva: atencion.facturaMontoIva || 0,
                facturaMontoTotal: atencion.facturaMontoTotal || 0,
                metodoPago: atencion.metodoPago || '',
                estadoPago: atencion.estadoPago || '',
                montoPagado: atencion.montoPagado || 0,
                fechaPago: atencion.fechaPago ? formatToChileanDate(atencion.fechaPago) : '',
                origenDatos: atencion.origenDatos || '',
                observaciones: atencion.observaciones || ''
            });
        });
        
        // Formato de números con separador de miles
        const moneyColumns = ['bonoMonto', 'copago', 'facturaMontoNeto', 'facturaMontoIva', 'facturaMontoTotal', 'montoPagado'];
        moneyColumns.forEach(col => {
            const column = sheet.getColumn(col);
            column.numFmt = '"$"#,##0';
        });
        
        // Alternar colores de filas
        sheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1 && rowNumber % 2 === 0) {
                row.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFF0F0F0' }
                };
            }
        });
        
        // Freeze primera fila
        sheet.views = [{ state: 'frozen', ySplit: 1 }];
        
        // Hoja de resumen
        const summarySheet = workbook.addWorksheet('Resumen');
        
        summarySheet.columns = [
            { header: 'Métrica', key: 'metric', width: 30 },
            { header: 'Valor', key: 'value', width: 20 }
        ];
        
        // Estilo encabezado resumen
        summarySheet.getRow(1).font = { bold: true };
        summarySheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF00B050' }
        };
        
        // Calcular métricas
        const totalAtenciones = atenciones.length;
        const totalFacturado = atenciones.reduce((sum, a) => sum + (parseFloat(a.facturaMontoTotal) || 0), 0);
        const totalPagado = atenciones.reduce((sum, a) => sum + (parseFloat(a.montoPagado) || 0), 0);
        const totalPendiente = totalFacturado - totalPagado;
        
        const atencionesPorEstado = atenciones.reduce((acc, a) => {
            const estado = a.estadoPago || 'Sin información';
            acc[estado] = (acc[estado] || 0) + 1;
            return acc;
        }, {});
        
        // Agregar datos de resumen
        summarySheet.addRow({ metric: 'Total de Atenciones', value: totalAtenciones });
        summarySheet.addRow({ metric: 'Total Facturado', value: totalFacturado });
        summarySheet.addRow({ metric: 'Total Pagado', value: totalPagado });
        summarySheet.addRow({ metric: 'Saldo Pendiente', value: totalPendiente });
        summarySheet.addRow({ metric: '', value: '' }); // Línea vacía
        
        summarySheet.addRow({ metric: 'Atenciones por Estado de Pago', value: '' }).font = { bold: true };
        Object.entries(atencionesPorEstado).forEach(([estado, cantidad]) => {
            summarySheet.addRow({ metric: `  ${estado}`, value: cantidad });
        });
        
        summarySheet.addRow({ metric: '', value: '' }); // Línea vacía
        summarySheet.addRow({ metric: 'Generado', value: formatToChileanDateTime(new Date()) });
        
        // Formato de moneda en resumen
        summarySheet.getColumn('value').numFmt = '"$"#,##0';
        
        // Generar buffer
        const buffer = await workbook.xlsx.writeBuffer();
        
        logger.logInfo(`Excel generado con ${atenciones.length} atenciones`);
        
        return buffer;
        
    } catch (error) {
        logger.logError('Error al generar Excel:', error);
        throw error;
    }
};

/**
 * Generar Excel de reporte de sincronización
 */
export const generateSyncReport = async (syncLogs) => {
    try {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Historial de Sincronización');
        
        sheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'API', key: 'apiName', width: 15 },
            { header: 'Tipo', key: 'syncType', width: 15 },
            { header: 'Estado', key: 'status', width: 15 },
            { header: 'Fecha Inicio', key: 'startTime', width: 20 },
            { header: 'Fecha Fin', key: 'endTime', width: 20 },
            { header: 'Duración (ms)', key: 'duration', width: 15 },
            { header: 'Procesados', key: 'recordsProcessed', width: 12 },
            { header: 'Creados', key: 'recordsCreated', width: 12 },
            { header: 'Actualizados', key: 'recordsUpdated', width: 15 },
            { header: 'Errores', key: 'recordsError', width: 12 },
            { header: 'Mensaje Error', key: 'errorMessage', width: 40 }
        ];
        
        // Estilo encabezado
        sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        sheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF0070C0' }
        };
        
        // Agregar datos
        syncLogs.forEach(log => {
            sheet.addRow({
                id: log.id,
                apiName: log.apiName,
                syncType: log.syncType,
                status: log.status,
                startTime: formatToChileanDateTime(log.startTime),
                endTime: log.endTime ? formatToChileanDateTime(log.endTime) : '',
                duration: log.duration,
                recordsProcessed: log.recordsProcessed,
                recordsCreated: log.recordsCreated,
                recordsUpdated: log.recordsUpdated,
                recordsError: log.recordsError,
                errorMessage: log.errorMessage || ''
            });
        });
        
        sheet.views = [{ state: 'frozen', ySplit: 1 }];
        
        const buffer = await workbook.xlsx.writeBuffer();
        
        logger.logInfo(`Excel de sincronización generado con ${syncLogs.length} registros`);
        
        return buffer;
        
    } catch (error) {
        logger.logError('Error al generar Excel de sincronización:', error);
        throw error;
    }
};

export default {
    generateAtencionesReport,
    generateSyncReport
};