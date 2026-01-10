import mongoose, { Document, Schema } from 'mongoose';

/**
 * Interface para el documento de Bloqueo de Tiempo
 */
export interface ITimeBlock extends Document {
    // Identificación
    title: string;
    description?: string;

    // Temporal
    scheduledDate: Date;
    startTime: string;
    endTime: string;

    // Tipo de Bloqueo
    blockType: 'corporate-contract' | 'personal-deal' | 'internal' | 'maintenance' | 'other';

    // Metadata
    createdBy: mongoose.Types.ObjectId;
    notes?: string;
    color?: string;

    // Timestamps
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Schema de Bloqueo de Tiempo para MongoDB
 */
const TimeBlockSchema: Schema = new Schema({
    title: {
        type: String,
        required: [true, 'El título es requerido'],
        trim: true,
        maxlength: [100, 'El título no puede exceder 100 caracteres']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'La descripción no puede exceder 500 caracteres']
    },
    scheduledDate: {
        type: Date,
        required: [true, 'La fecha es requerida'],
        index: true
    },
    startTime: {
        type: String,
        required: [true, 'La hora de inicio es requerida'],
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)']
    },
    endTime: {
        type: String,
        required: [true, 'La hora de fin es requerida'],
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)']
    },
    blockType: {
        type: String,
        required: [true, 'El tipo de bloqueo es requerido'],
        enum: {
            values: ['corporate-contract', 'personal-deal', 'internal', 'maintenance', 'other'],
            message: 'Tipo de bloqueo inválido'
        },
        index: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'El creador es requerido']
    },
    notes: {
        type: String,
        trim: true,
        maxlength: [1000, 'Las notas no pueden exceder 1000 caracteres']
    },
    color: {
        type: String,
        default: '#6B7280', // Gray by default
        match: [/^#[0-9A-F]{6}$/i, 'Color debe ser un código hexadecimal válido']
    }
}, {
    timestamps: true
});

/**
 * Índices para optimizar búsquedas
 */
TimeBlockSchema.index({ scheduledDate: 1, startTime: 1 });
TimeBlockSchema.index({ blockType: 1, scheduledDate: 1 });
TimeBlockSchema.index({ createdBy: 1, scheduledDate: 1 });

export default mongoose.model<ITimeBlock>('TimeBlock', TimeBlockSchema);
