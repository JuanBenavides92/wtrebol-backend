import mongoose, { Document, Schema } from 'mongoose';

/**
 * Interface para el documento de Configuración de Citas
 */
export interface IAppointmentSettings extends Document {
    // Horarios de Operación
    businessHours: {
        monday: { start: string; end: string; enabled: boolean };
        tuesday: { start: string; end: string; enabled: boolean };
        wednesday: { start: string; end: string; enabled: boolean };
        thursday: { start: string; end: string; enabled: boolean };
        friday: { start: string; end: string; enabled: boolean };
        saturday: { start: string; end: string; enabled: boolean };
        sunday: { start: string; end: string; enabled: boolean };
    };

    // Tipos de Citas (duración en minutos)
    appointmentTypes: {
        maintenance: { duration: number; enabled: boolean; color: string; price?: number };
        installation: { duration: number; enabled: boolean; color: string; price?: number };
        repair: { duration: number; enabled: boolean; color: string; price?: number };
        quotation: { duration: number; enabled: boolean; color: string; price?: number };
        emergency: { duration: number; enabled: boolean; color: string; price?: number };
        deepClean: { duration: number; enabled: boolean; color: string; price?: number };
        gasRefill: { duration: number; enabled: boolean; color: string; price?: number };
    };

    // Configuración de Slots
    slotInterval: number;           // 15, 30, 60 minutos
    bufferTime: number;             // tiempo entre citas (minutos)
    maxAppointmentsPerDay: number;

    // Días Bloqueados
    blackoutDates: Date[];

    // Notificaciones
    notifications: {
        emailEnabled: boolean;
        adminEmail: string;
        reminderHoursBefore: number;

        // Plantillas de Email
        emailTemplates: {
            confirmation: string;
            reminder: string;
            cancellation: string;
            adminNotification: string;
        };
    };

    createdAt: Date;
    updatedAt: Date;
}

/**
 * Schema de Configuración de Citas para MongoDB
 */
const AppointmentSettingsSchema: Schema = new Schema({
    businessHours: {
        monday: {
            start: { type: String, default: '08:00' },
            end: { type: String, default: '20:00' },
            enabled: { type: Boolean, default: true }
        },
        tuesday: {
            start: { type: String, default: '08:00' },
            end: { type: String, default: '20:00' },
            enabled: { type: Boolean, default: true }
        },
        wednesday: {
            start: { type: String, default: '08:00' },
            end: { type: String, default: '20:00' },
            enabled: { type: Boolean, default: true }
        },
        thursday: {
            start: { type: String, default: '08:00' },
            end: { type: String, default: '20:00' },
            enabled: { type: Boolean, default: true }
        },
        friday: {
            start: { type: String, default: '08:00' },
            end: { type: String, default: '20:00' },
            enabled: { type: Boolean, default: true }
        },
        saturday: {
            start: { type: String, default: '08:00' },
            end: { type: String, default: '20:00' },
            enabled: { type: Boolean, default: true }
        },
        sunday: {
            start: { type: String, default: '08:00' },
            end: { type: String, default: '20:00' },
            enabled: { type: Boolean, default: true }
        }
    },
    appointmentTypes: {
        maintenance: {
            duration: { type: Number, default: 90 },
            enabled: { type: Boolean, default: true },
            color: { type: String, default: '#0EA5E9' },
            price: Number
        },
        installation: {
            duration: { type: Number, default: 240 },
            enabled: { type: Boolean, default: true },
            color: { type: String, default: '#8B5CF6' },
            price: Number
        },
        repair: {
            duration: { type: Number, default: 120 },
            enabled: { type: Boolean, default: true },
            color: { type: String, default: '#F59E0B' },
            price: Number
        },
        quotation: {
            duration: { type: Number, default: 45 },
            enabled: { type: Boolean, default: true },
            color: { type: String, default: '#10B981' },
            price: Number
        },
        emergency: {
            duration: { type: Number, default: 90 },
            enabled: { type: Boolean, default: true },
            color: { type: String, default: '#EF4444' },
            price: Number
        },
        deepClean: {
            duration: { type: Number, default: 150 },
            enabled: { type: Boolean, default: true },
            color: { type: String, default: '#06B6D4' },
            price: Number
        },
        gasRefill: {
            duration: { type: Number, default: 60 },
            enabled: { type: Boolean, default: true },
            color: { type: String, default: '#EC4899' },
            price: Number
        }
    },
    slotInterval: {
        type: Number,
        default: 30,
        enum: [15, 30, 60]
    },
    bufferTime: {
        type: Number,
        default: 15,
        min: 0
    },
    maxAppointmentsPerDay: {
        type: Number,
        default: 20,
        min: 1
    },
    blackoutDates: [{
        type: Date
    }],
    notifications: {
        emailEnabled: {
            type: Boolean,
            default: true
        },
        adminEmail: {
            type: String,
            required: [true, 'El email del administrador es requerido'],
            lowercase: true,
            trim: true,
            default: 'admin@wtrebol.com'
        },
        reminderHoursBefore: {
            type: Number,
            default: 24,
            min: 1
        },
        emailTemplates: {
            confirmation: {
                type: String,
                default: 'Su cita ha sido confirmada para el {{date}} a las {{time}}.'
            },
            reminder: {
                type: String,
                default: 'Recordatorio: Tiene una cita mañana {{date}} a las {{time}}.'
            },
            cancellation: {
                type: String,
                default: 'Su cita del {{date}} a las {{time}} ha sido cancelada.'
            },
            adminNotification: {
                type: String,
                default: 'Nueva cita agendada: {{customerName}} - {{date}} {{time}} - {{service}}'
            }
        }
    }
}, {
    timestamps: true
});

export default mongoose.model<IAppointmentSettings>('AppointmentSettings', AppointmentSettingsSchema);
