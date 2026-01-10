import { Request, Response } from 'express';
import Technician from '../models/Technician';
import Appointment from '../models/Appointment';

/**
 * GET /api/technicians
 * Obtener todos los técnicos
 */
export const getTechnicians = async (req: Request, res: Response): Promise<void> => {
    try {
        const { active } = req.query;

        const filter: any = {};
        if (active === 'true') filter.isActive = true;

        const technicians = await Technician.find(filter).sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: technicians.length,
            data: technicians
        });

    } catch (error) {
        console.error('Error al obtener técnicos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener técnicos'
        });
    }
};

/**
 * GET /api/technicians/:id
 * Obtener técnico por ID
 */
export const getTechnicianById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const technician = await Technician.findById(id);

        if (!technician) {
            res.status(404).json({
                success: false,
                message: 'Técnico no encontrado'
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: technician
        });

    } catch (error) {
        console.error('Error al obtener técnico:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener técnico'
        });
    }
};

/**
 * POST /api/technicians
 * Crear nuevo técnico
 */
export const createTechnician = async (req: Request, res: Response): Promise<void> => {
    try {
        const technicianData = req.body;

        const newTechnician = new Technician(technicianData);
        await newTechnician.save();

        res.status(201).json({
            success: true,
            message: 'Técnico creado exitosamente',
            data: newTechnician
        });

    } catch (error: any) {
        console.error('Error al crear técnico:', error);

        if (error.code === 11000) {
            res.status(400).json({
                success: false,
                message: 'El email ya está registrado'
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: error.message || 'Error al crear técnico'
        });
    }
};

/**
 * PUT /api/technicians/:id
 * Actualizar técnico
 */
export const updateTechnician = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const technician = await Technician.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!technician) {
            res.status(404).json({
                success: false,
                message: 'Técnico no encontrado'
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Técnico actualizado exitosamente',
            data: technician
        });

    } catch (error) {
        console.error('Error al actualizar técnico:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar técnico'
        });
    }
};

/**
 * DELETE /api/technicians/:id
 * Eliminar técnico
 */
export const deleteTechnician = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const technician = await Technician.findByIdAndDelete(id);

        if (!technician) {
            res.status(404).json({
                success: false,
                message: 'Técnico no encontrado'
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Técnico eliminado exitosamente'
        });

    } catch (error) {
        console.error('Error al eliminar técnico:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar técnico'
        });
    }
};

/**
 * GET /api/technicians/:id/appointments
 * Obtener citas de un técnico
 */
export const getTechnicianAppointments = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const appointments = await Appointment.find({
            'technician.id': id
        }).sort({ scheduledDate: 1, startTime: 1 });

        res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments
        });

    } catch (error) {
        console.error('Error al obtener citas del técnico:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener citas del técnico'
        });
    }
};
