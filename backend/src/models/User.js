/* --- MODELO DE USUARIO --- */

import { DataTypes } from "sequelize";
import { sequelize } from '../config/database.js';

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    username: {
        type:  DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
            len: [3, 50],
            notEmpty: true
        }
    },

    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
            notEmpty: true
        }
    },

    passwordHash: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'password_hash'      // BD: password_hash - JS: passwordHash
    },

    fullName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'full_name',
        validate: {
            notEmpty: true
        }
    },

    role: {
        type: DataTypes.ENUM('admin', 'employee'),
        allowNull: false,
        defaultValue: 'employee',
        validate: {
            isIn: [['admin', 'employee']]
        }
    },

    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_active'
    },

    lastLogin: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'last_login'
    }
}, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['email']
        },
        {
            unique: true,
            fields: ['username']
        },
        {
            fields: ['role']
        },
        {
            fields: ['is_active']
        }
    ]
});


/* --- MÉTODOS DE INSTANCIA --- */

// Ocultar passwordHash en respuestas JSON
User.prototype.toJSON = function() {
    const values = { ...this.get() };
    delete values.passwordHash;
    return values;
};


/* --- MÉTODOS DE CLASE --- */

// Buscar usuario por email o username
User.findByCredential = async function(credential) {
    return await User.findOne(
        {
            where: {
                [sequelize.Sequelize.Op.or]: [
                    { email: credential },
                    { username: credential }
                ],
                isActive: true
            }
        }
    );
};


export default User;