/* --- GENERADOR DE REPORTES PDF --- */

import PDFDocument from 'pdfkit';
import { formatToChileanDate, formatToChileanDateTime } from './dateHelper.js';
import logger from './logger.js';

/**
 * Generar PDF de reporte de atenciones
 */
export const generateAtencionesReport = async (atenciones, filters = {}) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'A4',
                margins: { top: 50, bottom: 50, left: 50, right: 50 }
            });
            
            const chunks = [];
            
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            
            // Encabezado
            doc.fontSize(18)
                .font('Helvetica-Bold')
                .text('REPORTE DE ATENCIONES', { align: 'center' })
                .moveDown();
            
            doc.fontSize(10)
                .font('Helvetica')
                .text(`Generado: ${formatToChileanDateTime(new Date())}`, { align: 'center' })
                .moveDown();
            
            // Filtros aplicados
            if (Object.keys(filters).length > 0) {
                doc.fontSize(12)
                    .font('Helvetica-Bold')
                    .text('Filtros aplicados:')
                    .font('Helvetica')
                    .fontSize(10);
                
                if (filters.startDate) {
                    doc.text(`Desde: ${filters.startDate}`);
                }
                if (filters.endDate) {
                    doc.text(`Hasta: ${filters.endDate}`);
                }
                if (filters.estadoPago) {
                    doc.text(`Estado de pago: ${filters.estadoPago}`);
                }
                
                doc.moveDown();
            }
            
            // Línea separadora
            doc.moveTo(50, doc.y)
                .lineTo(545, doc.y)
                .stroke()
                .moveDown();
            
            // Resumen
            doc.fontSize(12)
                .font('Helvetica-Bold')
                .text('RESUMEN')
                .font('Helvetica')
                .fontSize(10);
            
            doc.text(`Total de atenciones: ${atenciones.length}`)
                .moveDown();
            
            // Calcular totales
            const totalFacturado = atenciones.reduce((sum, a) => sum + (parseFloat(a.facturaMontoTotal) || 0), 0);
            const totalPagado = atenciones.reduce((sum, a) => sum + (parseFloat(a.montoPagado) || 0), 0);
            const totalPendiente = totalFacturado - totalPagado;
            
            doc.text(`Total facturado: $${totalFacturado.toLocaleString('es-CL')}`)
                .text(`Total pagado: $${totalPagado.toLocaleString('es-CL')}`)
                .text(`Saldo pendiente: $${totalPendiente.toLocaleString('es-CL')}`)
                .moveDown(2);
            
            // Detalle de atenciones
            doc.fontSize(12)
                .font('Helvetica-Bold')
                .text('DETALLE DE ATENCIONES')
                .moveDown();
            
            atenciones.forEach((atencion, index) => {
                // Verificar si necesitamos nueva página
                if (doc.y > 700) {
                    doc.addPage();
                }
                
                doc.fontSize(10)
                    .font('Helvetica-Bold')
                    .text(`${index + 1}. ${atencion.pacienteNombre}`)
                    .font('Helvetica');
                
                const fecha = new Date(atencion.fechaCita);
                const fechaStr = `${fecha.getDate().toString().padStart(2, '0')}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}-${fecha.getFullYear()}`;
                
                doc.text(`RUT: ${atencion.pacienteRut}`, { continued: true })
                    .text(`    Fecha: ${fechaStr}`);
                
                if (atencion.especialidad) {
                    doc.text(`Especialidad: ${atencion.especialidad}`, { continued: true });
                    if (atencion.profesional) {
                        doc.text(`    Profesional: ${atencion.profesional}`);
                    } else {
                        doc.text('');
                    }
                }
                
                if (atencion.prevision) {
                    doc.text(`Previsión: ${atencion.prevision}`, { continued: true });
                    if (atencion.planSalud) {
                        doc.text(`    Plan: ${atencion.planSalud}`);
                    } else {
                        doc.text('');
                    }
                }
                
                if (atencion.bonoNumero) {
                    doc.text(`Bono: ${atencion.bonoNumero}    Monto: $${parseFloat(atencion.bonoMonto || 0).toLocaleString('es-CL')}`);
                }
                
                if (atencion.facturaNumero) {
                    doc.text(`Factura: ${atencion.facturaNumero}    Total: $${parseFloat(atencion.facturaMontoTotal || 0).toLocaleString('es-CL')}`);
                }
                
                doc.text(`Estado de pago: ${atencion.estadoPago || 'N/A'}`, { continued: true })
                    .text(`    Pagado: $${parseFloat(atencion.montoPagado || 0).toLocaleString('es-CL')}`);
                
                doc.moveDown(0.5);
                
                // Línea separadora entre atenciones
                doc.moveTo(50, doc.y)
                    .lineTo(545, doc.y)
                    .strokeOpacity(0.3)
                    .stroke()
                    .strokeOpacity(1)
                    .moveDown(0.5);
            });
            
            // Pie de página
            const pageCount = doc.bufferedPageRange().count;
            for (let i = 0; i < pageCount; i++) {
                doc.switchToPage(i);
                doc.fontSize(8)
                    .text(
                        `Página ${i + 1} de ${pageCount}`,
                        50,
                        doc.page.height - 50,
                        { align: 'center' }
                    );
            }
            
            doc.end();
            
            logger.logInfo(`PDF generado con ${atenciones.length} atenciones`);
            
        } catch (error) {
            logger.logError('Error al generar PDF:', error);
            reject(error);
        }
    });
};

