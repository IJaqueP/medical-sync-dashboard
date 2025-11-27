/* --- INICIALIZACIÓN DE MODELOS --- */

import { sequelize } from '../config/database.js';
import User from './User.js';
import Atencion from './Atencion.js';
import SyncLog from './SyncLog.js';

/* === DEFINIR RELACIONES ENTRE MODELOS === */

// Una atención puede tener un usuario que la registró/modificó
Atencion.belongsTo(User, {
    foreignKey: 'lastModifiedBy',
    as: 'modifier',
    constraints: false // No forzar foreign key estricta
});

User.hasMany(Atencion, {
    foreignKey: 'lastModifiedBy',
    as: 'modificaciones',
    constraints: false
});

// Los logs de sincronización pueden estar asociados a un usuario
SyncLog.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
    constraints: false
});

User.hasMany(SyncLog, {
    foreignKey: 'userId',
    as: 'syncLogs',
    constraints: false
});

/* === EXPORTAR MODELOS === */
const models = {
    User,
    Atencion,
    SyncLog,
    sequelize
};

export default models;
export { User, Atencion, SyncLog, sequelize };