// Script para crear usuario admin de prueba
// Ejecutar con: node create-test-user.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb+srv://martben1:fPlyG0zQBfAGzh5B@martben.qy2cvvm.mongodb.net/?retryWrites=true&w=majority&appName=martben';

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: String,
    isActive: Boolean,
    createdAt: Date,
    lastLogin: Date
});

const User = mongoose.model('User', userSchema);

async function createTestUser() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Conectado a MongoDB');

        // Verificar si ya existe
        const existing = await User.findOne({ email: 'test@wtrebol.com' });
        if (existing) {
            console.log('⚠️  Usuario test@wtrebol.com ya existe');
            console.log('Usuario:', existing);
            await mongoose.disconnect();
            return;
        }

        // Crear usuario
        const hashedPassword = await bcrypt.hash('test123', 10);

        const testUser = new User({
            name: 'Test Admin',
            email: 'test@wtrebol.com',
            password: hashedPassword,
            role: 'admin',
            isActive: true,
            createdAt: new Date(),
            lastLogin: null
        });

        await testUser.save();
        console.log('✅ Usuario creado exitosamente:');
        console.log('   Email: test@wtrebol.com');
        console.log('   Password: test123');
        console.log('   Role: admin');

        await mongoose.disconnect();
        console.log('✅ Desconectado de MongoDB');

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

createTestUser();
