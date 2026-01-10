import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || '';

/**
 * Script para verificar usuarios en la base de datos
 */
const verifyUsers = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Conectado a MongoDB\n');

        const users = await User.find({});

        console.log(`📊 Total de usuarios: ${users.length}\n`);

        users.forEach((user, index) => {
            console.log(`Usuario #${index + 1}:`);
            console.log(`  📧 Email: ${user.email}`);
            console.log(`  👤 Nombre: ${user.name}`);
            console.log(`  🔑 Role: ${user.role}`);
            console.log(`  📅 Creado: ${user.createdAt}`);
            console.log(`  🔐 Password (hash): ${user.password.substring(0, 20)}...`);
            console.log('');
        });

        await mongoose.connection.close();
        console.log('🔌 Conexión cerrada');

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

verifyUsers();
