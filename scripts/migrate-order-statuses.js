/**
 * Script de Migración: Actualizar Estados de Pedidos
 * 
 * Este script actualiza los estados antiguos de pedidos a los nuevos estados:
 * - pending → pending_payment
 * - confirmed → payment_confirmed
 * - processing → preparing
 * 
 * IMPORTANTE: Ejecutar este script UNA SOLA VEZ
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Conectar a MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Conectado a MongoDB');
    } catch (error) {
        console.error('❌ Error conectando a MongoDB:', error);
        process.exit(1);
    }
};

// Definir el esquema temporal para acceder a la colección
const orderSchema = new mongoose.Schema({}, { strict: false });
const Order = mongoose.model('Order', orderSchema);

const migrateOrderStatuses = async () => {
    try {
        console.log('\n📋 Iniciando migración de estados de pedidos...\n');

        // Mapeo de estados antiguos a nuevos
        const statusMapping = {
            'pending': 'pending_payment',
            'confirmed': 'payment_confirmed',
            'processing': 'preparing'
            // shipped, delivered, cancelled se mantienen igual
        };

        let totalUpdated = 0;

        // Actualizar cada estado antiguo
        for (const [oldStatus, newStatus] of Object.entries(statusMapping)) {
            const result = await Order.updateMany(
                { status: oldStatus },
                { $set: { status: newStatus } }
            );

            if (result.modifiedCount > 0) {
                console.log(`✅ ${oldStatus} → ${newStatus}: ${result.modifiedCount} pedidos actualizados`);
                totalUpdated += result.modifiedCount;
            }
        }

        // Mostrar resumen
        console.log('\n' + '='.repeat(50));
        console.log(`📊 RESUMEN DE MIGRACIÓN`);
        console.log('='.repeat(50));
        console.log(`Total de pedidos actualizados: ${totalUpdated}`);

        // Mostrar distribución actual de estados
        const statusDistribution = await Order.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        console.log('\n📈 Distribución actual de estados:');
        statusDistribution.forEach(({ _id, count }) => {
            console.log(`   ${_id}: ${count} pedidos`);
        });
        console.log('='.repeat(50) + '\n');

        if (totalUpdated === 0) {
            console.log('ℹ️  No se encontraron pedidos con estados antiguos para actualizar.');
        } else {
            console.log('✅ Migración completada exitosamente!');
        }

    } catch (error) {
        console.error('❌ Error durante la migración:', error);
        throw error;
    }
};

// Ejecutar migración
const runMigration = async () => {
    try {
        await connectDB();
        await migrateOrderStatuses();

        console.log('\n✅ Proceso completado. Cerrando conexión...');
        await mongoose.connection.close();
        console.log('👋 Conexión cerrada.\n');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error fatal:', error);
        process.exit(1);
    }
};

// Ejecutar
runMigration();
