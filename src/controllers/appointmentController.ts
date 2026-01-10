import { Request, Response } from 'express';
import Appointment from '../models/Appointment';
import AppointmentSettings from '../models/AppointmentSettings';
import Technician from '../models/Technician';
import { sendAdminNotification, sendCustomerConfirmation } from '../utils/appointmentNotifications';

/**
 * GET /api/appointments
 * Obtener todas las citas con filtros opcionales
 */
export const getAppointments = async (req: Request, res: Response): Promise<void> => {
    try {
        const { date, startDate, endDate, status, type, technician, customer } = req.query;

        // Construir filtro dinámico
        const filter: any = {};

        if (date) {
            // Parse the date string (format: YYYY-MM-DD) and create date range in local timezone
            const [year, month, day] = (date as string).split('-').map(Number);

            // Create start of day (00:00:00.000)
            const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);

            // Create end of day (23:59:59.999)
            const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);

            filter.scheduledDate = {
                $gte: startOfDay,
                $lt: endOfDay
            };
        }

        if (startDate && endDate) {
            filter.scheduledDate = {
                $gte: new Date(startDate as string),
                $lte: new Date(endDate as string)
            };
        }

        if (status) filter.status = status;
        if (type) filter.type = type;
        if (technician) filter['technician.id'] = technician;
        if (customer) {
            filter.$or = [
                { 'customer.email': customer },
                { 'customer.phone': customer }
            ];
        }

        const appointments = await Appointment.find(filter)
            .sort({ scheduledDate: 1, startTime: 1 });

        res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments
        });

    } catch (error) {
        console.error('Error al obtener citas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener citas'
        });
    }
};

/**
 * GET /api/appointments/:id
 * Obtener una cita por ID
 */
export const getAppointmentById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const appointment = await Appointment.findById(id);

        if (!appointment) {
            res.status(404).json({
                success: false,
                message: 'Cita no encontrada'
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: appointment
        });

    } catch (error) {
        console.error('Error al obtener cita:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener cita'
        });
    }
};

/**
 * POST /api/appointments
 * Crear nueva cita
 */
export const createAppointment = async (req: Request, res: Response): Promise<void> => {
    try {
        const appointmentData = req.body;

        // Validar que no haya conflicto de horario con otras citas
        const conflict = await Appointment.findOne({
            scheduledDate: appointmentData.scheduledDate,
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
                message: 'Ya existe una cita en este horario',
                conflictType: 'appointment'
            });
            return;
        }

        // Validar que no haya conflicto con bloques de tiempo
        const TimeBlock = (await import('../models/TimeBlock')).default;
        const blockConflict = await TimeBlock.findOne({
            scheduledDate: appointmentData.scheduledDate,
            $or: [
                {
                    startTime: { $lt: appointmentData.endTime },
                    endTime: { $gt: appointmentData.startTime }
                }
            ]
        });

        if (blockConflict) {
            res.status(400).json({
                success: false,
                message: `Este horario está bloqueado: ${blockConflict.title}`,
                conflictType: 'time-block',
                conflict: {
                    title: blockConflict.title,
                    time: `${blockConflict.startTime} - ${blockConflict.endTime}`
                }
            });
            return;
        }

        const newAppointment = new Appointment(appointmentData);
        await newAppointment.save();

        // Enviar notificaciones por email
        try {
            await sendAdminNotification(newAppointment);
            await sendCustomerConfirmation(newAppointment);
        } catch (emailError) {
            console.error('Error al enviar emails:', emailError);
            // No fallar la creación de la cita si falla el email
        }

        res.status(201).json({
            success: true,
            message: 'Cita creada exitosamente',
            data: newAppointment
        });

    } catch (error: any) {
        console.error('Error al crear cita:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error al crear cita'
        });
    }
};

/**
 * PUT /api/appointments/:id
 * Actualizar cita
 */
export const updateAppointment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const appointment = await Appointment.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!appointment) {
            res.status(404).json({
                success: false,
                message: 'Cita no encontrada'
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Cita actualizada exitosamente',
            data: appointment
        });

    } catch (error) {
        console.error('Error al actualizar cita:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar cita'
        });
    }
};

/**
 * DELETE /api/appointments/:id
 * Eliminar cita
 */
export const deleteAppointment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const appointment = await Appointment.findByIdAndDelete(id);

        if (!appointment) {
            res.status(404).json({
                success: false,
                message: 'Cita no encontrada'
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Cita eliminada exitosamente'
        });

    } catch (error) {
        console.error('Error al eliminar cita:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar cita'
        });
    }
};

/**
 * GET /api/appointments/available-slots
 * Obtener slots disponibles para una fecha y tipo de servicio
 */
export const getAvailableSlots = async (req: Request, res: Response): Promise<void> => {
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
        const serviceDuration = settings.appointmentTypes[serviceType as keyof typeof settings.appointmentTypes].duration;

        // Generar slots
        const slots = generateTimeSlots(
            businessHours.start,
            businessHours.end,
            settings.slotInterval,
            serviceDuration
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
};

/**
 * Helper: Generar slots de tiempo
 */
function generateTimeSlots(start: string, end: string, interval: number, duration: number): { start: string; end: string }[] {
    const slots = [];
    let current = timeToMinutes(start);
    const endMinutes = timeToMinutes(end);

    while (current + duration <= endMinutes) {
        const slotStart = minutesToTime(current);
        const slotEnd = minutesToTime(current + duration);
        slots.push({ start: slotStart, end: slotEnd });
        current += interval;
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
