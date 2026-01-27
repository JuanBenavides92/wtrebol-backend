import { Router } from 'express';
import { unifiedLogin, login, logout, getCurrentUser } from '../controllers/authController';
import { isAuthenticated } from '../middlewares/auth';

const router = Router();

/**
 * @route   POST /api/auth/login
 * @desc    Autenticar usuario o cliente (Unified Login)
 * @access  Public
 */
router.post('/login', unifiedLogin);

/**
 * @route   POST /api/auth/logout
 * @desc    Cerrar sesión
 * @access  Private
 */
router.post('/logout', isAuthenticated, logout);

/**
 * @route   GET /api/auth/me
 * @desc    Obtener usuario actual
 * @access  Private
 */
router.get('/me', isAuthenticated, getCurrentUser);

export default router;
