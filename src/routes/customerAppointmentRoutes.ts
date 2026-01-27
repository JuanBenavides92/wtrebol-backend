import { Router, Request, Response } from 'express';
import { isCustomerAuthenticated } from '../middlewares/customerAuth';
import Appointment from '../models/Appointment';

const router = Router();

/**
 * @route   GET /api/customers/my-appointments
 * @desc    Obtener todas las citas del cliente autenticado
 * @access  Private (Customer)
 */
router.get('/my-appointments', isCustomerAuthenticated, async (req: Request, res: Response): Promise<void> => {
    try {
        // Obtener el email del cliente de la sesión
        const customerEmail = req.session.customerEmail;

        if (!customerEmail) {
            res.status(401).json({
                success: false,
                message: 'No autenticado'
            });
            return;
        }

        // Buscar todas las citas del cliente por email
        const appointments = await Appointment.find({
            'customer.email': customerEmail
        })
            .sort({ scheduledDate: -1, createdAt: -1 }) // Más recientes primero
            .lean();

        res.status(200).json({
            success: true,
            count: appointments.length,
            appointments
        });

    } catch (error) {
        console.error('Error al obtener citas del cliente:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener las citas'
        });
    }
});

/**
 * @route   GET /api/customers/my-appointments/:id
 * @desc    Obtener detalle de una cita específica del cliente
 * @access  Private (Customer)
 */
router.get('/my-appointments/:id', isCustomerAuthenticated, async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const customerEmail = req.session.customerEmail;

        if (!customerEmail) {
            res.status(401).json({
                success: false,
                message: 'No autenticado'
            });
            return;
        }

        // Buscar la cita y verificar que pertenece al cliente
        const appointment = await Appointment.findOne({
            _id: id,
            'customer.email': customerEmail
        }).lean();

        if (!appointment) {
            res.status(404).json({
                success: false,
                message: 'Cita no encontrada'
            });
            return;
        }

        res.status(200).json({
            success: true,
            appointment
        });

    } catch (error) {
        console.error('Error al obtener detalle de cita:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener la cita'
        });
    }
});

export default router;
