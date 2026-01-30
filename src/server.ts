import express, { Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/database';
import { sessionConfig } from './config/session';
import authRoutes from './routes/authRoutes';
import contentRoutes from './routes/contentRoutes';
import uploadRoutes from './routes/uploadRoutes';
import appointmentRoutes from './routes/appointmentRoutes';
import appointmentSettingsRoutes from './routes/appointmentSettingsRoutes';
import technicianRoutes from './routes/technicianRoutes';
import publicAppointmentRoutes from './routes/publicAppointmentRoutes';
import timeBlockRoutes from './routes/timeBlockRoutes';
import customerRoutes from './routes/customerRoutes';
import orderRoutes from './routes/orderRoutes';
import adminOrderRoutes from './routes/adminOrderRoutes';
import adminCustomerRoutes from './routes/adminCustomerRoutes';
import adminUserRoutes from './routes/adminUserRoutes';
import customerAppointmentRoutes from './routes/customerAppointmentRoutes';
import wompiRoutes from './routes/wompiRoutes';
import webhooksRoutes from './routes/webhooksRoutes';
import storeSettingsRoutes from './routes/storeSettingsRoutes';
// import productOptionsRoutes from './routes/productOptionsRoutes'; // COMENTADO - Causa error de compilación
import * as productOptionsController from './controllers/productOptionsController';
import { isAuthenticated } from './middlewares/auth';
import { initializeAppointmentSettings } from './utils/initAppointments';
import { startReminderScheduler } from './utils/appointmentReminders';

// Cargar variables de entorno
dotenv.config();

// Crear aplicación Express
const app: Application = express();

// Configurar CORS - Permitir múltiples orígenes
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:3501',
    'http://localhost:3000', // Next.js frontend
    'http://localhost:3001', // Alternativo
    'http://localhost:3501', // Current frontend port
];

app.use(cors({
    origin: (origin, callback) => {
        // Permitir requests sin origin (como mobile apps o curl)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.warn(`⚠️  CORS blocked origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware para parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar sesiones
app.use(sessionConfig);

// Puerto del servidor
const PORT = process.env.PORT || 5000;

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({
        message: '🚀 WTREBOL Backend API',
        status: 'running',
        timestamp: new Date().toISOString()
    });
});

// Ruta de health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        database: 'Connected',
        uptime: process.uptime()
    });
});

// PRUEBA SIMPLE
app.get('/test-simple', (req, res) => {
    console.log('🧪 Test simple llamado');
    res.json({ test: 'works' });
});

// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Rutas de clientes (E-commerce)
app.use('/api/customers', customerRoutes);

// Rutas de citas de clientes (Customer Appointments)
app.use('/api/customers', customerAppointmentRoutes);

// Rutas de pedidos (E-commerce)
app.use('/api/orders', orderRoutes);

// Rutas de Wompi Payment Gateway
app.use('/api/wompi', wompiRoutes);

// Rutas de Webhooks (Wompi notifications)
app.use('/api/webhooks', webhooksRoutes);

// Rutas de configuración de tienda
app.use('/api/admin/store-settings', storeSettingsRoutes);
app.use('/api/store-settings', storeSettingsRoutes);

// Rutas administrativas de pedidos
app.use('/api/admin/orders', adminOrderRoutes);

// Rutas administrativas de clientes
app.use('/api/admin/customers', adminCustomerRoutes);

// Rutas administrativas de usuarios
app.use('/api/admin/users', adminUserRoutes);

// Rutas de contenido
app.use('/api/content', contentRoutes);

// Rutas de upload
app.use('/api/upload', uploadRoutes);

// Rutas de opciones de producto - INLINE (CON CONTROLADOR REAL)
console.log('📋 [INLINE-CONTROLLER] Registrando rutas con CONTROLADOR...');

// IMPORTANT: Specific routes MUST come before generic /:type route
// Otherwise Express will match /:type first and never reach /:id/usage

// GET /:id/usage - Check option usage (MUST be before /:type)
app.get('/api/product-options/:id/usage', isAuthenticated, productOptionsController.getOptionUsage);

// DELETE /:id - Delete option (MUST be before /:type)
app.delete('/api/product-options/:id', isAuthenticated, productOptionsController.deleteOption);

// PUT /:id - Update option (MUST be before /:type)
app.put('/api/product-options/:id', isAuthenticated, productOptionsController.updateOption);

// GET /:type - Get options by type (generic route, comes AFTER specific routes)
app.get('/api/product-options/:type', productOptionsController.getOptionsByType);

// POST / - Create new option
app.post('/api/product-options', productOptionsController.createOption);

console.log('✅ [INLINE-CONTROLLER] Rutas con CONTROLADOR registradas');

// RUTA DE PRUEBA DIRECTA
app.get('/api/appointment-settings-test', async (req, res) => {
    console.log('🧪 Ruta de prueba llamada');
    res.json({ success: true, message: 'Ruta de prueba funciona!' });
});

// RUTA INLINE DE PRODUCT-OPTIONS PARA PROBAR
app.get('/api/product-options-inline/test', (req, res) => {
    console.log('🧪 Ruta inline de product-options llamada');
    res.json({ success: true, message: 'Inline route works!' });
});

// Rutas públicas de citas (sin autenticación)
app.use('/api/public', publicAppointmentRoutes);

// Rutas de citas (protegidas)
app.use('/api/appointments', appointmentRoutes);

// Rutas de configuración de citas
app.use('/api/appointment-settings', appointmentSettingsRoutes);
console.log('✅ Rutas de appointment-settings registradas');

// Rutas de técnicos
app.use('/api/technicians', technicianRoutes);

// Rutas de bloques de tiempo
app.use('/api/time-blocks', timeBlockRoutes);
console.log('✅ Rutas de time-blocks registradas');

// Función para iniciar el servidor
const startServer = async () => {
    try {
        // Conectar a MongoDB
        await connectDB();

        // Inicializar configuración de citas
        await initializeAppointmentSettings();

        // Iniciar scheduler de recordatorios automáticos
        startReminderScheduler();

        // Iniciar servidor Express
        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
            console.log(`📍 URL: http://localhost:${PORT}`);
            console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error);
        process.exit(1);
    }
};

// Iniciar servidor
startServer();

export default app;


