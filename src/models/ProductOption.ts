import mongoose, { Schema, Document } from 'mongoose';

export interface IProductOption extends Document {
    type: 'category' | 'btu' | 'condition';
    value: string;
    label: string;
    isActive: boolean;
    usageCount: number;
    createdAt: Date;
    updatedAt: Date;
}

const ProductOptionSchema = new Schema<IProductOption>(
    {
        type: {
            type: String,
            required: true,
            enum: ['category', 'btu', 'condition'],
            index: true,
        },
        value: {
            type: String,
            required: true,
            trim: true,
        },
        label: {
            type: String,
            required: true,
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        usageCount: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Índice compuesto para búsquedas eficientes
ProductOptionSchema.index({ type: 1, isActive: 1 });

// Índice único para evitar duplicados
ProductOptionSchema.index({ type: 1, value: 1 }, { unique: true });

export default mongoose.model<IProductOption>('ProductOption', ProductOptionSchema);
