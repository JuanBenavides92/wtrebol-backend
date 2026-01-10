import { Request, Response } from 'express';
import AppointmentSettings from '../models/AppointmentSettings';

/**
 * GET /api/appointment-settings
 * Obtener configuración
 */
export const getSettings = async (req: Request, res: Response): Promise<void> => {
    try {
        let settings = await AppointmentSettings.findOne();

        // Si no existe, crear configuración por defecto
        if (!settings) {
            settings = new AppointmentSettings({});
            await settings.save();
        }

        res.status(200).json({
            success: true,
            data: settings
        });

    } catch (error) {
        console.error('Error al obtener configuración:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener configuración'
        });
    }
};

/**
 * PUT /api/appointment-settings
 * Actualizar configuración
 */
export const updateSettings = async (req: Request, res: Response): Promise<void> => {
    try {
        const updateData = req.body;

        let settings = await AppointmentSettings.findOne();

        if (!settings) {
            settings = new AppointmentSettings(updateData);
        } else {
            Object.assign(settings, updateData);
        }

        await settings.save();

        res.status(200).json({
            success: true,
            message: 'Configuración actualizada exitosamente',
            data: settings
        });

    } catch (error) {
        console.error('Error al actualizar configuración:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar configuración'
        });
    }
};

/**
 * POST /api/appointment-settings/blackout-date
 * Agregar día bloqueado
 */
export const addBlackoutDate = async (req: Request, res: Response): Promise<void> => {
    try {
        const { date } = req.body;

        if (!date) {
            res.status(400).json({
                success: false,
                message: 'La fecha es requerida'
            });
            return;
        }

        const settings = await AppointmentSettings.findOne();
        if (!settings) {
            res.status(404).json({
                success: false,
                message: 'Configuración no encontrada'
            });
            return;
        }

        settings.blackoutDates.push(new Date(date));
        await settings.save();

        res.status(200).json({
            success: true,
            message: 'Día bloqueado agregado',
            data: settings
        });

    } catch (error) {
        console.error('Error al agregar día bloqueado:', error);
        res.status(500).json({
            success: false,
            message: 'Error al agregar día bloqueado'
        });
    }
};

/**
 * DELETE /api/appointment-settings/blackout-date/:date
 * Eliminar día bloqueado
 */
export const removeBlackoutDate = async (req: Request, res: Response): Promise<void> => {
    try {
        const { date } = req.params;

        const settings = await AppointmentSettings.findOne();
        if (!settings) {
            res.status(404).json({
                success: false,
                message: 'Configuración no encontrada'
            });
            return;
        }

        settings.blackoutDates = settings.blackoutDates.filter(
            d => d.toISOString() !== new Date(date).toISOString()
        );
        await settings.save();

        res.status(200).json({
            success: true,
            message: 'Día bloqueado eliminado',
            data: settings
        });

    } catch (error) {
        console.error('Error al eliminar día bloqueado:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar día bloqueado'
        });
    }
};
