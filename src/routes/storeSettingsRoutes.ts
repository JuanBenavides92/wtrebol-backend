import { Router } from 'express';
import {
    getStoreSettings,
    updateStoreSettings,
    getPublicStoreSettings
} from '../controllers/storeSettingsController';

const router = Router();

/**
 * Rutas públicas (sin autenticación)
 */
router.get('/public', getPublicStoreSettings);

/**
 * Rutas de administrador (requieren autenticación)
 * TODO: Agregar middleware de autenticación admin
 */
router.get('/', getStoreSettings);
router.put('/', updateStoreSettings);

export default router;
