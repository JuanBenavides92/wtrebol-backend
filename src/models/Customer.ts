import mongoose, { Document, Schema } from 'mongoose';

/**
 * Interface para el documento de Customer (Cliente)
 */
export interface ICustomer extends Document {
    name: string;
    email: string;
    password: string;
    phone: string;
    address?: string;
    city?: string;
    createdAt: Date;
    updatedAt: Date;
    lastLogin?: Date;
}

/**
 * Schema de Customer para MongoDB
 */
const CustomerSchema: Schema = new Schema({
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
    password: {
        type: String,
        required: [true, 'La contraseña es requerida'],
        minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
    },
    phone: {
        type: String,
        required: [true, 'El teléfono es requerido'],
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    city: {
        type: String,
        trim: true
    },
    lastLogin: {
        type: Date
    }
}, {
    timestamps: true
});

/**
 * Índices para optimizar búsquedas
 */
CustomerSchema.index({ email: 1 });
CustomerSchema.index({ phone: 1 });

export default mongoose.model<ICustomer>('Customer', CustomerSchema);
