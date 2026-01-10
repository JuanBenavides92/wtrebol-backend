import { Router } from 'express';
import { Request, Response } from 'express';
import Appointment from '../models/Appointment';
import AppointmentSettings from '../models/AppointmentSettings';
import { sendAdminNotification, sendCustomerConfirmation } from '../utils/appointmentNotifications';

const router = Router();

/**
 * GET /api/public/appointment-types
 * Obtener tipos de citas disponibles (público)
 */
router.get('/appointment-types', async (req: Request, res: Response): Promise<void> => {
    try {
        const settings = await AppointmentSettings.findOne();

        if (!settings) {
            res.status(404).json({
                success: false,
                message: 'Configuración no encontrada'
            });
            return;
        }

        // Filtrar solo los tipos habilitados
        const availableTypes = Object.entries(settings.appointmentTypes)
            .filter(([_, config]) => config.enabled)
            .map(([type, config]) => ({
                type,
                duration: config.duration,
                color: config.color,
                price: config.price
            }));

        res.status(200).json({
            success: true,
            data: availableTypes
        });

    } catch (error) {
        console.error('Error al obtener tipos de citas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener tipos de citas'
        });
    }
});

/**
 * GET /api/public/available-slots
 * Obtener slots disponibles para una fecha y tipo de servicio (público)
 */
router.get('/available-slots', async (req: Request, res: Response): Promise<void> => {
    try {
        const { date, serviceType } = req.query;

        if (!date || !serviceType) {
            res.status(400).json({
                success: false,
                message: 'Fecha y tipo de servicio son requeridos'
            });
            return;
        }

        // Obtener configuración
        const settings = await AppointmentSettings.findOne();
        if (!settings) {
            res.status(500).json({
                success: false,
                message: 'Configuración no encontrada'
            });
            return;
        }

        const targetDate = new Date(date as string);
        const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][targetDate.getDay()] as keyof typeof settings.businessHours;
        const businessHours = settings.businessHours[dayOfWeek];

        // Verificar si el día está habilitado
        if (!businessHours.enabled) {
            res.status(200).json({
                success: true,
                data: []
            });
            return;
        }

        // Verificar si es día bloqueado
        const isBlocked = settings.blackoutDates.some(
            blockedDate => blockedDate.toDateString() === targetDate.toDateString()
        );

        if (isBlocked) {
            res.status(200).json({
                success: true,
                data: []
            });
            return;
        }

        // Obtener duración del servicio
        const serviceConfig = settings.appointmentTypes[serviceType as keyof typeof settings.appointmentTypes];

        if (!serviceConfig || !serviceConfig.enabled) {
            res.status(400).json({
                success: false,
                message: 'Tipo de servicio no disponible'
            });
            return;
        }

        const serviceDuration = serviceConfig.duration;

        // Generar slots
        const slots = generateTimeSlots(
            businessHours.start,
            businessHours.end,
            settings.slotInterval,
            serviceDuration,
            settings.bufferTime
        );

        // Obtener citas existentes del día
        const existingAppointments = await Appointment.find({
            scheduledDate: {
                $gte: new Date(targetDate.setHours(0, 0, 0, 0)),
                $lt: new Date(targetDate.setHours(23, 59, 59, 999))
            },
            status: { $nin: ['cancelled', 'no-show'] }
        });

        // Filtrar slots ocupados
        const availableSlots = slots.filter(slot => {
            return !existingAppointments.some(apt => {
                return (
                    (slot.start >= apt.startTime && slot.start < apt.endTime) ||
                    (slot.end > apt.startTime && slot.end <= apt.endTime) ||
                    (slot.start <= apt.startTime && slot.end >= apt.endTime)
                );
            });
        });

        res.status(200).json({
            success: true,
            data: availableSlots
        });

    } catch (error) {
        console.error('Error al obtener slots disponibles:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener slots disponibles'
        });
    }
});

/**
 * POST /api/public/appointments
 * Crear nueva cita (público)
 */
router.post('/appointments', async (req: Request, res: Response): Promise<void> => {
    try {
        const appointmentData = req.body;

        // Validar campos requeridos
        if (!appointmentData.type || !appointmentData.customer || !appointmentData.scheduledDate || !appointmentData.startTime) {
            res.status(400).json({
                success: false,
                message: 'Faltan campos requeridos'
            });
            return;
        }

        // Validar que no haya conflicto de horario
        const targetDate = new Date(appointmentData.scheduledDate);
        const conflict = await Appointment.findOne({
            scheduledDate: {
                $gte: new Date(targetDate.setHours(0, 0, 0, 0)),
                $lt: new Date(targetDate.setHours(23, 59, 59, 999))
            },
            status: { $nin: ['cancelled', 'no-show'] },
            $or: [
                {
                    startTime: { $lte: appointmentData.startTime },
                    endTime: { $gt: appointmentData.startTime }
                },
                {
                    startTime: { $lt: appointmentData.endTime },
                    endTime: { $gte: appointmentData.endTime }
                }
            ]
        });

        if (conflict) {
            res.status(400).json({
                success: false,
                message: 'Este horario ya no está disponible. Por favor selecciona otro.'
            });
            return;
        }

        // Marcar como creado por cliente
        appointmentData.createdBy = 'customer';
        appointmentData.status = 'pending';

        const newAppointment = new Appointment(appointmentData);
        await newAppointment.save();

        // Enviar notificaciones por email
        try {
            console.log('📧 Enviando notificaciones por email...');
            await sendAdminNotification(newAppointment);
            await sendCustomerConfirmation(newAppointment);
            console.log('✅ Emails enviados correctamente');
        } catch (emailError) {
            console.error('❌ Error al enviar emails:', emailError);
            // No fallar la creación de la cita si falla el email
        }

        res.status(201).json({
            success: true,
            message: 'Cita agendada exitosamente. Recibirás un email de confirmación pronto.',
            data: newAppointment
        });

    } catch (error: any) {
        console.error('Error al crear cita:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error al agendar cita'
        });
    }
});

/**
 * Helper: Generar slots de tiempo
 */
function generateTimeSlots(
    start: string,
    end: string,
    interval: number,
    duration: number,
    bufferTime: number = 0
): { start: string; end: string }[] {
    const slots = [];
    let current = timeToMinutes(start);
    const endMinutes = timeToMinutes(end);

    while (current + duration <= endMinutes) {
        const slotStart = minutesToTime(current);
        const slotEnd = minutesToTime(current + duration);
        slots.push({ start: slotStart, end: slotEnd });
        current += interval + bufferTime;
    }

    return slots;
}

function timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

function minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

export default router;
