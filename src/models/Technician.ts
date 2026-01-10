import mongoose, { Document, Schema } from 'mongoose';

/**
 * Interface para el documento de Técnico
 */
export interface ITechnician extends Document {
    name: string;
    email: string;
    phone: string;

    // Especialidades
    specialties: ('maintenance' | 'installation' | 'repair' | 'quotation' | 'emergency' | 'deep-clean' | 'gas-refill')[];

    // Estado
    isActive: boolean;

    // Disponibilidad Semanal
    availability: {
        monday: { start: string; end: string; available: boolean };
        tuesday: { start: string; end: string; available: boolean };
        wednesday: { start: string; end: string; available: boolean };
        thursday: { start: string; end: string; available: boolean };
        friday: { start: string; end: string; available: boolean };
        saturday: { start: string; end: string; available: boolean };
        sunday: { start: string; end: string; available: boolean };
    };

    // Días Bloqueados Específicos
    blockedDates: Date[];

    // Estadísticas
    stats: {
        totalAppointments: number;
        completedAppointments: number;
        cancelledAppointments: number;
        averageRating?: number;
    };

    createdAt: Date;
    updatedAt: Date;
}

/**
 * Schema de Técnico para MongoDB
 */
const TechnicianSchema: Schema = new Schema({
    name: {
        type: String,
        required: [true, 'El nombre es requerido'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'El email es requerido'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Por favor ingresa un email válido']
    },
    phone: {
        type: String,
        required: [true, 'El teléfono es requerido'],
        trim: true
    },
    specialties: [{
        type: String,
        enum: ['maintenance', 'installation', 'repair', 'quotation', 'emergency', 'deep-clean', 'gas-refill']
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    availability: {
        monday: {
            start: { type: String, default: '08:00' },
            end: { type: String, default: '20:00' },
            available: { type: Boolean, default: true }
        },
        tuesday: {
            start: { type: String, default: '08:00' },
            end: { type: String, default: '20:00' },
            available: { type: Boolean, default: true }
        },
        wednesday: {
            start: { type: String, default: '08:00' },
            end: { type: String, default: '20:00' },
            available: { type: Boolean, default: true }
        },
        thursday: {
            start: { type: String, default: '08:00' },
            end: { type: String, default: '20:00' },
            available: { type: Boolean, default: true }
        },
        friday: {
            start: { type: String, default: '08:00' },
            end: { type: String, default: '20:00' },
            available: { type: Boolean, default: true }
        },
        saturday: {
            start: { type: String, default: '08:00' },
            end: { type: String, default: '20:00' },
            available: { type: Boolean, default: true }
        },
        sunday: {
            start: { type: String, default: '08:00' },
            end: { type: String, default: '20:00' },
            available: { type: Boolean, default: true }
        }
    },
    blockedDates: [{
        type: Date
    }],
    stats: {
        totalAppointments: {
            type: Number,
            default: 0
        },
        completedAppointments: {
            type: Number,
            default: 0
        },
        cancelledAppointments: {
            type: Number,
            default: 0
        },
        averageRating: {
            type: Number,
            min: 0,
            max: 5
        }
    }
}, {
    timestamps: true
});

/**
 * Índices para optimizar búsquedas
 */
TechnicianSchema.index({ email: 1 });
TechnicianSchema.index({ isActive: 1 });
TechnicianSchema.index({ specialties: 1 });

export default mongoose.model<ITechnician>('Technician', TechnicianSchema);
