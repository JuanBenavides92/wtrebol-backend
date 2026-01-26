import { Request, Response } from 'express';
import Order from '../models/Order';
import OrderStatusHistory from '../models/OrderStatusHistory';
import Customer from '../models/Customer';
import emailService from '../services/emailService';

/**
 * POST /api/orders
 * Crear un nuevo pedido
 */
export const createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.customerId) {
            res.status(401).json({
                success: false,
                message: 'No autenticado'
            });
            return;
        }

        const { items, subtotal, shipping = 0, total, shippingInfo, notes } = req.body;

        // Validar campos requeridos
        if (!items || items.length === 0) {
            res.status(400).json({
                success: false,
                message: 'El pedido debe contener al menos un producto'
            });
            return;
        }

        if (!shippingInfo || !shippingInfo.name || !shippingInfo.phone || !shippingInfo.address || !shippingInfo.city) {
            res.status(400).json({
                success: false,
                message: 'Información de envío incompleta'
            });
            return;
        }

        // Obtener datos del cliente
        const customer = await Customer.findById(req.customerId);

        if (!customer) {
            res.status(404).json({
                success: false,
                message: 'Cliente no encontrado'
            });
            return;
        }

        // Crear el pedido
        const newOrder = new Order({
            customerId: customer._id,
            customerEmail: customer.email,
            customerName: customer.name,
            items,
            subtotal,
            shipping,
            total,
            shippingInfo,
            notes,
            status: 'pending'
        });

        await newOrder.save();

        // Crear registro en historial de estado
        await OrderStatusHistory.create({
            orderId: newOrder._id,
            orderNumber: newOrder.orderNumber,
            previousStatus: 'pending',
            newStatus: 'pending',
            changedByType: 'customer',
            changedBy: customer._id,
            notes: 'Pedido creado'
        });

        // Enviar emails de confirmación
        try {
            // Email al cliente
            await emailService.sendOrderConfirmation({
                customerEmail: customer.email,
                customerName: customer.name,
                orderNumber: newOrder.orderNumber,
                items: newOrder.items,
                total: newOrder.total,
                shippingInfo: newOrder.shippingInfo
            });

            // Email al admin
            await emailService.sendNewOrderNotification({
                orderNumber: newOrder.orderNumber,
                customerName: customer.name,
                customerEmail: customer.email,
                total: newOrder.total,
                itemCount: newOrder.items.length
            });

            console.log('✅ Emails de pedido enviados correctamente');
        } catch (emailError) {
            console.error('⚠️ Error al enviar emails (pedido creado exitosamente):', emailError);
            // No fallar la creación del pedido si los emails fallan
        }

        res.status(201).json({
            success: true,
            message: 'Pedido creado exitosamente',
            order: {
                id: newOrder._id,
                orderNumber: newOrder.orderNumber,
                status: newOrder.status,
                total: newOrder.total,
                createdAt: newOrder.createdAt
            }
        });

    } catch (error) {
        console.error('Error al crear pedido:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor'
        });
    }
};

/**
 * GET /api/orders/my-orders
 * Obtener todos los pedidos del cliente autenticado
 */
export const getMyOrders = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.customerId) {
            res.status(401).json({
                success: false,
                message: 'No autenticado'
            });
            return;
        }

        const { status, limit = 50, page = 1 } = req.query;

        const filter: any = { customerId: req.customerId };

        if (status && typeof status === 'string') {
            filter.status = status;
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
        console.error('Error al obtener pedidos:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor'
        });
    }
};

/**
 * GET /api/orders/:id
 * Obtener detalle de un pedido específico
 */
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.customerId) {
            res.status(401).json({
                success: false,
                message: 'No autenticado'
            });
            return;
        }

        const { id } = req.params;

        const order = await Order.findOne({
            _id: id,
            customerId: req.customerId
        });

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
            .select('-__v');

        res.status(200).json({
            success: true,
            order,
            statusHistory
        });

    } catch (error) {
        console.error('Error al obtener pedido:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor'
        });
    }
};
