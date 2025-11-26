/* ====================================================
CREACIÓN DE USUARIO ADMIN INICIAL
======================================================= */

import bcrypt from 'bcryptjs';
import { config } from '../config/config.js';

/* Datos del usuario admin por defecto */
const defaultAdmin = {
    username: 'admin',
    email: 'carmona@admin.cl',
    password: 'admin123',
    fullName: 'Administrador del Sistema',
    role: 'admin'
};

/* HASEAR LA CONTRASEÑA */
export const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

/* --- CREAR ADMIN INICIAL --- */
// Esta será la función llamada por los modelos
export const createInitialAdmin = async (UserModel) => {
    try {
        // Verificaremos si ya existe algún admin
        const adminExists = await UserModel.findOne(
            {
                where: { role: 'admin' }
            }
        );

        if (adminExists) {
            console.log('Ya existe un usuario administrador');
            return null
        }

        // Hashear contraseña
        const passwordHash = await hashPassword(defaultAdmin.password);

        // Crear el admin
        const admin = await UserModel.create(
            {
                username: defaultAdmin.username,
                email: defaultAdmin.email,
                passwordHash: passwordHash,
                fullName: defaultAdmin.fullName,
                role: defaultAdmin.role,
                isActive: true 
            }
        );

        console.log('Usuario administrador creado');
        console.log('Email: ', defaultAdmin.email);
        console.log('Password: ', defaultAdmin.password);
        console.log('🅰️ CAMBIAR LA CONTRASEÑA DESPUÉS DEL PRIMER LOGIN');

        return admin;


    } catch (err) {

        console.error('Error al crear el nuevo admin:', err.message);
        throw err;

    }
};

export default defaultAdmin;