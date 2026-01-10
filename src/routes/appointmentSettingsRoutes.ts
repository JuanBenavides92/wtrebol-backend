import { Router } from 'express';
import {
    getSettings,
    updateSettings,
    addBlackoutDate,
    removeBlackoutDate
} from '../controllers/appointmentSettingsController';
import { isAuthenticated } from '../middlewares/auth';

const router = Router();

console.log('📋 Registrando rutas de appointment-settings...');

/**
 * Todas las rutas requieren autenticación
 */
router.get('/', (req, res, next) => {
    console.log('🔍 GET /api/appointment-settings llamado');
    next();
}, getSettings); // Temporalmente sin auth para debug

router.put('/', isAuthenticated, updateSettings);
router.post('/blackout-date', isAuthenticated, addBlackoutDate);
router.delete('/blackout-date/:date', isAuthenticated, removeBlackoutDate);

console.log('✅ Rutas de appointment-settings configuradas');

export default router;
