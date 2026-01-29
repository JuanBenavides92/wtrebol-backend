import mongoose from 'mongoose';
import ProductOption from './src/models/ProductOption.js';

const MONGO_URI = 'mongodb+srv://martben1:fPlyG0zQBfAGzh5B@martben.qy2cvvm.mongodb.net/wtrebol?retryWrites=true&w=majority&appName=martben';

async function checkDatabase() {
    try {
        console.log('\n🔍 Conectando a MongoDB...\n');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Conectado exitosamente\n');

        // Verificar colección ProductOptions usando el modelo
        const total = await ProductOption.countDocuments();
        console.log(`📊 Total de opciones en ProductOptions: ${total}\n`);

        if (total > 0) {
            // Contar por tipo
            const categories = await ProductOption.countDocuments({ type: 'category' });
            const btus = await ProductOption.countDocuments({ type: 'btu' });
            const conditions = await ProductOption.countDocuments({ type: 'condition' });

            console.log('📋 Desglose por tipo:');
            console.log(`   - Categorías: ${categories}`);
            console.log(`   - BTUs: ${btus}`);
            console.log(`   - Condiciones: ${conditions}\n`);

            // Mostrar algunos ejemplos
            console.log('📝 Ejemplos de datos:\n');
            const samples = await ProductOption.find().limit(10);
            samples.forEach(doc => {
                console.log(`   ${doc.type}: ${doc.label} (value: ${doc.value}, active: ${doc.isActive})`);
            });
            console.log('');
        } else {
            console.log('⚠️  La colección ProductOptions está VACÍA\n');
            console.log('💡 Necesitamos ejecutar la migración para crear los datos iniciales\n');
        }

        await mongoose.connection.close();
        console.log('✅ Conexión cerrada\n');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

checkDatabase();
