import { Request, Response } from 'express';
import Customer from '../models/Customer';
import Order from '../models/Order';

/**
 * GET /api/admin/customers
 * Obtener todos los clientes con filtros y paginación
 */
export const getAllCustomers = async (req: Request, res: Response): Promise<void> => {
    try {
        const { search, limit = 50, page = 1, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

        const filter: any = {};

        // Búsqueda por nombre, email o teléfono
        if (search && typeof search === 'string') {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (Number(page) - 1) * Number(limit);
        const sort: any = {};
        sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

        const customers = await Customer.find(filter)
            .sort(sort)
            .limit(Number(limit))
            .skip(skip)
            .select('-password -__v');

        const totalCustomers = await Customer.countDocuments(filter);

        // Obtener número de pedidos por cliente (opcional, puede ser costoso)
        const customersWithOrderCount = await Promise.all(
            customers.map(async (customer) => {
                const orderCount = await Order.countDocuments({ customerId: customer._id });
                return {
                    ...customer.toObject(),
                    orderCount
                };
            })
        );

        res.status(200).json({
            success: true,
            count: customers.length,
            total: totalCustomers,
            page: Number(page),
            pages: Math.ceil(totalCustomers / Number(limit)),
            customers: customersWithOrderCount
        });

    } catch (error) {
        console.error('Error al obtener clientes (admin):', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor'
        });
    }
};

/**
 * GET /api/admin/customers/:id
 * Obtener detalle de un cliente con su historial de pedidos
 */
export const getCustomerById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const customer = await Customer.findById(id).select('-password -__v');

        if (!customer) {
            res.status(404).json({
                success: false,
                message: 'Cliente no encontrado'
            });
            return;
        }

        // Obtener pedidos del cliente
        const orders = await Order.find({ customerId: customer._id })
            .sort({ createdAt: -1 })
            .select('-__v');

        // Estadísticas del cliente
        const stats = await Order.aggregate([
            { $match: { customerId: customer._id } },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalSpent: { $sum: '$total' },
                    averageOrderValue: { $avg: '$total' }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            customer,
            orders,
            stats: stats[0] || { totalOrders: 0, totalSpent: 0, averageOrderValue: 0 }
        });

    } catch (error) {
        console.error('Error al obtener cliente (admin):', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor'
        });
    }
};

/**
 * PUT /api/admin/customers/:id
 * Editar información de un cliente
 */
export const updateCustomer = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, phone, address, city } = req.body;

        const customer = await Customer.findById(id);

        if (!customer) {
            res.status(404).json({
                success: false,
                message: 'Cliente no encontrado'
            });
            return;
        }

        // Actualizar campos permitidos (no se puede cambiar email o password desde admin)
        if (name) customer.name = name;
        if (phone) customer.phone = phone;
        if (address !== undefined) customer.address = address;
        if (city !== undefined) customer.city = city;

        await customer.save();

        res.status(200).json({
            success: true,
            message: 'Cliente actualizado exitosamente',
            customer: {
                id: customer._id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                address: customer.address,
                city: customer.city
            }
        });

    } catch (error) {
        console.error('Error al actualizar cliente (admin):', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor'
        });
    }
};

/**
 * DELETE /api/admin/customers/:id
 * Eliminar un cliente (solo si no tiene pedidos)
 */
export const deleteCustomer = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const customer = await Customer.findById(id);

        if (!customer) {
            res.status(404).json({
                success: false,
                message: 'Cliente no encontrado'
            });
            return;
        }

        // Verificar si tiene pedidos
        const orderCount = await Order.countDocuments({ customerId: customer._id });

        if (orderCount > 0) {
            res.status(400).json({
                success: false,
                message: `No se puede eliminar el cliente porque tiene ${orderCount} pedido(s) asociado(s)`
            });
            return;
        }

        await Customer.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Cliente eliminado exitosamente'
        });

    } catch (error) {
        console.error('Error al eliminar cliente (admin):', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor'
        });
    }
};

/**
 * GET /api/admin/customers/stats
 * Obtener estadísticas generales de clientes
 */
export const getCustomerStats = async (req: Request, res: Response): Promise<void> => {
    try {
        // Total de clientes
        const totalCustomers = await Customer.countDocuments();

        // Clientes registrados hoy
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const customersToday = await Customer.countDocuments({
            createdAt: { $gte: today }
        });

        // Clientes registrados esta semana
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const customersThisWeek = await Customer.countDocuments({
            createdAt: { $gte: weekAgo }
        });

        // Top 5 clientes por número de pedidos
        const topCustomers = await Order.aggregate([
            {
                $group: {
                    _id: '$customerId',
                    orderCount: { $sum: 1 },
                    totalSpent: { $sum: '$total' },
                    customerName: { $first: '$customerName' },
                    customerEmail: { $first: '$customerEmail' }
                }
            },
            { $sort: { totalSpent: -1 } },
            { $limit: 5 }
        ]);

        res.status(200).json({
            success: true,
            stats: {
                totalCustomers,
                customersToday,
                customersThisWeek,
                topCustomers
            }
        });

    } catch (error) {
        console.error('Error al obtener estadísticas de clientes (admin):', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor'
        });
    }
};
