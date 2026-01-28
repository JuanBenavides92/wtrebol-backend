import { Request, Response } from 'express';
import orderService from '../services/orderService';
import { IOrderItem } from '../models/Order';

/**
 * Controlador para manejar las órdenes
 */

/**
 * Crea una nueva orden
 * POST /api/orders/create
 */
export const createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            customerId,
            customerEmail,
            customerName,
            customerPhone,
            items,
            shippingInfo
        } = req.body;

        // Validar datos requeridos
        if (!customerId || !customerEmail || !customerName || !items || !shippingInfo) {
            res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
            return;
        }

        if (!Array.isArray(items) || items.length === 0) {
            res.status(400).json({
                success: false,
                message: 'Items array is required and must not be empty'
            });
            return;
        }

        // Crear la orden
        const order = await orderService.createOrder({
            customerId,
            customerEmail,
            customerName,
            customerPhone,
            items,
            shippingInfo
        });

        // Retornar datos para Wompi
        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            order: {
                id: order._id,
                orderNumber: order.orderNumber,
                total: order.total,
                totalInCents: order.total * 100,
                currency: order.currency,
                signature: order.wompiSignature,
                customerEmail: order.customerEmail,
                customerName: order.customerName,
                shippingAddress: order.shippingInfo
            }
        });
    } catch (error: any) {
        console.error('Error in createOrder controller:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create order',
            error: error.message
        });
    }
};

/**
 * Obtiene una orden por ID
 * GET /api/orders/:id
 */
export const getOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const order = await orderService.getOrderById(id as string);

        if (!order) {
            res.status(404).json({
                success: false,
                message: 'Order not found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            order
        });
    } catch (error: any) {
        console.error('Error in getOrder controller:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch order',
            error: error.message
        });
    }
};

/**
 * Obtiene todas las órdenes de un cliente
 * GET /api/orders/customer/:customerId
 */
export const getCustomerOrders = async (req: Request, res: Response): Promise<void> => {
    try {
        const { customerId } = req.params;

        const orders = await orderService.getCustomerOrders(customerId as string);

        res.status(200).json({
            success: true,
            count: orders.length,
            orders
        });
    } catch (error: any) {
        console.error('Error in getCustomerOrders controller:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch customer orders',
            error: error.message
        });
    }
};

/**
 * Actualiza el estado de una orden
 * PUT /api/orders/:id/status
 */
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status, paymentStatus } = req.body;

        if (!status) {
            res.status(400).json({
                success: false,
                message: 'Status is required'
            });
            return;
        }

        const order = await orderService.updateOrderStatus(id as string, status, paymentStatus);

        if (!order) {
            res.status(404).json({
                success: false,
                message: 'Order not found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Order status updated successfully',
            order
        });
    } catch (error: any) {
        console.error('Error in updateOrderStatus controller:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update order status',
            error: error.message
        });
    }
};