/**
 * Generar PDF de reporte individual de paciente
 */
export const generatePatientReport = async (atencion) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: 'A4', margins: { top: 50, bottom: 50, left: 50, right: 50 } });
            
            const chunks = [];
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            
            // Encabezado
            doc.fontSize(20)
                .font('Helvetica-Bold')
                .text('COMPROBANTE DE ATENCIÓN', { align: 'center' })
                .moveDown(2);
            
            // Datos del paciente
            doc.fontSize(14)
                .font('Helvetica-Bold')
                .text('DATOS DEL PACIENTE')
                .moveDown(0.5);
            
            doc.fontSize(11)
                .font('Helvetica')
                .text(`Nombre: ${atencion.pacienteNombre}`)
                .text(`RUT: ${atencion.pacienteRut}`)
                .text(`Email: ${atencion.pacienteEmail || 'N/A'}`)
                .text(`Teléfono: ${atencion.pacienteTelefono || 'N/A'}`)
                .moveDown();
            
            // Datos de la atención
            doc.fontSize(14)
                .font('Helvetica-Bold')
                .text('DATOS DE LA ATENCIÓN')
                .moveDown(0.5);
            
            const fecha = new Date(atencion.fechaCita);
            const fechaStr = `${fecha.getDate().toString().padStart(2, '0')}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}-${fecha.getFullYear()}`;
            
            doc.fontSize(11)
                .font('Helvetica')
                .text(`Fecha: ${fechaStr}`)
                .text(`Especialidad: ${atencion.especialidad || 'N/A'}`)
                .text(`Profesional: ${atencion.profesional || 'N/A'}`)
                .text(`Tipo: ${atencion.tipoCita || 'N/A'}`)
                .text(`Estado: ${atencion.estadoCita || 'N/A'}`)
                .moveDown();
            
            // Datos de facturación
            doc.fontSize(14)
                .font('Helvetica-Bold')
                .text('DATOS DE FACTURACIÓN')
                .moveDown(0.5);
            
            doc.fontSize(11)
                .font('Helvetica')
                .text(`Factura N°: ${atencion.facturaNumero || 'N/A'}`)
                .text(`Monto Neto: $${parseFloat(atencion.facturaMontoNeto || 0).toLocaleString('es-CL')}`)
                .text(`IVA: $${parseFloat(atencion.facturaMontoIva || 0).toLocaleString('es-CL')}`)
                .text(`Total: $${parseFloat(atencion.facturaMontoTotal || 0).toLocaleString('es-CL')}`)
                .moveDown()
                .text(`Estado de pago: ${atencion.estadoPago || 'N/A'}`)
                .text(`Monto pagado: $${parseFloat(atencion.montoPagado || 0).toLocaleString('es-CL')}`);
            
            if (atencion.metodoPago) {
                doc.text(`Método de pago: ${atencion.metodoPago}`);
            }
            
            doc.moveDown(2);
            
            // Pie
            doc.fontSize(9)
                .text(`Generado: ${formatToChileanDateTime(new Date())}`, { align: 'center' });
            
            doc.end();
            
        } catch (error) {
            logger.logError('Error al generar PDF individual:', error);
            reject(error);
        }
    });
};

export default {
    generateAtencionesReport,
    generatePatientReport
};