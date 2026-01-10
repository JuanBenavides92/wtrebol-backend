import { Router } from 'express';
import {
    getTechnicians,
    getTechnicianById,
    createTechnician,
    updateTechnician,
    deleteTechnician,
    getTechnicianAppointments
} from '../controllers/technicianController';
import { isAuthenticated } from '../middlewares/auth';

const router = Router();

/**
 * Todas las rutas requieren autenticación
 */
router.get('/', isAuthenticated, getTechnicians);
router.get('/:id', isAuthenticated, getTechnicianById);
router.post('/', isAuthenticated, createTechnician);
router.put('/:id', isAuthenticated, updateTechnician);
router.delete('/:id', isAuthenticated, deleteTechnician);
router.get('/:id/appointments', isAuthenticated, getTechnicianAppointments);

export default router;
