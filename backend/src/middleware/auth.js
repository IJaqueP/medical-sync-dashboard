/* MIDDLEWARE DE AUTENTICACIÓN CON JWT */

import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
import { User } from '../models/index.js';
import { ApiError } from './errorHandle.js';

/* Verificar token JWT y agregar usuario a req.user */

export const authenticateToken = async (req, res, next) => {
    try {

        // Obtener token del header Authorization
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; //BEARER TOKEN

        if (!token) {
            throw new ApiError(401, 'Token no proporcionado');
        }


        // Verificar token
        const decoded = jwt.verify(token, config.jwt.secret);


        // Buscar usuario
        const user = await User.findByPk(decoded.id);

        if (!user) {
            throw new ApiError(401, 'Usuario no encontrado');
        }

        if (!user.isActive) {
            throw new ApiError(401, 'Usuario inactivo');
        }


        // Agregar usuario a request
        req.user = {
            id: user.id, 
            username: user.username,
            email: user.email,
            role: user.role,
            fullName: user.fullname
        };


        next();


    } catch (err) {

        if (err.name === 'JsonWebTokenError') {
            next(new ApiError(401, 'Token Inválido'));
        } else if (err.name === 'TokenExpiredError') {
            next(new ApiError(401, 'Token Expirado'));
        } else {
            next(err);
        }
    }
};


/* MIDDLEWARE DE AUTENTICACIÓN QUE NO FALLA SI NO HAY TOKEN */
export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        
        if (token) {
            const decoded = jwt.verify(token, config.jwt.secret);
            const user = await User.findByPk(decoded.id);
            
            if (user && user.isActive) {
                req.user = {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    fullName: user.fullName
                };
            }
        }
        
        next();
        
    } catch (error) {
        // Si hay error, simplemente continuar sin usuario
        next();
    }
};

export default { authenticateToken, optionalAuth };