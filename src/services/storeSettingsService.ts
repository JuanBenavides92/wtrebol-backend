import StoreSettings, { IStoreSettings } from '../models/StoreSettings';

/**
 * Servicio para manejar la configuración de la tienda
 */
class StoreSettingsService {
    /**
     * Obtiene la configuración actual de la tienda
     */
    async getSettings(): Promise<IStoreSettings> {
        const settings = await (StoreSettings as any).getSettings();
        return settings;
    }

    /**
     * Actualiza la configuración de la tienda
     */
    async updateSettings(
        updates: Partial<IStoreSettings>,
        updatedBy?: string
    ): Promise<IStoreSettings> {
        let settings = await (StoreSettings as any).getSettings();

        // Actualizar campos
        if (updates.shippingCost !== undefined) {
            settings.shippingCost = updates.shippingCost;
        }
        if (updates.shippingEnabled !== undefined) {
            settings.shippingEnabled = updates.shippingEnabled;
        }
        if (updates.taxVAT !== undefined) {
            settings.taxVAT = updates.taxVAT;
        }
        if (updates.taxVATEnabled !== undefined) {
            settings.taxVATEnabled = updates.taxVATEnabled;
        }
        if (updates.taxConsumption !== undefined) {
            settings.taxConsumption = updates.taxConsumption;
        }
        if (updates.taxConsumptionEnabled !== undefined) {
            settings.taxConsumptionEnabled = updates.taxConsumptionEnabled;
        }
        if (updatedBy) {
            settings.updatedBy = updatedBy;
        }

        await settings.save();
        return settings;
    }

    /**
     * Calcula los impuestos basados en la configuración actual
     */
    async calculateTaxes(subtotal: number): Promise<{
        taxVAT: number;
        taxConsumption: number;
        shipping: number;
        total: number;
    }> {
        const settings = await this.getSettings();

        const taxVAT = settings.taxVATEnabled
            ? Math.round(subtotal * (settings.taxVAT / 100))
            : 0;

        const taxConsumption = settings.taxConsumptionEnabled
            ? Math.round(subtotal * (settings.taxConsumption / 100))
            : 0;

        const shipping = settings.shippingEnabled ? settings.shippingCost : 0;

        const total = subtotal + taxVAT + taxConsumption + shipping;

        return {
            taxVAT,
            taxConsumption,
            shipping,
            total
        };
    }
}

export default new StoreSettingsService();
