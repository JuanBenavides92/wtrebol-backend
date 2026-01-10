import { Request, Response } from 'express';
import TimeBlock from '../models/TimeBlock';
import Appointment from '../models/Appointment';

/**
 * GET /api/time-blocks
 * Obtener todos los bloques de tiempo con filtros opcionales
 */
export const getTimeBlocks = async (req: Request, res: Response): Promise<void> => {
    try {
        const { date, startDate, endDate, blockType } = req.query;

        // Construir filtro dinámico
        const filter: any = {};

        if (date) {
            // Filtrar por fecha específica
            const [year, month, day] = (date as string).split('-').map(Number);
            const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
            const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);

            filter.scheduledDate = {
                $gte: startOfDay,
                $lt: endOfDay
            };
        }

        if (startDate && endDate) {
            // Filtrar por rango de fechas
            filter.scheduledDate = {
                $gte: new Date(startDate as string),
                $lte: new Date(endDate as string)
            };
        }

        if (blockType) {
            filter.blockType = blockType;
        }

        const timeBlocks = await TimeBlock.find(filter)
            .populate('createdBy', 'name email')
            .sort({ scheduledDate: 1, startTime: 1 });

        res.status(200).json({
            success: true,
            count: timeBlocks.length,
            data: timeBlocks
        });

    } catch (error) {
        console.error('Error al obtener bloques de tiempo:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener bloques de tiempo'
        });
    }
};

/**
 * GET /api/time-blocks/:id
 * Obtener un bloqueo de tiempo por ID
 */
export const getTimeBlockById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const timeBlock = await TimeBlock.findById(id)
            .populate('createdBy', 'name email');

        if (!timeBlock) {
            res.status(404).json({
                success: false,
                message: 'Bloqueo de tiempo no encontrado'
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: timeBlock
        });

    } catch (error) {
        console.error('Error al obtener bloqueo de tiempo:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener bloqueo de tiempo'
        });
    }
};

/**
 * POST /api/time-blocks
 * Crear nuevo bloqueo de tiempo
 */
export const createTimeBlock = async (req: Request, res: Response): Promise<void> => {
    try {
        const blockData = req.body;

        // Validar que startTime sea menor que endTime
        const timeToMinutes = (time: string): number => {
            const [hours, minutes] = time.split(':').map(Number);
            return hours * 60 + minutes;
        };

        const startMinutes = timeToMinutes(blockData.startTime);
        const endMinutes = timeToMinutes(blockData.endTime);

        if (startMinutes >= endMinutes) {
            res.status(400).json({
                success: false,
                message: 'La hora de inicio debe ser anterior a la hora de fin'
            });
            return;
        }

        // Validar que no haya conflicto con citas existentes
        const appointmentConflict = await Appointment.findOne({
            scheduledDate: blockData.scheduledDate,
            status: { $nin: ['cancelled', 'no-show'] },
            $or: [
                {
                    startTime: { $lt: blockData.endTime },
                    endTime: { $gt: blockData.startTime }
                }
            ]
        });

        if (appointmentConflict) {
            res.status(400).json({
                success: false,
                message: 'Ya existe una cita en este horario',
                conflictType: 'appointment',
                conflict: {
                    id: appointmentConflict._id,
                    customer: appointmentConflict.customer.name,
                    time: `${appointmentConflict.startTime} - ${appointmentConflict.endTime}`
                }
            });
            return;
        }

        // Validar que no haya conflicto con otros bloques
        const blockConflict = await TimeBlock.findOne({
            scheduledDate: blockData.scheduledDate,
            $or: [
                {
                    startTime: { $lt: blockData.endTime },
                    endTime: { $gt: blockData.startTime }
                }
            ]
        });

        if (blockConflict) {
            res.status(400).json({
                success: false,
                message: 'Ya existe un bloqueo en este horario',
                conflictType: 'time-block',
                conflict: {
                    id: blockConflict._id,
                    title: blockConflict.title,
                    time: `${blockConflict.startTime} - ${blockConflict.endTime}`
                }
            });
            return;
        }

        // Crear el bloqueo
        const newTimeBlock = new TimeBlock(blockData);
        await newTimeBlock.save();

        res.status(201).json({
            success: true,
            message: 'Bloqueo de tiempo creado exitosamente',
            data: newTimeBlock
        });

    } catch (error: any) {
        console.error('Error al crear bloqueo de tiempo:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error al crear bloqueo de tiempo'
        });
    }
};

