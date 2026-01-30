import { Router } from 'express';
import { getSiteConfig, updateSiteConfig } from '../controllers/siteConfigController';
import { upload } from '../middlewares/upload';
import { isAuthenticated } from '../middlewares/auth';

const router = Router();

/**
 * GET /api/config/site
 * Obtener configuración del sitio (público)
 */
router.get('/site', getSiteConfig);

/**
 * POST /api/config/site
 * Actualizar configuración del sitio (admin, con upload de logo)
 */
router.post('/site', isAuthenticated, upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'favicon', maxCount: 1 }
]), updateSiteConfig);

export default router;
