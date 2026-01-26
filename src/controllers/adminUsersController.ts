import { Request, Response } from 'express';
import User from '../models/User';
import bcrypt from 'bcryptjs';

/**
 * GET /api/admin/users
 * Obtener todos los usuarios admin con filtros
 */
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const { search } = req.query;

        const filter: any = {};

        // Búsqueda por nombre o email
        if (search && typeof search === 'string') {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(filter)
            .sort({ createdAt: -1 })
            .select('-password -__v');

        res.status(200).json({
            success: true,
            count: users.length,
            users
        });

    } catch (error) {
        console.error('Error al obtener usuarios (admin):', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor'
        });
    }
};

/**
 * GET /api/admin/users/stats
 * Obtener estadísticas de usuarios
 */
export const getUserStats = async (req: Request, res: Response): Promise<void> => {
    try {
        // Total de usuarios
        const totalUsers = await User.countDocuments();

        // Usuarios por rol
        const usersByRole = await User.aggregate([
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                usersByRole
            }
        });

    } catch (error) {
        console.error('Error al obtener estadísticas de usuarios:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor'
        });
    }
};

/**
 * GET /api/admin/users/:id
 * Obtener un usuario por ID
 */
export const getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const user = await User.findById(id).select('-password -__v');

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
            return;
        }

        res.status(200).json({
            success: true,
            user
        });

    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor'
        });
    }
};

/**
 * POST /api/admin/users
 * Crear un nuevo usuario admin
 */
export const createUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, role = 'editor' } = req.body;

        // Validaciones
        if (!name || !email || !password) {
            res.status(400).json({
                success: false,
                message: 'Nombre, email y contraseña son requeridos'
            });
            return;
        }

        if (password.length < 6) {
            res.status(400).json({
                success: false,
                message: 'La contraseña debe tener al menos 6 caracteres'
            });
            return;
        }

        // Verificar si el email ya existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({
                success: false,
                message: 'El email ya está registrado'
            });
            return;
        }

        // Hashear contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear usuario
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role
        });

        await newUser.save();

        res.status(201).json({
            success: true,
            message: 'Usuario creado exitosamente',
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                createdAt: newUser.createdAt
            }
        });

    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor'
        });
    }
};

/**
 * PUT /api/admin/users/:id
 * Actualizar un usuario
 */
export const updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, email, password, role } = req.body;

        const user = await User.findById(id);

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
            return;
        }

        // Actualizar campos
        if (name) user.name = name;
        if (email) {
            // Verificar si el nuevo email ya existe (en otro usuario)
            // @ts-ignore - Mongoose type compatibility
            const existingUser = await User.findOne({ email, _id: { $ne: id } });
            if (existingUser) {
                res.status(400).json({
                    success: false,
                    message: 'El email ya está en uso'
                });
                return;
            }
            user.email = email;
        }
        if (role) user.role = role as any;

        // Actualizar contraseña solo si se proporciona
        if (password) {
            if (password.length < 6) {
                res.status(400).json({
                    success: false,
                    message: 'La contraseña debe tener al menos 6 caracteres'
                });
                return;
            }
            user.password = await bcrypt.hash(password, 10);
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Usuario actualizado exitosamente',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor'
        });
    }
};

/**
 * DELETE /api/admin/users/:id
 * Eliminar un usuario
 */
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
            return;
        }

        // No permitir eliminar el último admin
        if (user.role === 'admin') {
            const adminCount = await User.countDocuments({ role: 'admin' });
            if (adminCount <= 1) {
                res.status(400).json({
                    success: false,
                    message: 'No se puede eliminar el último administrador'
                });
                return;
            }
        }

        await User.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Usuario eliminado exitosamente'
        });

    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor'
        });
    }
};
