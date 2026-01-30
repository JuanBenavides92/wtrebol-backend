import mongoose, { Document, Schema } from 'mongoose';

/**
 * Interface para la configuración del sitio
 */
export interface ISiteConfig extends Document {
    // Logo y Branding
    logoUrl?: string; // URL del logo en S3
    logoText: string; // Texto principal del logo (ej: "WTREBOL")
    logoSubtext?: string; // Subtexto del logo (ej: "INNOVACIÓN")
    logoHeight?: number; // Altura del logo en píxeles (default: 40)
    faviconUrl?: string; // URL del favicon en S3

    // Colores del sitio
    primaryColor?: string; // Color primario (hex)
    secondaryColor?: string; // Color secundario (hex)

    // Información de contacto
    contactPhone?: string;
    contactEmail?: string;

    // Redes sociales
    socialLinks?: {
        facebook?: string;
        instagram?: string;
        linkedin?: string;
        whatsapp?: string;
    };

    // Metadata
    updatedBy?: string; // ID del admin que actualizó
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Schema de configuración del sitio
 */
const SiteConfigSchema = new Schema<ISiteConfig>(
    {
        // Logo y Branding
        logoUrl: {
            type: String,
            default: null
        },
        logoText: {
            type: String,
            default: 'WTREBOL'
        },
        logoSubtext: {
            type: String,
            default: 'INNOVACIÓN'
        },
        logoHeight: {
            type: Number,
            default: 40 // Altura en píxeles
        },
        faviconUrl: {
            type: String,
            default: null
        },

        // Colores
        primaryColor: {
            type: String,
            default: '#0EA5E9' // sky-500
        },
        secondaryColor: {
            type: String,
            default: '#10B981' // emerald-500
        },

        // Contacto
        contactPhone: {
            type: String,
            default: '+573028194432'
        },
        contactEmail: {
            type: String,
            default: 'Wtrebol2020@hotmail.com'
        },

        // Redes sociales
        socialLinks: {
            facebook: { type: String, default: null },
            instagram: { type: String, default: null },
            linkedin: { type: String, default: null },
            whatsapp: { type: String, default: null }
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
 * Solo debe existir un documento de configuración (Singleton)
 */
SiteConfigSchema.statics.getSettings = async function () {
    let settings = await this.findOne();

    if (!settings) {
        // Crear configuración por defecto
        settings = await this.create({
            logoText: 'WTREBOL',
            logoSubtext: 'INNOVACIÓN',
            primaryColor: '#0EA5E9',
            secondaryColor: '#10B981',
            contactPhone: '+573028194432',
            contactEmail: 'Wtrebol2020@hotmail.com'
        });
        console.log('✅ [SiteConfig] Configuración por defecto creada');
    }

    return settings;
};

const SiteConfig = mongoose.model<ISiteConfig>('SiteConfig', SiteConfigSchema);

export default SiteConfig;
