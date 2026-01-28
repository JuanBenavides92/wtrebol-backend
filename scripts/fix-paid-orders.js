/**
 * Script para corregir pedidos pagados que tienen estado incorrecto
 * Actualiza pedidos con paymentStatus='approved' pero status='pending_payment'
 */

const mongoose = require('mongoose');
require('dotenv').config();

const orderSchema = new mongoose.Schema({}, { strict: false });
const Order = mongoose.model('Order', orderSchema);

const fixPaidOrders = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Conectado a MongoDB\n');

        // Buscar pedidos con pago aprobado pero estado pendiente
        const result = await Order.updateMany(
            {
                paymentStatus: 'approved',
                status: 'pending_payment'
            },
            {
                $set: {
                    status: 'payment_confirmed',
                    statusUpdatedAt: new Date()
                }
            }
        );

        console.log('📊 RESULTADO:');
        console.log('='.repeat(50));
        console.log(`Pedidos actualizados: ${result.modifiedCount}`);
        console.log('='.repeat(50));

        if (result.modifiedCount > 0) {
            console.log('\n✅ Pedidos pagados corregidos exitosamente!');

            // Mostrar los pedidos actualizados
            const updatedOrders = await Order.find({
                paymentStatus: 'approved',
                status: 'payment_confirmed'
            }).select('orderNumber status paymentStatus paidAt');

            console.log('\n📋 Pedidos con pago confirmado:');
            updatedOrders.forEach(order => {
                console.log(`   - ${order.orderNumber}: ${order.status} (pagado: ${order.paidAt ? 'Sí' : 'No'})`);
            });
        } else {
            console.log('\nℹ️  No se encontraron pedidos para corregir.');
        }

        await mongoose.connection.close();
        console.log('\n👋 Proceso completado.\n');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

fixPaidOrders();
