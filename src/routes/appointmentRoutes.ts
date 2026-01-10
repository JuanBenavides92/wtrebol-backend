import { Router } from 'express';
import {
    getAppointments,
    getAppointmentById,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    getAvailableSlots
} from '../controllers/appointmentController';
import { isAuthenticated } from '../middlewares/auth';

const router = Router();

/**
 * Rutas públicas (sin autenticación)
 */
router.get('/available-slots', getAvailableSlots);

/**
 * Rutas protegidas (requieren autenticación)
 */
router.get('/', getAppointments); // Temporalmente sin auth para que funcione el calendario
router.get('/:id', getAppointmentById); // Temporalmente sin auth
router.post('/', isAuthenticated, createAppointment);
router.put('/:id', isAuthenticated, updateAppointment);
router.delete('/:id', isAuthenticated, deleteAppointment);

export default router;
