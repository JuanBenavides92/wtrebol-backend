import { Router } from 'express';
import {
    getContentByType,
    getContentById,
    createContent,
    updateContent,
    deleteContent
} from '../controllers/contentController';
import { isAuthenticated } from '../middlewares/auth';

const router = Router();

/**
 * @route   GET /api/content/:type
 * @desc    Obtener contenido por tipo (slide, product, service, setting)
 * @access  Public
 * @query   ?active=true (opcional, filtrar solo activos)
 */
router.get('/:type', getContentByType);

/**
 * @route   GET /api/content/item/:id
 * @desc    Obtener contenido por ID
 * @access  Public
 */
router.get('/item/:id', getContentById);

/**
 * @route   POST /api/content
 * @desc    Crear nuevo contenido
 * @access  Private (requiere autenticación)
 */
router.post('/', isAuthenticated, createContent);

/**
 * @route   PUT /api/content/:id
 * @desc    Actualizar contenido
 * @access  Private (requiere autenticación)
 */
router.put('/:id', isAuthenticated, updateContent);

/**
 * @route   DELETE /api/content/:id
 * @desc    Eliminar contenido
 * @access  Private (requiere autenticación)
 */
router.delete('/:id', isAuthenticated, deleteContent);

export default router;
