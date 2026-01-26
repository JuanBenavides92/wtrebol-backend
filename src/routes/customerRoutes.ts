import { Router } from 'express';
import { register, login, logout, getCurrentCustomer, updateProfile } from '../controllers/customerAuthController';
import { isCustomerAuthenticated } from '../middlewares/customerAuth';

const router = Router();

/**
 * @route   POST /api/customers/register
 * @desc    Registrar nuevo cliente
 * @access  Public
 */
router.post('/register', register);

/**
 * @route   POST /api/customers/login
 * @desc    Autenticar cliente
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   POST /api/customers/logout
 * @desc    Cerrar sesión de cliente
 * @access  Private (Customer)
 */
router.post('/logout', logout);

/**
 * @route   GET /api/customers/me
 * @desc    Obtener cliente actual
 * @access  Private (Customer)
 */
router.get('/me', isCustomerAuthenticated, getCurrentCustomer);

/**
 * @route   PUT /api/customers/me
 * @desc    Actualizar perfil de cliente
 * @access  Private (Customer)
 */
router.put('/me', isCustomerAuthenticated, updateProfile);

export default router;
