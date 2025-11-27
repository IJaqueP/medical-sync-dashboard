/* --- MODELO DE LOG DE SINCRONIZACIÓN --- */

import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const SyncLog = sequelize.define('SyncLog', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    
    apiName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: 'api_name',
        comment: 'reservo, snabb, dtemite'
    },
    
    syncType: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: 'sync_type',
        comment: 'manual, automatic, scheduled'
    },
    
    status: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: 'success, error, partial'
    },
    
    startTime: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'start_time',
        defaultValue: DataTypes.NOW
    },
    
    endTime: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'end_time'
    },
    
    duration: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Duración en milisegundos'
    },
    
    recordsProcessed: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'records_processed',
        defaultValue: 0
    },
    
    recordsCreated: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'records_created',
        defaultValue: 0
    },
    
    recordsUpdated: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'records_updated',
        defaultValue: 0
    },
    
    recordsError: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'records_error',
        defaultValue: 0
    },
    
    errorMessage: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'error_message'
    },
    
    errorDetails: {
        type: DataTypes.JSONB,
        allowNull: true,
        field: 'error_details',
        comment: 'Detalles completos del error en JSON'
    },
    
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'user_id',
        comment: 'Usuario que inició la sincronización manual'
    },
    
    metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
        comment: 'Información adicional sobre la sincronización'
    }
    
}, {
    tableName: 'sync_logs',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            fields: ['api_name']
        },
        {
            fields: ['status']
        },
        {
            fields: ['start_time']
        },
        {
            fields: ['sync_type']
        }
    ]
});

/* --- MÉTODOS DE CLASE --- */

// Obtener últimas sincronizaciones por API

SyncLog.getLastSyncByAPI = async function(apiName, limit = 10) {
    return await SyncLog.findAll({
        where: { apiName },
        order: [['startTime', 'DESC']],
        limit
    });
};

// Obtener resumen de sincronizaciones

SyncLog.getSyncSummary = async function(days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return await SyncLog.findAll({
        where: {
            startTime: {
                [sequelize.Sequelize.Op.gte]: startDate
            }
        },
        order: [['startTime', 'DESC']]
    });
};

export default SyncLog;