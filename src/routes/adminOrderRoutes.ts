import { Router } from 'express';
import { getAllOrders, getOrderById, updateOrderStatus, getOrderStats } from '../controllers/adminOrdersController';
import { isAuthenticated } from '../middlewares/auth';

const router = Router();

/**
 * Todas las rutas requieren autenticación de admin
 */

/**
 * @route   GET /api/admin/orders/stats
 * @desc    Obtener estadísticas de pedidos
 * @access  Private (Admin)
 */
router.get('/stats', isAuthenticated, getOrderStats);

/**
 * @route   GET /api/admin/orders
 * @desc    Obtener todos los pedidos con filtros
 * @access  Private (Admin)
 */
router.get('/', isAuthenticated, getAllOrders);

/**
 * @route   GET /api/admin/orders/:id
 * @desc    Obtener detalle de un pedido
 * @access  Private (Admin)
 */
router.get('/:id', isAuthenticated, getOrderById);

/**
 * @route   PUT /api/admin/orders/:id/status
 * @desc    Cambiar estado de un pedido
 * @access  Private (Admin)
 */
router.put('/:id/status', isAuthenticated, updateOrderStatus);

export default router;
