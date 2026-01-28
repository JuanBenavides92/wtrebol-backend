import { Request, Response } from 'express';
import storeSettingsService from '../services/storeSettingsService';

/**
 * Obtiene la configuración actual de la tienda
 * GET /api/admin/store-settings
 */
export const getStoreSettings = async (req: Request, res: Response): Promise<void> => {
    try {
        const settings = await storeSettingsService.getSettings();

        res.status(200).json({
            success: true,
            settings
        });
    } catch (error: any) {
        console.error('Error fetching store settings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch store settings',
            error: error.message
        });
    }
};

/**
 * Actualiza la configuración de la tienda
 * PUT /api/admin/store-settings
 */
export const updateStoreSettings = async (req: Request, res: Response): Promise<void> => {
    try {
        const updates = req.body;
        const adminId = (req.session as any)?.userId; // ID del admin autenticado

        // Validaciones
        if (updates.taxVAT !== undefined && (updates.taxVAT < 0 || updates.taxVAT > 100)) {
            res.status(400).json({
                success: false,
                message: 'Tax VAT must be between 0 and 100'
            });
            return;
        }

        if (updates.taxConsumption !== undefined && (updates.taxConsumption < 0 || updates.taxConsumption > 100)) {
            res.status(400).json({
                success: false,
                message: 'Tax consumption must be between 0 and 100'
            });
            return;
        }

        if (updates.shippingCost !== undefined && updates.shippingCost < 0) {
            res.status(400).json({
                success: false,
                message: 'Shipping cost cannot be negative'
            });
            return;
        }

        const settings = await storeSettingsService.updateSettings(updates, adminId);

        res.status(200).json({
            success: true,
            message: 'Store settings updated successfully',
            settings
        });
    } catch (error: any) {
        console.error('Error updating store settings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update store settings',
            error: error.message
        });
    }
};

/**
 * Obtiene la configuración pública de la tienda (para frontend)
 * GET /api/store-settings/public
 */
export const getPublicStoreSettings = async (req: Request, res: Response): Promise<void> => {
    try {
        const settings = await storeSettingsService.getSettings();

        // Solo retornar campos públicos
        res.status(200).json({
            success: true,
            settings: {
                shippingCost: settings.shippingCost,
                shippingEnabled: settings.shippingEnabled,
                taxVAT: settings.taxVAT,
                taxVATEnabled: settings.taxVATEnabled,
                taxConsumption: settings.taxConsumption,
                taxConsumptionEnabled: settings.taxConsumptionEnabled
            }
        });
    } catch (error: any) {
        console.error('Error fetching public store settings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch store settings',
            error: error.message
        });
    }
};
