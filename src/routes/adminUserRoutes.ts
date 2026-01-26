import { Router } from 'express';
import { getAllUsers, getUserStats, getUserById, createUser, updateUser, deleteUser } from '../controllers/adminUsersController';
import { isAuthenticated } from '../middlewares/auth';

const router = Router();

/**
 * Todas las rutas requieren autenticación de admin
 */
router.use(isAuthenticated);

/**
 * @route   GET /api/admin/users/stats
 * @desc    Obtener estadísticas de usuarios
 * @access  Private (Admin)
 */
router.get('/stats', getUserStats);

/**
 * @route   GET /api/admin/users
 * @desc    Obtener todos los usuarios con filtros
 * @access  Private (Admin)
 */
router.get('/', getAllUsers);

/**
 * @route   GET /api/admin/users/:id
 * @desc    Obtener un usuario por ID
 * @access  Private (Admin)
 */
router.get('/:id', getUserById);

/**
 * @route   POST /api/admin/users
 * @desc    Crear nuevo usuario
 * @access  Private (Admin)
 */
router.post('/', createUser);

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Actualizar usuario
 * @access  Private (Admin)
 */
router.put('/:id', updateUser);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Eliminar usuario
 * @access  Private (Admin)
 */
router.delete('/:id', deleteUser);

export default router;
