/* --- CONTROLADOR DE USUARIOS --- */

import { User } from '../models/index.js';
import { ApiError } from '../middleware/errorHandle.js';
import { catchAsync } from '../middleware/errorHandle.js';
import logger from '../utils/logger.js';
import bcrypt from 'bcryptjs';

/**
 * Obtener todos los usuarios
 * GET /api/users
 */
export const getAllUsers = catchAsync(async (req, res) => {
    const { page = 1, limit = 10, role, isActive } = req.query;
    
    const offset = (page - 1) * limit;
    
    // Construir filtros
    const where = {};
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    
    const { count, rows: users } = await User.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']],
        attributes: { exclude: ['passwordHash'] }
    });
    
    res.json({
        success: true,
        data: {
            users,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(count / limit)
            }
        }
    });
});

/**
 * Obtener usuario por ID
 * GET /api/users/:id
 */
export const getUserById = catchAsync(async (req, res) => {
    const { id } = req.params;
    
    const user = await User.findByPk(id, {
        attributes: { exclude: ['passwordHash'] }
    });
    
    if (!user) {
        throw new ApiError(404, 'Usuario no encontrado');
    }
    
    res.json({
        success: true,
        data: user
    });
});

/**
 * Crear nuevo usuario (solo admin)
 * POST /api/users
 */
export const createUser = catchAsync(async (req, res) => {
    const { username, email, password, fullName, role } = req.body;
    
    // Validar campos requeridos
    if (!username || !email || !password || !fullName) {
        throw new ApiError(400, 'Todos los campos son requeridos');
    }
    
    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({
        where: {
            [User.sequelize.Sequelize.Op.or]: [
                { email },
                { username }
            ]
        }
    });
    
    if (existingUser) {
        throw new ApiError(409, 'El email o username ya está registrado');
    }
    
    // Hashear contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // Crear usuario
    const user = await User.create({
        username,
        email,
        passwordHash,
        fullName,
        role: role || 'employee',
        isActive: true
    });
    
    logger.logInfo(`Usuario creado por ${req.user.username}: ${username}`);
    
    res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente',
        data: {
            id: user.id,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            role: user.role
        }
    });
});

/**
 * Actualizar usuario
 * PUT /api/users/:id
 */
export const updateUser = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { username, email, fullName, role, isActive } = req.body;
    
    const user = await User.findByPk(id);
    
    if (!user) {
        throw new ApiError(404, 'Usuario no encontrado');
    }
    
    // Solo admin puede cambiar roles y estado
    if ((role || isActive !== undefined) && req.user.role !== 'admin') {
        throw new ApiError(403, 'Solo un administrador puede cambiar roles o estado');
    }
    
    // Actualizar campos permitidos
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (fullName) updateData.fullName = fullName;
    if (role) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    await user.update(updateData);
    
    logger.logInfo(`Usuario actualizado por ${req.user.username}: ${user.username}`);
    
    res.json({
        success: true,
        message: 'Usuario actualizado exitosamente',
        data: {
            id: user.id,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            isActive: user.isActive
        }
    });
});

/**
 * Eliminar usuario (soft delete - desactivar)
 * DELETE /api/users/:id
 */
export const deleteUser = catchAsync(async (req, res) => {
    const { id } = req.params;
    
    // No permitir auto-eliminación
    if (parseInt(id) === req.user.id) {
        throw new ApiError(400, 'No puedes desactivar tu propia cuenta');
    }
    
    const user = await User.findByPk(id);
    
    if (!user) {
        throw new ApiError(404, 'Usuario no encontrado');
    }
    
    // Desactivar usuario (soft delete)
    await user.update({ isActive: false });
    
    logger.logInfo(`Usuario desactivado por ${req.user.username}: ${user.username}`);
    
    res.json({
        success: true,
        message: 'Usuario desactivado exitosamente'
    });
});

/**
 * Reactivar usuario
 * PATCH /api/users/:id/activate
 */
export const activateUser = catchAsync(async (req, res) => {
    const { id } = req.params;
    
    const user = await User.findByPk(id);
    
    if (!user) {
        throw new ApiError(404, 'Usuario no encontrado');
    }
    
    await user.update({ isActive: true });
    
    logger.logInfo(`Usuario reactivado por ${req.user.username}: ${user.username}`);
    
    res.json({
        success: true,
        message: 'Usuario reactivado exitosamente'
    });
});

export default {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    activateUser
};