/* --- MODELO DE ATENCIÓN CONSOLIDADA --- */

import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Atencion = sequelize.define('Atencion', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    /* IDENTIFICADORES EXTERNOS */

    reservoId: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'reservo_id',
        unique: true
    },

    snabbId: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'snabb_id'
    },

    dtemiteId: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'dtemite_id'
    },


    /* INFORMACIÓN DEL PACIENTE */

    pacienteRut: {
        type: DataTypes.STRING(20),
        allowNull: false,
        field: 'paciente_rut',
        validate: {
            notEmpty: true
        }
    },

    pacienteNombre: {
        type: DataTypes.STRING(200),
        allowNull: false,
        field: 'paciente_nombre',
        validate: {
            notEmpty: true
        }
    },

    pacienteEmail: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'paciente_email',
        validate: {
            isEmail: true
        }
    },

    pacienteTelefono: {
        type: DataTypes.STRING(20),
        field: 'paciente_telefono'
    },

    pacienteFechaNacimiento: {
        type: DataTypes.DATEONLY,
        field: 'paciente_fecha_nacimiento'
    },


    /* INFORMACIÓN DE LA CITA */

    fechaCita: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'fecha_cita'
    },

    especialidad: {
        type: DataTypes.STRING(100),
        allowNull: true
    },

    profesional: {
        type: DataTypes.STRING(200),
        allowNull: true
    },

    tipoCita: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'tipo_cita',
        comment: 'Ej: Presencial, Telemedicina, etc'
    },

    estadoCita: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'estado_cita',
        comment: 'Ej: Confirmada, Cancelada, Completada, No_Asiste'
    },


    /* INFORMACIÓN FONASA/ISAPRE */

    prevision: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Fonasa, Isapre, Particular'
    },

    planSalud: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'plan_salud',
        comment: 'A, B, C, D para FONASA'
    },


    /* INFORMACIÓN DE BONOS (SNABB) */

    bonoNumero: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'bono_numero'
    },

    bonoEstado: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'bono_estado',
        comment: 'Emitido, utilizado, anulado'
    },

    bonoMonto: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: 'bono_monto'
    },

    bonoFechaEmision: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'bono_fecha_emision'
    },

    copago: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.00
    },

    montoBonificado: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: 'monto_bonificado',
        comment: 'Monto que bonifica Fonasa'
    },

    folio: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Folio del voucher de Snabb'
    },

    voucherHash: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'voucher_hash',
        comment: 'Hash de autorización del voucher'
    },

    voucherUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'voucher_url',
        comment: 'URL del voucher de Snabb'
    },

    codigoPrestacion: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'codigo_prestacion',
        comment: 'Código de prestación Fonasa'
    },

    fechaExpiracion: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'fecha_expiracion',
        comment: 'Fecha de expiración del voucher'
    },


    /* INFORMACIÓN DE FACTURACIÓN (DTEMITE) */

    facturaNumero: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'factura_numero'
    },

    facturaTipo: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'factura_tipo',
        comment: '33 = Factura Electrónica, 39 = Boleta, etc'
    },

    facturaEstado: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'factura_estado',
        comment: 'emitida, pagada, anulada'
    },

    facturaFechaEmision: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'factura_fecha_emision'
    },

    facturaMontoNeto: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: 'factura_monto_neto'
    },

    facturaMontoIva: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: 'factura_monto_iva'
    },

    facturaMontoTotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: 'factura_monto_total'
    },


    /* INFORMACIÓN DE PAGO */

    metodoPago: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'metodo_pago',
        comment: 'efectivo, tarjeta, transferencia, bono_fonasa'
    },

    estadoPago: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'estado_pago',
        comment: 'pendiente, pagado, parcial'
    },

    fechaPago: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'fecha_pago'
    },

    montoPagado: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: 'monto_pagado',
        defaultValue: 0.00
    },

    

    /* METADATOS */

    origenDatos: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'origen_datos',
        comment: 'reservo, snabb, dtemite, transbank'
    },

    lastModifiedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'last_modified_by',
        comment: 'ID del usuario que hizo la última modificación'
    },

    observaciones: {
        type: DataTypes.TEXT
    },

    datosRaw: {
        type: DataTypes.JSONB,
        allowNull: true,
        field: 'datos_raw',
        comment: 'JSON con datos originales de las APIs'
    }

}, {
    tableName: 'atenciones',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            fields: ['paciente_rut']
        },
                {
            fields: ['fecha_cita']
        },
        {
            fields: ['estado_cita']
        },
        {
            fields: ['estado_pago']
        },
        {
            unique: true,
            fields: ['reservo_id'],
            where: {
                reservo_id: {
                    [sequelize.Sequelize.Op.ne]: null
                }
            }
        },
        {
            fields: ['snabb_id']
        },
        {
            fields: ['dtemite_id']
        },
        {
            fields: ['created_at']
        }
    ]
});

/* --- MÉTODOS DE CLASE --- */

// Buscar atenciones por RUT del paciente

Atencion.findByPacienteRut = async function(rut) {
    return await Atencion.findAll({
        where: { pacienteRut: rut },
        order: [['fechaCita', 'DESC']]
    });
};

// Buscar atenciones pendientes de pago

Atencion.findPendientesPago = async function() {
    return await Atencion.findAll({
        where: {
            estadoPago: {
                [sequelize.Sequelize.Op.in]: ['pendiente', 'parcial']
            }
        },
        order: [['fechaCita', 'DESC']]
    });
};

// Buscar atenciones por rango de fechas

Atencion.findByDateRange = async function(startDate, endDate) {
    return await Atencion.findAll({
        where: {
            fechaCita: {
                [sequelize.Sequelize.Op.between]: [startDate, endDate]
            }
        },
        order: [['fechaCita', 'ASC']]
    });
};


export default Atencion;