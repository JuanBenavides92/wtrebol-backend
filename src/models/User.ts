import mongoose, { Document, Schema } from 'mongoose';

/**
 * Interface para el documento de Usuario
 */
export interface IUser extends Document {
    email: string;
    password: string;
    name: string;
    role: 'admin' | 'super-admin';
    createdAt: Date;
    lastLogin?: Date;
}

/**
 * Schema de Usuario para MongoDB
 */
const UserSchema: Schema = new Schema({
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
    name: {
        type: String,
        required: [true, 'El nombre es requerido'],
        trim: true
    },
    role: {
        type: String,
        enum: ['admin', 'super-admin'],
        default: 'admin'
    },
    createdAt: {
        type: Date,
        default: Date.now
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
UserSchema.index({ email: 1 });

export default mongoose.model<IUser>('User', UserSchema);
