import { Request, Response } from 'express';
import Order from '../models/Order';
import OrderStatusHistory, { IOrderStatusHistory } from '../models/OrderStatusHistory';
import { OrderStatus } from '../models/Order';
import emailService from '../services/emailService';

/**
 * GET /api/admin/orders
 * Obtener todos los pedidos con filtros y paginación
 */
export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
    try {
        const { status, customerId, startDate, endDate, limit = 50, page = 1, search } = req.query;

        const filter: any = {};

        // Filtro por estado
        if (status && typeof status === 'string') {
            filter.status = status;
        }

        // Filtro por cliente
        if (customerId && typeof customerId === 'string') {
            filter.customerId = customerId;
        }

        // Filtro por rango de fechas
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate as string);
            if (endDate) filter.createdAt.$lte = new Date(endDate as string);
        }

        // Búsqueda por número de pedido o email
        if (search && typeof search === 'string') {
            filter.$or = [
                { orderNumber: { $regex: search, $options: 'i' } },
                { customerEmail: { $regex: search, $options: 'i' } },
                { customerName: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (Number(page) - 1) * Number(limit);

        const orders = await Order.find(filter)
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip(skip)
            .select('-__v');

        const totalOrders = await Order.countDocuments(filter);

        res.status(200).json({
            success: true,
            count: orders.length,
            total: totalOrders,
            page: Number(page),
            pages: Math.ceil(totalOrders / Number(limit)),
            orders
        });

    } catch (error) {
        console.error('Error al obtener pedidos (admin):', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor'
        });
    }
};

/**
 * GET /api/admin/orders/:id
 * Obtener detalle completo de un pedido
 */
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const order = await Order.findById(id);

        if (!order) {
            res.status(404).json({
                success: false,
                message: 'Pedido no encontrado'
            });
            return;
        }

        // Obtener historial de estados
        const statusHistory = await OrderStatusHistory.find({ orderId: order._id })
            .sort({ createdAt: 1 })
            .populate('changedBy', 'name email')
            .select('-__v');

        res.status(200).json({
            success: true,
            order,
            statusHistory
        });

    } catch (error) {
        console.error('Error al obtener pedido (admin):', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor'
        });
    }
};

/**
 * PUT /api/admin/orders/:id/status
 * Cambiar el estado de un pedido
 */
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        // Validar que el estado sea válido
        const validStatuses: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

        if (!status || !validStatuses.includes(status)) {
            res.status(400).json({
                success: false,
                message: 'Estado inválido'
            });
            return;
        }

        const order = await Order.findById(id);

        if (!order) {
            res.status(404).json({
                success: false,
                message: 'Pedido no encontrado'
            });
            return;
        }

        const previousStatus = order.status;

        // Actualizar el estado
        order.status = status;
        order.statusUpdatedAt = new Date();
        await order.save();

        // Crear registro en el historial
        await OrderStatusHistory.create({
            orderId: order._id,
            orderNumber: order.orderNumber,
            previousStatus,
            newStatus: status,
            changedBy: req.session.userId || null,
            changedByType: 'admin',
            notes: notes || `Estado cambiado de ${previousStatus} a ${status}`
        });

        // Enviar email de actualización de estado al cliente
        try {
            const statusLabels: Record<string, string> = {
                pending: 'Pendiente',
                confirmed: 'Confirmado',
                processing: 'En Proceso',
                shipped: 'Enviado',
                delivered: 'Entregado',
                cancelled: 'Cancelado'
            };

            await emailService.sendOrderStatusUpdate({
                customerEmail: order.customerEmail,
                customerName: order.customerName,
                orderNumber: order.orderNumber,
                newStatus: status,
                statusLabel: statusLabels[status] || status,
                notes
            });

            console.log('✅ Email de actualización de estado enviado');
        } catch (emailError) {
            console.error('⚠️ Error al enviar email de status (actualización exitosa):', emailError);
            // No fallar la actualización si el email falla
        }

        res.status(200).json({
            success: true,
            message: 'Estado actualizado exitosamente',
            order: {
                id: order._id,
                orderNumber: order.orderNumber,
                status: order.status,
                statusUpdatedAt: order.statusUpdatedAt
            }
        });

    } catch (error) {
        console.error('Error al actualizar estado (admin):', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor'
        });
    }
};

/**
 * GET /api/admin/orders/stats
 * Obtener estadísticas de pedidos
 */
export const getOrderStats = async (req: Request, res: Response): Promise<void> => {
    try {
        // Contar pedidos por estado
        const statsByStatus = await Order.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$total' }
                }
            }
        ]);

        // Total de pedidos
        const totalOrders = await Order.countDocuments();

        // Pedidos de hoy
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const ordersToday = await Order.countDocuments({
            createdAt: { $gte: today }
        });

        // Pedidos de esta semana
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const ordersThisWeek = await Order.countDocuments({
            createdAt: { $gte: weekAgo }
        });

        // Ingresos totales
        const revenueStats = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$total' },
                    averageOrderValue: { $avg: '$total' }
                }
            }
        ]);

        // Pedidos recientes (últimos 5)
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('orderNumber customerName total status createdAt');

        res.status(200).json({
            success: true,
            stats: {
                totalOrders,
                ordersToday,
                ordersThisWeek,
                byStatus: statsByStatus,
                revenue: revenueStats[0] || { totalRevenue: 0, averageOrderValue: 0 },
                recentOrders
            }
        });

    } catch (error) {
        console.error('Error al obtener estadísticas (admin):', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor'
        });
    }
};
