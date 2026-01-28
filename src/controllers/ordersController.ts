import { Request, Response } from 'express';
import Order from '../models/Order';
import OrderStatusHistory from '../models/OrderStatusHistory';
import Customer from '../models/Customer';
import emailService from '../services/emailService';
import orderService from '../services/orderService';

/**
 * POST /api/orders
 * Crear un nuevo pedido (con integración Wompi)
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

        const { idempotencyKey, items, shippingInfo, customerEmail, customerName, customerPhone } = req.body;

        // Validar idempotency key
        if (!idempotencyKey) {
            res.status(400).json({
                success: false,
                message: 'Idempotency key requerida'
            });
            return;
        }

        // Verificar si ya existe un pedido con esta idempotency key
        const existingOrder = await Order.findOne({
            idempotencyKey,
            customerId: req.customerId
        });

        if (existingOrder) {
            console.log('⚠️ Pedido duplicado detectado:', idempotencyKey);
            res.status(200).json({
                success: true,
                message: 'Pedido ya existe',
                isDuplicate: true,
                order: {
                    id: existingOrder._id,
                    orderNumber: existingOrder.orderNumber,
                    status: existingOrder.status,
                    paymentStatus: existingOrder.paymentStatus,
                    total: existingOrder.total,
                    totalInCents: existingOrder.total * 100,
                    currency: existingOrder.currency,
                    signature: existingOrder.wompiSignature,
                    customerEmail: existingOrder.customerEmail,
                    customerName: existingOrder.customerName,
                    shippingAddress: existingOrder.shippingInfo,
                    createdAt: existingOrder.createdAt
                }
            });
            return;
        }

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

        // Crear orden usando orderService (incluye cálculo de impuestos y firma Wompi)
        const order = await orderService.createOrder({
            customerId: customer._id.toString(),
            customerEmail: customerEmail || customer.email,
            customerName: customerName || customer.name,
            customerPhone: customerPhone || customer.phone || '',
            items,
            shippingInfo,
            idempotencyKey // Incluir idempotency key
        });

        // Crear registro en historial de estado
        await OrderStatusHistory.create({
            orderId: order._id,
            orderNumber: order.orderNumber,
            previousStatus: 'pending_payment',
            newStatus: 'pending_payment',
            changedByType: 'customer',
            changedBy: customer._id,
            notes: 'Pedido creado'
        });

        console.log('✅ Orden creada exitosamente:', order.orderNumber);

        res.status(201).json({
            success: true,
            message: 'Pedido creado exitosamente',
            order: {
                id: order._id,
                orderNumber: order.orderNumber,
                status: order.status,
                paymentStatus: order.paymentStatus,
                total: order.total,
                totalInCents: order.total * 100,
                currency: order.currency,
                signature: order.wompiSignature,
                customerEmail: order.customerEmail,
                customerName: order.customerName,
                shippingAddress: order.shippingInfo,
                createdAt: order.createdAt
            }
        });

    } catch (error: any) {
        console.error('❌ Error al crear pedido:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor',
            error: error.message
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

/**
 * PATCH /api/orders/:id/payment
 * Actualizar estado de pago de una orden (con verificación de Wompi API)
 */
export const updateOrderPaymentStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.customerId) {
            res.status(401).json({
                success: false,
                message: 'No autenticado'
            });
            return;
        }

        const { id } = req.params;
        const { transactionId, signature } = req.body;

        // Validar que se proporcione el transaction ID
        if (!transactionId) {
            res.status(400).json({
                success: false,
                message: 'Transaction ID requerido'
            });
            return;
        }

        console.log(`🔍 Verificando pago con Wompi API para pedido ${id}, transaction: ${transactionId}`);

        // Verificación opcional de firma de integridad (si se proporciona)
        if (signature) {
            const wompiService = require('../services/wompiService').default;

            // Buscar pedido para obtener datos
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

            // Verificar firma de integridad
            const isValidSignature = wompiService.verifyIntegritySignature(
                order.orderNumber,
                Math.round(order.total * 100),
                'COP',
                signature
            );

            if (!isValidSignature) {
                console.error('❌ Firma de integridad inválida');
                res.status(400).json({
                    success: false,
                    message: 'Firma de integridad inválida'
                });
                return;
            }

            console.log('✅ Firma de integridad verificada');
        }

        // ✅ VERIFICAR CON WOMPI API
        const wompiVerificationService = require('../services/wompiVerificationService').default;
        const result = await wompiVerificationService.verifyAndUpdateOrder(
            id,
            transactionId,
            req.customerId
        );

        if (result.success) {
            console.log(`✅ Pago verificado exitosamente para pedido ${result.order.orderNumber}`);
            res.status(200).json({
                success: true,
                message: 'Pago verificado y confirmado con Wompi',
                order: result.order,
                verified: true
            });
        } else {
            console.log(`⚠️ Pago no aprobado: ${result.message}`);
            res.status(400).json({
                success: false,
                message: result.message,
                verified: true
            });
        }

    } catch (error: any) {
        console.error('❌ Error al verificar pago con Wompi:', error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'Error al verificar el pago con Wompi'
        });
    }
};

/**
 * DELETE /api/orders/:id
 * Cancelar un pedido (solo si está en pending_payment)
 */
export const cancelOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.customerId) {
            res.status(401).json({
                success: false,
                message: 'No autenticado'
            });
            return;
        }

        const { id } = req.params;
        const { reason } = req.body;

        // Buscar la orden
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

        // Solo se pueden cancelar pedidos pendientes de pago
        if (order.status !== 'pending_payment') {
            res.status(400).json({
                success: false,
                message: 'Solo se pueden cancelar pedidos pendientes de pago'
            });
            return;
        }

        // Guardar estado anterior
        const previousStatus = order.status;

        // Actualizar orden
        order.status = 'cancelled';
        order.cancelledAt = new Date();
        order.cancelledReason = reason || 'Cancelado por el cliente';
        order.statusUpdatedAt = new Date();

        await order.save();

        // Registrar cambio de estado
        await OrderStatusHistory.create({
            orderId: order._id,
            orderNumber: order.orderNumber,
            previousStatus: previousStatus as any,
            newStatus: 'cancelled' as any,
            changedByType: 'customer',
            notes: order.cancelledReason
        });

        console.log(`🚫 Order ${order.orderNumber} cancelled by customer`);

        res.status(200).json({
            success: true,
            message: 'Pedido cancelado correctamente',
            order
        });

    } catch (error) {
        console.error('Error al cancelar pedido:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor'
        });
    }
};

