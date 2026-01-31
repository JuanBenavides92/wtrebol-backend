import { Router } from 'express';
import {
    getContentByType,
    getContentById,
    createContent,
    updateContent,
    deleteContent,
    getProductBySlug,
    getRelatedProducts,
    getFeaturedProducts,
    toggleFeatured
} from '../controllers/contentController';
import { generateSlugs } from '../controllers/slugController';
import { isAuthenticated } from '../middlewares/auth';

const router = Router();

/**
 * @route   POST /api/content/generate-slugs
 * @desc    Generate slugs for all products without them
 * @access  Private (admin only)
 */
router.post('/generate-slugs', isAuthenticated, generateSlugs);

/**
 * @route   GET /api/content/featured
 * @desc    Obtener productos destacados para la landing page (máximo 3)
 * @access  Public
 * IMPORTANTE: Debe estar ANTES de /:type para que no sea capturado por esa ruta
 */
router.get('/featured', getFeaturedProducts);

/**
 * @route   GET /api/content/product/slug/:slug
 * @desc    Obtener producto por slug
 * @access  Public
 * IMPORTANTE: Debe estar ANTES de /:type para que no sea capturado por esa ruta
 */
router.get('/product/slug/:slug', getProductBySlug);

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

/**
 * @route   GET /api/content/:id/related
 * @desc    Obtener productos relacionados
 * @access  Public
 */
router.get('/:id/related', getRelatedProducts);

/**
 * @route   PATCH /api/content/:id/toggle-featured
 * @desc    Toggle featured status de un producto
 * @access  Private (requiere autenticación)
 */
router.patch('/:id/toggle-featured', isAuthenticated, toggleFeatured);

export default router;

