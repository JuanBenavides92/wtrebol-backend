import { Request, Response } from 'express';
import ProductOption from '../models/ProductOption';

/**
 * Get all options by type
 * GET /api/product-options/:type
 */
export const getOptionsByType = async (req: Request, res: Response): Promise<void> => {
    try {
        const { type } = req.params;
        const active = Array.isArray(req.query.active) ? req.query.active[0] : req.query.active;

        // Validar tipo
        const validTypes = ['category', 'btu', 'condition'] as const;
        if (!validTypes.includes(type as any)) {
            res.status(400).json({
                success: false,
                message: 'Tipo inválido. Debe ser: category, btu o condition',
            });
            return;
        }

        const filter: any = { type };
        if (active === 'true') {
            filter.isActive = true;
        }

        const options = await ProductOption.find(filter).sort({ label: 1 });

        res.status(200).json({
            success: true,
            count: options.length,
            data: options,
        });
    } catch (error) {
        console.error('Error al obtener opciones:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener opciones',
        });
    }
};

/**
 * Create new option
 * POST /api/product-options
 */
export const createOption = async (req: Request, res: Response): Promise<void> => {
    try {
        const { type, value, label } = req.body;

        // Validaciones
        if (!type || !value || !label) {
            res.status(400).json({
                success: false,
                message: 'Tipo, valor y etiqueta son requeridos',
            });
            return;
        }

        if (!['category', 'btu', 'condition'].includes(type)) {
            res.status(400).json({
                success: false,
                message: 'Tipo inválido',
            });
            return;
        }

        // Verificar si ya existe
        const existing = await ProductOption.findOne({ type, value });
        if (existing) {
            res.status(409).json({
                success: false,
                message: 'Esta opción ya existe',
            });
            return;
        }

        const option = await ProductOption.create({
            type,
            value,
            label,
            isActive: true,
            usageCount: 0,
        });

        res.status(201).json({
            success: true,
            data: option,
        });
    } catch (error) {
        console.error('Error al crear opción:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear opción',
        });
    }
};

/**
 * Update option
 * PUT /api/product-options/:id
 */
export const updateOption = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { label, isActive } = req.body;

        const option = await ProductOption.findById(id);
        if (!option) {
            res.status(404).json({
                success: false,
                message: 'Opción no encontrada',
            });
            return;
        }

        if (label) option.label = label;
        if (typeof isActive === 'boolean') option.isActive = isActive;

        await option.save();

        res.status(200).json({
            success: true,
            data: option,
        });
    } catch (error) {
        console.error('Error al actualizar opción:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar opción',
        });
    }
};

/**
 * Delete option (only if not in use)
 * DELETE /api/product-options/:id
 */
export const deleteOption = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const option = await ProductOption.findById(id);
        if (!option) {
            res.status(404).json({
                success: false,
                message: 'Opción no encontrada',
            });
            return;
        }

        // Verificar si está en uso
        if (option.usageCount > 0) {
            res.status(409).json({
                success: false,
                message: `No se puede eliminar. ${option.usageCount} producto(s) usan esta opción`,
            });
            return;
        }

        await ProductOption.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Opción eliminada correctamente',
        });
    } catch (error) {
        console.error('Error al eliminar opción:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar opción',
        });
    }
};

/**
 * Increment usage count
 * POST /api/product-options/:id/increment
 */
export const incrementUsage = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const option = await ProductOption.findByIdAndUpdate(
            id,
            { $inc: { usageCount: 1 } },
            { new: true }
        );

        if (!option) {
            res.status(404).json({
                success: false,
                message: 'Opción no encontrada',
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: option,
        });
    } catch (error) {
        console.error('Error al incrementar uso:', error);
        res.status(500).json({
            success: false,
            message: 'Error al incrementar uso',
        });
    }
};

/**
 * Decrement usage count
 * POST /api/product-options/:id/decrement
 */
export const decrementUsage = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const option = await ProductOption.findById(id);
        if (!option) {
            res.status(404).json({
                success: false,
                message: 'Opción no encontrada',
            });
            return;
        }

        if (option.usageCount > 0) {
            option.usageCount -= 1;
            await option.save();
        }

        res.status(200).json({
            success: true,
            data: option,
        });
    } catch (error) {
        console.error('Error al decrementar uso:', error);
        res.status(500).json({
            success: false,
            message: 'Error al decrementar uso',
        });
    }
};