/**
 * PUT /api/time-blocks/:id
 * Actualizar bloqueo de tiempo
 */
export const updateTimeBlock = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Si se está actualizando la fecha/hora, validar conflictos
        if (updateData.scheduledDate || updateData.startTime || updateData.endTime) {
            const currentBlock = await TimeBlock.findById(id);
            if (!currentBlock) {
                res.status(404).json({
                    success: false,
                    message: 'Bloqueo de tiempo no encontrado'
                });
                return;
            }

            const checkDate = updateData.scheduledDate || currentBlock.scheduledDate;
            const checkStartTime = updateData.startTime || currentBlock.startTime;
            const checkEndTime = updateData.endTime || currentBlock.endTime;

            // Validar conflictos con citas
            const appointmentConflict = await Appointment.findOne({
                scheduledDate: checkDate,
                status: { $nin: ['cancelled', 'no-show'] },
                $or: [
                    {
                        startTime: { $lt: checkEndTime },
                        endTime: { $gt: checkStartTime }
                    }
                ]
            });

            if (appointmentConflict) {
                res.status(400).json({
                    success: false,
                    message: 'Conflicto con cita existente',
                    conflictType: 'appointment'
                });
                return;
            }

            // Validar conflictos con otros bloques (excluyendo el actual)
            const blockConflict = await TimeBlock.findOne({
                _id: { $ne: id },
                scheduledDate: checkDate,
                $or: [
                    {
                        startTime: { $lt: checkEndTime },
                        endTime: { $gt: checkStartTime }
                    }
                ]
            });

            if (blockConflict) {
                res.status(400).json({
                    success: false,
                    message: 'Conflicto con otro bloqueo',
                    conflictType: 'time-block'
                });
                return;
            }
        }

        const timeBlock = await TimeBlock.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!timeBlock) {
            res.status(404).json({
                success: false,
                message: 'Bloqueo de tiempo no encontrado'
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Bloqueo de tiempo actualizado exitosamente',
            data: timeBlock
        });

    } catch (error: any) {
        console.error('Error al actualizar bloqueo de tiempo:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error al actualizar bloqueo de tiempo'
        });
    }
};

/**
 * DELETE /api/time-blocks/:id
 * Eliminar bloqueo de tiempo
 */
export const deleteTimeBlock = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const timeBlock = await TimeBlock.findByIdAndDelete(id);

        if (!timeBlock) {
            res.status(404).json({
                success: false,
                message: 'Bloqueo de tiempo no encontrado'
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Bloqueo de tiempo eliminado exitosamente'
        });

    } catch (error) {
        console.error('Error al eliminar bloqueo de tiempo:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar bloqueo de tiempo'
        });
    }
};

/**
 * POST /api/time-blocks/check-conflict
 * Verificar si hay conflictos en un horario específico
 */
export const checkConflict = async (req: Request, res: Response): Promise<void> => {
    try {
        const { scheduledDate, startTime, endTime, excludeId } = req.body;

        // Validar parámetros requeridos
        if (!scheduledDate || !startTime || !endTime) {
            res.status(400).json({
                success: false,
                message: 'Fecha, hora de inicio y hora de fin son requeridos'
            });
            return;
        }

        // Verificar conflictos con citas
        const appointmentConflict = await Appointment.findOne({
            scheduledDate: new Date(scheduledDate),
            status: { $nin: ['cancelled', 'no-show'] },
            $or: [
                {
                    startTime: { $lt: endTime },
                    endTime: { $gt: startTime }
                }
            ]
        });

        // Verificar conflictos con bloques
        const blockFilter: any = {
            scheduledDate: new Date(scheduledDate),
            $or: [
                {
                    startTime: { $lt: endTime },
                    endTime: { $gt: startTime }
                }
            ]
        };

        if (excludeId) {
            blockFilter._id = { $ne: excludeId };
        }

        const blockConflict = await TimeBlock.findOne(blockFilter);

        const hasConflict = !!(appointmentConflict || blockConflict);

        res.status(200).json({
            success: true,
            hasConflict,
            conflictType: appointmentConflict ? 'appointment' : blockConflict ? 'time-block' : null,
            conflict: appointmentConflict || blockConflict || null
        });

    } catch (error) {
        console.error('Error al verificar conflictos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al verificar conflictos'
        });
    }
};
