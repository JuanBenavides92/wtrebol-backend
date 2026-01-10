import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';

/**
 * POST /api/auth/login
 * Autenticar usuario y crear sesión
 */
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        // Validar que se enviaron los datos
        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: 'Por favor proporciona email y contraseña'
            });
            return;
        }

        // Buscar usuario por email
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
            return;
        }

        // Verificar contraseña
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
            return;
        }

        // Actualizar último login
        user.lastLogin = new Date();
        await user.save();

        // Crear sesión
        req.session.userId = user._id.toString();
        req.session.userEmail = user.email;
        req.session.userName = user.name;
        req.session.userRole = user.role;

        res.status(200).json({
            success: true,
            message: 'Login exitoso',
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor'
        });
    }
};

/**
 * POST /api/auth/logout
 * Cerrar sesión del usuario
 */
export const logout = (req: Request, res: Response): void => {
    req.session.destroy((err) => {
        if (err) {
            res.status(500).json({
                success: false,
                message: 'Error al cerrar sesión'
            });
            return;
        }

        res.clearCookie('wtrebol.sid');
        res.status(200).json({
            success: true,
            message: 'Sesión cerrada exitosamente'
        });
    });
};

/**
 * GET /api/auth/me
 * Obtener información del usuario autenticado
 */
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.session.userId) {
            res.status(401).json({
                success: false,
                message: 'No autenticado'
            });
            return;
        }

        const user = await User.findById(req.session.userId).select('-password');

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
            return;
        }

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                lastLogin: user.lastLogin
            }
        });

    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor'
        });
    }
};
