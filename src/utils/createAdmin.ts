import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || '';

/**
 * Script para crear el usuario administrador inicial
 */
const createAdminUser = async () => {
    try {
        // Conectar a MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Conectado a MongoDB');

        // Datos del administrador
        const adminEmail = 'admin@wtrebol.com';
        const adminPassword = 'Wtrebol2025@';
        const adminName = 'Administrador WTREBOL';

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ email: adminEmail });

        if (existingUser) {
            console.log('⚠️  El usuario administrador ya existe');
            console.log('📧 Email:', existingUser.email);
            console.log('👤 Nombre:', existingUser.name);
            console.log('🔑 Role:', existingUser.role);
            await mongoose.connection.close();
            return;
        }

        // Hashear la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        // Crear el usuario administrador
        const adminUser = new User({
            email: adminEmail,
            password: hashedPassword,
            name: adminName,
            role: 'super-admin'
        });

        await adminUser.save();

        console.log('✅ Usuario administrador creado exitosamente');
        console.log('📧 Email:', adminEmail);
        console.log('🔒 Password:', adminPassword);
        console.log('👤 Nombre:', adminName);
        console.log('🔑 Role: super-admin');
        console.log('\n⚠️  IMPORTANTE: Guarda estas credenciales en un lugar seguro');

        // Cerrar conexión
        await mongoose.connection.close();
        console.log('\n🔌 Conexión cerrada');

    } catch (error) {
        console.error('❌ Error al crear usuario administrador:', error);
        process.exit(1);
    }
};

// Ejecutar el script
createAdminUser();
