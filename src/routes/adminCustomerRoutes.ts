import { Router } from 'express';
import { getAllCustomers, getCustomerById, updateCustomer, deleteCustomer, getCustomerStats } from '../controllers/adminCustomersController';
import { isAuthenticated } from '../middlewares/auth';

const router = Router();

/**
 * Todas las rutas requieren autenticación de admin
 */

/**
 * @route   GET /api/admin/customers/stats
 * @desc    Obtener estadísticas de clientes
 * @access  Private (Admin)
 */
router.get('/stats', isAuthenticated, getCustomerStats);

/**
 * @route   GET /api/admin/customers
 * @desc    Obtener todos los clientes con filtros
 * @access  Private (Admin)
 */
router.get('/', isAuthenticated, getAllCustomers);

/**
 * @route   GET /api/admin/customers/:id
 * @desc    Obtener detalle de un cliente
 * @access  Private (Admin)
 */
router.get('/:id', isAuthenticated, getCustomerById);

/**
 * @route   PUT /api/admin/customers/:id
 * @desc    Actualizar información de un cliente
 * @access  Private (Admin)
 */
router.put('/:id', isAuthenticated, updateCustomer);

/**
 * @route   DELETE /api/admin/customers/:id
 * @desc    Eliminar un cliente
 * @access  Private (Admin)
 */
router.delete('/:id', isAuthenticated, deleteCustomer);

export default router;
