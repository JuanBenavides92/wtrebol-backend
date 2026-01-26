import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import Customer from '../models/Customer';

/**
 * POST /api/customers/register
 * Registrar un nuevo cliente
 */
export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, phone, address, city } = req.body;

        // Validar campos requeridos
        if (!name || !email || !password || !phone) {
            res.status(400).json({
                success: false,
                message: 'Por favor proporciona nombre, email, contraseña y teléfono'
            });
            return;
        }

        // Verificar si el email ya existe
        const existingCustomer = await Customer.findOne({ email: email.toLowerCase() });

        if (existingCustomer) {
            res.status(400).json({
                success: false,
                message: 'El email ya está registrado'
            });
            return;
        }

        // Hash de la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Crear nuevo cliente
        const newCustomer = new Customer({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            phone,
            address,
            city
        });

        await newCustomer.save();

        // Crear sesión automáticamente después del registro
        req.session.customerId = newCustomer._id.toString();
        req.session.customerEmail = newCustomer.email;
        req.session.customerName = newCustomer.name;

        res.status(201).json({
            success: true,
            message: 'Cliente registrado exitosamente',
            customer: {
                id: newCustomer._id,
                name: newCustomer.name,
                email: newCustomer.email,
                phone: newCustomer.phone,
                address: newCustomer.address,
                city: newCustomer.city
            }
        });

    } catch (error) {
        console.error('Error en registro de cliente:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor'
        });
    }
};

/**
 * POST /api/customers/login
 * Autenticar cliente y crear sesión
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

        // Buscar cliente por email
        const customer = await Customer.findOne({ email: email.toLowerCase() });

        if (!customer) {
            res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
            return;
        }

        // Verificar contraseña
        const isPasswordValid = await bcrypt.compare(password, customer.password);

        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
            return;
        }

        // Actualizar último login
        customer.lastLogin = new Date();
        await customer.save();

        // Crear sesión
        req.session.customerId = customer._id.toString();
        req.session.customerEmail = customer.email;
        req.session.customerName = customer.name;

        res.status(200).json({
            success: true,
            message: 'Login exitoso',
            customer: {
                id: customer._id,
                email: customer.email,
                name: customer.name,
                phone: customer.phone,
                address: customer.address,
                city: customer.city
            }
        });

    } catch (error) {
        console.error('Error en login de cliente:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor'
        });
    }
};

/**
 * POST /api/customers/logout
 * Cerrar sesión del cliente
 */
export const logout = (req: Request, res: Response): void => {
    // Solo borrar campos de customer de la sesión, no destruir toda la sesión
    // por si hay una sesión de admin activa también
    if (req.session) {
        delete req.session.customerId;
        delete req.session.customerEmail;
        delete req.session.customerName;

        res.status(200).json({
            success: true,
            message: 'Sesión cerrada exitosamente'
        });
    } else {
        res.status(200).json({
            success: true,
            message: 'No había sesión activa'
        });
    }
};

/**
 * GET /api/customers/me
 * Obtener información del cliente autenticado
 */
export const getCurrentCustomer = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.session.customerId) {
            res.status(401).json({
                success: false,
                message: 'No autenticado'
            });
            return;
        }

        const customer = await Customer.findById(req.session.customerId).select('-password');

        if (!customer) {
            res.status(404).json({
                success: false,
                message: 'Cliente no encontrado'
            });
            return;
        }

        res.status(200).json({
            success: true,
            customer: {
                id: customer._id,
                email: customer.email,
                name: customer.name,
                phone: customer.phone,
                address: customer.address,
                city: customer.city,
                lastLogin: customer.lastLogin,
                createdAt: customer.createdAt
            }
        });

    } catch (error) {
        console.error('Error al obtener cliente:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor'
        });
    }
};

/**
 * PUT /api/customers/me
 * Actualizar información del cliente autenticado
 */
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.session.customerId) {
            res.status(401).json({
                success: false,
                message: 'No autenticado'
            });
            return;
        }

        const { name, phone, address, city, currentPassword, newPassword } = req.body;

        const customer = await Customer.findById(req.session.customerId);

        if (!customer) {
            res.status(404).json({
                success: false,
                message: 'Cliente no encontrado'
            });
            return;
        }

        // Actualizar campos básicos
        if (name) customer.name = name;
        if (phone) customer.phone = phone;
        if (address !== undefined) customer.address = address;
        if (city !== undefined) customer.city = city;

        // Si se quiere cambiar la contraseña
        if (currentPassword && newPassword) {
            const isPasswordValid = await bcrypt.compare(currentPassword, customer.password);

            if (!isPasswordValid) {
                res.status(400).json({
                    success: false,
                    message: 'Contraseña actual incorrecta'
                });
                return;
            }

            const salt = await bcrypt.genSalt(10);
            customer.password = await bcrypt.hash(newPassword, salt);
        }

        await customer.save();

        // Actualizar sesión
        req.session.customerName = customer.name;

        res.status(200).json({
            success: true,
            message: 'Perfil actualizado exitosamente',
            customer: {
                id: customer._id,
                email: customer.email,
                name: customer.name,
                phone: customer.phone,
                address: customer.address,
                city: customer.city
            }
        });

    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor'
        });
    }
};
