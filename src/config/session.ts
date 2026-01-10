import session from 'express-session';
import MongoStore from 'connect-mongo';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || '';
const SESSION_SECRET = process.env.SESSION_SECRET || 'fallback-secret-key';
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Configuración de sesiones con Express Session y MongoDB
 */
export const sessionConfig = session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: MONGODB_URI,
        collectionName: 'sessions',
        ttl: 24 * 60 * 60, // 24 horas
        autoRemove: 'native'
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 24 horas
        httpOnly: true, // Previene acceso desde JavaScript del cliente
        secure: NODE_ENV === 'production', // Solo HTTPS en producción
        sameSite: 'lax' // Protección CSRF
    },
    name: 'wtrebol.sid' // Nombre personalizado de la cookie
});

/**
 * Extender el tipo de Session para incluir userId
 */
declare module 'express-session' {
    interface SessionData {
        userId: string;
        userEmail: string;
        userName: string;
        userRole: string;
    }
}
