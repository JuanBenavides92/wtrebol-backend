import mongoose, { Document, Schema } from 'mongoose';

/**
 * Interface para el documento de Contenido
 */
export interface IContent extends Document {
    type: 'slide' | 'product' | 'service' | 'setting' | 'advantage' | 'faq';
    title: string;
    description?: string;
    imageUrl?: string;
    price?: string;
    order?: number;
    isActive: boolean;
    layout?: 'image-right' | 'image-left' | 'image-background';
    buttonText?: string;
    buttonLink?: string;
    overlayOpacity?: number;
    // Text styling
    titleSize?: number;
    titleColor?: string;
    titleGradient?: boolean;
    titleBold?: boolean;
    titleItalic?: boolean;
    descriptionSize?: number;
    descriptionColor?: string;
    descriptionGradient?: boolean;
    descriptionBold?: boolean;
    descriptionItalic?: boolean;
    data?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Schema de Contenido para MongoDB
 */
const ContentSchema: Schema = new Schema({
    type: {
        type: String,
        required: [true, 'El tipo de contenido es requerido'],
        enum: ['slide', 'product', 'service', 'setting', 'advantage', 'faq'],
        index: true
    },
    title: {
        type: String,
        required: [true, 'El título es requerido'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    imageUrl: {
        type: String,
        trim: true
    },
    price: {
        type: String,
        trim: true
    },
    order: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    layout: {
        type: String,
        enum: ['image-right', 'image-left', 'image-background'],
        default: 'image-right'
    },
    buttonText: {
        type: String,
        trim: true
    },
    buttonLink: {
        type: String,
        trim: true
    },
    overlayOpacity: {
        type: Number,
        min: 0,
        max: 100,
        default: 50
    },
    titleSize: {
        type: Number,
        min: 12,
        max: 200,
        default: 48
    },
    titleColor: {
        type: String,
        default: 'auto'
    },
    titleGradient: {
        type: Boolean,
        default: false
    },
    titleBold: {
        type: Boolean,
        default: true
    },
    titleItalic: {
        type: Boolean,
        default: false
    },
    descriptionSize: {
        type: Number,
        min: 12,
        max: 100,
        default: 18
    },
    descriptionColor: {
        type: String,
        default: 'auto'
    },
    descriptionGradient: {
        type: Boolean,
        default: false
    },
    descriptionBold: {
        type: Boolean,
        default: false
    },
    descriptionItalic: {
        type: Boolean,
        default: false
    },
    data: {
        type: Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

/**
 * Índices para optimizar búsquedas
 */
ContentSchema.index({ type: 1, order: 1 });
ContentSchema.index({ type: 1, isActive: 1 });

export default mongoose.model<IContent>('Content', ContentSchema);
