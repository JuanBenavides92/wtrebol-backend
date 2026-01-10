import mongoose, { Document, Schema } from 'mongoose';

/**
 * Interface para el documento de Contenido
 */
export interface IContent extends Document {
    type: 'slide' | 'product' | 'service' | 'setting';
    title: string;
    description?: string;
    imageUrl?: string;
    price?: string;
    order?: number;
    isActive: boolean;
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
        enum: ['slide', 'product', 'service', 'setting'],
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
