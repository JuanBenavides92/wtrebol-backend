/**
 * Verificar estados de pedidos en la base de datos
 */

const mongoose = require('mongoose');
require('dotenv').config();

const orderSchema = new mongoose.Schema({}, { strict: false });
const Order = mongoose.model('Order', orderSchema);

const checkStatuses = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Conectado a MongoDB\n');

        const statuses = await Order.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        console.log('Estados actuales en la base de datos:');
        console.log('=====================================');
        statuses.forEach(({ _id, count }) => {
            console.log(`${_id}: ${count} pedidos`);
        });
        console.log('=====================================\n');

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkStatuses();
