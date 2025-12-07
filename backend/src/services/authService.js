/* --- SERVICIO DE AUTENTICACIÓN --- */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../config/config.js';
import { User } from '../models/index.js';
import { ApiError } from '../middleware/errorHandle.js';
import logger from '../utils/logger.js';

/**
 * Generar token JWT
 */
export const generateToken = (user) => {
    const payload = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
    };
    
    return jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn || '24h'
    });
};

/**
 * Login de usuario
 */
export const login = async (credential, password) => {
    try {
        // Buscar usuario por email o username
        const user = await User.findByCredential(credential);
        
        if (!user) {
            throw new ApiError(401, 'Credenciales inválidas');
        }
        
        // Verificar contraseña
        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        
        if (!isValidPassword) {
            throw new ApiError(401, 'Credenciales inválidas');
        }
        
        // Actualizar último login
        await user.update({ lastLogin: new Date() });
        
        // Generar token
        const token = generateToken(user);
        
        logger.logInfo(`Login exitoso: ${user.email}`);
        
        return {
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                role: user.role
            },
            token
        };
        
    } catch (error) {
        logger.logError('Error en login:', error);
        throw error;
    }
};

/**
 * Registrar nuevo usuario (solo admin)
 */
export const register = async (userData) => {
    try {
        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({
            where: {
                [User.sequelize.Sequelize.Op.or]: [
                    { email: userData.email },
                    { username: userData.username }
                ]
            }
        });
        
        if (existingUser) {
            throw new ApiError(409, 'El usuario ya existe');
        }
        
        // Hashear contraseña
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(userData.password, salt);
        
        // Crear usuario
        const user = await User.create({
            username: userData.username,
            email: userData.email,
            passwordHash,
            fullName: userData.fullName,
            role: userData.role || 'employee',
            isActive: true
        });
        
        logger.logInfo(`Usuario registrado: ${user.email}`);
        
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            role: user.role
        };
        
    } catch (error) {
        logger.logError('Error en registro:', error);
        throw error;
    }
};

/**
 * Cambiar contraseña
 */
export const changePassword = async (userId, oldPassword, newPassword) => {
    try {
        const user = await User.findByPk(userId);
        
        if (!user) {
            throw new ApiError(404, 'Usuario no encontrado');
        }
        
        // Verificar contraseña actual
        const isValidPassword = await bcrypt.compare(oldPassword, user.passwordHash);
        
        if (!isValidPassword) {
            throw new ApiError(401, 'Contraseña actual incorrecta');
        }
        
        // Hashear nueva contraseña
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newPassword, salt);
        
        // Actualizar
        await user.update({ passwordHash });
        
        logger.logInfo(`Contraseña cambiada: ${user.email}`);
        
        return { message: 'Contraseña actualizada exitosamente' };
        
    } catch (error) {
        logger.logError('Error al cambiar contraseña:', error);
        throw error;
    }
};

/**
 * Verificar token
 */
export const verifyToken = (token) => {
    try {
        return jwt.verify(token, config.jwt.secret);
    } catch (error) {
        throw new ApiError(401, 'Token inválido o expirado');
    }
};

export default {
    login,
    register,
    changePassword,
    generateToken,
    verifyToken
};