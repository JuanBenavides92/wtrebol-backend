import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
    throw new Error('Por favor define la variable MONGODB_URI en el archivo .env');
}

/**
 * Conexión a MongoDB usando Mongoose
 */
export const connectDB = async (): Promise<void> => {
    try {
        const conn = await mongoose.connect(MONGODB_URI);

        console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
        console.log(`📦 Base de datos: ${conn.connection.name}`);
    } catch (error) {
        console.error('❌ Error al conectar a MongoDB:', error);
        process.exit(1);
    }
};

/**
 * Eventos de conexión de MongoDB
 */
mongoose.connection.on('connected', () => {
    console.log('🔗 Mongoose conectado a MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ Error de conexión de Mongoose:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('🔌 Mongoose desconectado de MongoDB');
});

/**
 * Cerrar conexión cuando la aplicación se cierra
 */
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('🛑 Conexión de MongoDB cerrada debido a la terminación de la aplicación');
    process.exit(0);
});
