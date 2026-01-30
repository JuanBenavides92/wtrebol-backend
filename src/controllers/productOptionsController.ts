import { Request, Response } from 'express';
import ProductOption from '../models/ProductOption';
import Content from '../models/Content';

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

        // Normalize value (lowercase and trim)
        const normalizedValue = value.toLowerCase().trim();
        const normalizedLabel = label.trim();

        // Check for duplicate (case-insensitive)
        const existingOption = await ProductOption.findOne({
            type,
            value: { $regex: new RegExp(`^${normalizedValue}$`, 'i') }
        });

        if (existingOption) {
            res.status(409).json({
                success: false,
                message: `Ya existe una opción "${existingOption.label}" con este valor`,
                duplicate: true,
                existing: {
                    _id: existingOption._id,
                    label: existingOption.label,
                    value: existingOption.value,
                    isActive: existingOption.isActive
                }
            });
            return;
        }

        const option = await ProductOption.create({
            type,
            value: normalizedValue,
            label: normalizedLabel,
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
 * Get option usage (which products use this option)
 * GET /api/product-options/:id/usage
 */
export const getOptionUsage = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        console.log(`🔍 [getOptionUsage] Checking usage for option: ${id}`);

        const option = await ProductOption.findById(id);
        if (!option) {
            console.warn(`⚠️ [getOptionUsage] Option not found: ${id}`);
            res.status(404).json({
                success: false,
                message: 'Opción no encontrada',
            });
            return;
        }

        console.log(`📋 [getOptionUsage] Option details:`, {
            type: option.type,
            value: option.value,
            label: option.label
        });

        // Determinar el campo a buscar según el tipo
        const fieldMap: Record<string, string> = {
            'category': 'category',
            'btu': 'btuCapacity',
            'condition': 'condition'
        };

        const field = fieldMap[option.type];
        if (!field) {
            console.error(`❌ [getOptionUsage] Invalid option type: ${option.type}`);
            res.status(400).json({
                success: false,
                message: 'Tipo de opción inválido',
            });
            return;
        }

        // Buscar productos que usan esta opción
        let query: any = { type: 'product' };

        // Para BTU, buscar por el valor numérico
        if (option.type === 'btu') {
            try {
                // Ensure option.value is a string and extract numeric value
                const valueStr = String(option.value || '');
                const numericValue = parseInt(valueStr.replace(/\D/g, ''), 10);

                if (isNaN(numericValue)) {
                    console.warn(`⚠️ [getOptionUsage] Invalid BTU value: ${option.value}`);
                    // Return empty usage instead of error
                    res.status(200).json({
                        success: true,
                        count: 0,
                        products: [],
                        option: {
                            id: option._id,
                            type: option.type,
                            value: option.value,
                            label: option.label
                        }
                    });
                    return;
                }

                query[field] = numericValue;
                console.log(`🔢 [getOptionUsage] Searching for BTU: ${numericValue}`);
            } catch (parseError) {
                console.error(`❌ [getOptionUsage] Error parsing BTU value:`, parseError);
                // Return empty usage instead of error
                res.status(200).json({
                    success: true,
                    count: 0,
                    products: [],
                    option: {
                        id: option._id,
                        type: option.type,
                        value: option.value,
                        label: option.label
                    }
                });
                return;
            }
        } else {
            query[field] = option.value;
            console.log(`🔍 [getOptionUsage] Searching for ${field}: ${option.value}`);
        }

        const products = await Content.find(query)
            .select('_id title slug imageUrl')
            .limit(50); // Limitar a 50 para no sobrecargar

        console.log(`✅ [getOptionUsage] Found ${products.length} products using this option`);

        res.status(200).json({
            success: true,
            count: products.length,
            products: products,
            option: {
                id: option._id,
                type: option.type,
                value: option.value,
                label: option.label
            }
        });
    } catch (error) {
        console.error('❌ [getOptionUsage] Error al obtener uso de opción:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener uso de opción',
            error: error instanceof Error ? error.message : 'Unknown error'
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

        console.log(`🗑️ [deleteOption] Attempting to delete option: ${id}`);

        const option = await ProductOption.findById(id);
        if (!option) {
            console.warn(`⚠️ [deleteOption] Option not found: ${id}`);
            res.status(404).json({
                success: false,
                message: 'Opción no encontrada',
            });
            return;
        }

        console.log(`📋 [deleteOption] Option details:`, {
            type: option.type,
            value: option.value,
            label: option.label
        });

        // Verificar si está en uso en productos reales
        const fieldMap: Record<string, string> = {
            'category': 'category',
            'btu': 'btuCapacity',
            'condition': 'condition'
        };

        const field = fieldMap[option.type];
        if (!field) {
            console.error(`❌ [deleteOption] Invalid option type: ${option.type}`);
            res.status(400).json({
                success: false,
                message: 'Tipo de opción inválido',
            });
            return;
        }

        let query: any = { type: 'product' };

        if (option.type === 'btu') {
            try {
                // Ensure option.value is a string and extract numeric value
                const valueStr = String(option.value || '');
                const numericValue = parseInt(valueStr.replace(/\D/g, ''), 10);

                if (isNaN(numericValue)) {
                    console.warn(`⚠️ [deleteOption] Invalid BTU value, allowing deletion: ${option.value}`);
                    // If value is invalid, it can't be in use, so allow deletion
                    await ProductOption.findByIdAndDelete(id);
                    res.status(200).json({
                        success: true,
                        message: 'Opción eliminada correctamente',
                    });
                    return;
                }

                query[field] = numericValue;
                console.log(`🔢 [deleteOption] Checking BTU usage: ${numericValue}`);
            } catch (parseError) {
                console.error(`❌ [deleteOption] Error parsing BTU value:`, parseError);
                // If we can't parse it, it can't be in use, so allow deletion
                await ProductOption.findByIdAndDelete(id);
                res.status(200).json({
                    success: true,
                    message: 'Opción eliminada correctamente',
                });
                return;
            }
        } else {
            query[field] = option.value;
            console.log(`🔍 [deleteOption] Checking usage for ${field}: ${option.value}`);
        }

        console.log('🔍 [deleteOption] Verificando uso de opción:', {
            optionId: id,
            optionType: option.type,
            optionValue: option.value,
            field: field,
            query: JSON.stringify(query)
        });

        const usageCount = await Content.countDocuments(query);

        console.log('📊 [deleteOption] Resultado de búsqueda:', {
            usageCount,
            canDelete: usageCount === 0
        });

        if (usageCount > 0) {
            // Obtener algunos productos de ejemplo
            const sampleProducts = await Content.find(query)
                .select('title')
                .limit(3);

            const productTitles = sampleProducts.map(p => p.title).join(', ');

            console.warn(`⚠️ [deleteOption] Cannot delete - in use by ${usageCount} products`);
            res.status(409).json({
                success: false,
                message: `No se puede eliminar. ${usageCount} producto(s) usan esta opción`,
                usageCount,
                sampleProducts: productTitles
            });
            return;
        }

        await ProductOption.findByIdAndDelete(id);

        console.log(`✅ [deleteOption] Option deleted successfully: ${option.label}`);
        res.status(200).json({
            success: true,
            message: 'Opción eliminada correctamente',
        });
    } catch (error) {
        console.error('❌ [deleteOption] Error al eliminar opción:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar opción',
            error: error instanceof Error ? error.message : 'Unknown error'
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
