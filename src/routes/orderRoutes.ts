import { Router } from 'express';
import { createOrder, getMyOrders, getOrderById, updateOrderPaymentStatus, cancelOrder } from '../controllers/ordersController';
import { isCustomerAuthenticated } from '../middlewares/customerAuth';

const router = Router();

/**
 * @route   POST /api/orders
 * @desc    Crear un nuevo pedido
 * @access  Private (Customer)
 */
router.post('/', isCustomerAuthenticated, createOrder);

/**
 * @route   GET /api/orders/my-orders
 * @desc    Obtener pedidos del cliente autenticado
 * @access  Private (Customer)
 */
router.get('/my-orders', isCustomerAuthenticated, getMyOrders);

/**
 * @route   GET /api/orders/:id
 * @desc    Obtener detalle de un pedido
 * @access  Private (Customer)
 */
router.get('/:id', isCustomerAuthenticated, getOrderById);

/**
 * @route   PATCH /api/orders/:id/payment
 * @desc    Actualizar estado de pago de una orden
 * @access  Private (Customer)
 */
router.patch('/:id/payment', isCustomerAuthenticated, updateOrderPaymentStatus);

/**
 * @route   DELETE /api/orders/:id
 * @desc    Cancelar un pedido (solo pending_payment)
 * @access  Private (Customer)
 */
router.delete('/:id', isCustomerAuthenticated, cancelOrder);

export default router;
