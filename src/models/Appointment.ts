import mongoose, { Document, Schema } from 'mongoose';

/**
 * Interface para el documento de Cita
 */
export interface IAppointment extends Document {
    // Tipo de Servicio
    type: 'maintenance' | 'installation' | 'repair' | 'quotation' | 'emergency' | 'deep-clean' | 'gas-refill';

    // Estado
    status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';

    // Cliente
    customer: {
        name: string;
        email: string;
        phone: string;
        address: string;
        notes?: string;
    };

    // Fecha y Hora
    scheduledDate: Date;
    startTime: string;        // "09:00"
    endTime: string;          // "10:30"
    duration: number;         // minutos

    // Técnico Asignado (opcional)
    technician?: {
        id: mongoose.Types.ObjectId;
        name: string;
    };

    // Detalles del Servicio
    serviceDetails?: {
        equipmentType?: string;
        brand?: string;
        model?: string;
        issue?: string;
        estimatedCost?: number;
    };

    // Notificaciones
    notifications: {
        emailSent: boolean;
        whatsappSent: boolean;
        reminderSent: boolean;
    };

    // Metadata
    createdBy: 'customer' | 'admin';
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Schema de Cita para MongoDB
 */
const AppointmentSchema: Schema = new Schema({
    type: {
        type: String,
        required: [true, 'El tipo de servicio es requerido'],
        enum: ['maintenance', 'installation', 'repair', 'quotation', 'emergency', 'deep-clean', 'gas-refill'],
        index: true
    },
    status: {
        type: String,
        required: [true, 'El estado es requerido'],
        enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
        default: 'pending',
        index: true
    },
    customer: {
        name: {
            type: String,
            required: [true, 'El nombre del cliente es requerido'],
            trim: true
        },
        email: {
            type: String,
            required: [true, 'El email del cliente es requerido'],
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Por favor ingresa un email válido']
        },
        phone: {
            type: String,
            required: [true, 'El teléfono del cliente es requerido'],
            trim: true
        },
        address: {
            type: String,
            required: [true, 'La dirección es requerida'],
            trim: true
        },
        notes: {
            type: String,
            trim: true
        }
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
    duration: {
        type: Number,
        required: [true, 'La duración es requerida'],
        min: [15, 'La duración mínima es 15 minutos']
    },
    technician: {
        id: {
            type: Schema.Types.ObjectId,
            ref: 'Technician'
        },
        name: {
            type: String,
            trim: true
        }
    },
    serviceDetails: {
        equipmentType: String,
        brand: String,
        model: String,
        issue: String,
        estimatedCost: Number
    },
    notifications: {
        emailSent: {
            type: Boolean,
            default: false
        },
        whatsappSent: {
            type: Boolean,
            default: false
        },
        reminderSent: {
            type: Boolean,
            default: false
        }
    },
    createdBy: {
        type: String,
        enum: ['customer', 'admin'],
        default: 'customer'
    }
}, {
    timestamps: true
});

/**
 * Índices para optimizar búsquedas
 */
AppointmentSchema.index({ scheduledDate: 1, startTime: 1 });
AppointmentSchema.index({ 'customer.email': 1 });
AppointmentSchema.index({ 'customer.phone': 1 });
AppointmentSchema.index({ 'technician.id': 1, scheduledDate: 1 });
AppointmentSchema.index({ status: 1, scheduledDate: 1 });

export default mongoose.model<IAppointment>('Appointment', AppointmentSchema);
