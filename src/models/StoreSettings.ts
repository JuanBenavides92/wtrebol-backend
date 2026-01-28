import mongoose, { Document, Schema } from 'mongoose';

/**
 * Interface para la configuración de la tienda
 */
export interface IStoreSettings extends Document {
    // Configuración de Envío
    shippingCost: number; // Costo de envío en pesos
    shippingEnabled: boolean; // Si el envío tiene costo o es gratis

    // Configuración de IVA
    taxVAT: number; // Porcentaje de IVA (default: 19)
    taxVATEnabled: boolean; // Si se aplica IVA

    // Configuración de Impuesto al Consumo
    taxConsumption: number; // Porcentaje de impuesto al consumo
    taxConsumptionEnabled: boolean; // Si se aplica impuesto al consumo

    // Metadata
    updatedBy?: string; // ID del admin que actualizó
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Schema de configuración de la tienda
 */
const StoreSettingsSchema = new Schema<IStoreSettings>(
    {
        // Envío
        shippingCost: {
            type: Number,
            default: 0,
            min: 0
        },
        shippingEnabled: {
            type: Boolean,
            default: false
        },

        // IVA
        taxVAT: {
            type: Number,
            default: 19,
            min: 0,
            max: 100
        },
        taxVATEnabled: {
            type: Boolean,
            default: true
        },

        // Impuesto al Consumo
        taxConsumption: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        taxConsumptionEnabled: {
            type: Boolean,
            default: false
        },

        // Metadata
        updatedBy: {
            type: String,
            required: false
        }
    },
    {
        timestamps: true
    }
);

/**
 * Método estático para obtener o crear la configuración
 * Solo debe existir un documento de configuración
 */
StoreSettingsSchema.statics.getSettings = async function () {
    let settings = await this.findOne();

    if (!settings) {
        // Crear configuración por defecto
        settings = await this.create({
            shippingCost: 0,
            shippingEnabled: false,
            taxVAT: 19,
            taxVATEnabled: true,
            taxConsumption: 0,
            taxConsumptionEnabled: false
        });
    }

    return settings;
};

const StoreSettings = mongoose.model<IStoreSettings>('StoreSettings', StoreSettingsSchema);

export default StoreSettings;
