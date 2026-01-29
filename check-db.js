const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://martben1:fPlyG0zQBfAGzh5B@martben.qy2cvvm.mongodb.net/wtrebol?retryWrites=true&w=majority&appName=martben';

async function checkDatabase() {
    try {
        console.log('\n🔍 Conectando a MongoDB...\n');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Conectado exitosamente\n');

        // Verificar colección ProductOptions
        const collections = await mongoose.connection.db.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);

        console.log('📦 Colecciones disponibles:');
        collectionNames.forEach(name => console.log(`   - ${name}`));
        console.log('');

        // Buscar la colección de opciones de producto (puede ser productoptions o ProductOptions)
        const optionsCollectionName = collectionNames.find(name =>
            name.toLowerCase().includes('option')
        );

        if (optionsCollectionName) {
            console.log(`✅ Colección encontrada: ${optionsCollectionName}\n`);

            const collection = mongoose.connection.db.collection(optionsCollectionName);
            const total = await collection.countDocuments();
            console.log(`📊 Total de documentos: ${total}\n`);

            if (total > 0) {
                // Contar por tipo
                const categories = await collection.countDocuments({ type: 'category' });
                const btus = await collection.countDocuments({ type: 'btu' });
                const conditions = await collection.countDocuments({ type: 'condition' });

                console.log('📋 Desglose por tipo:');
                console.log(`   - Categorías: ${categories}`);
                console.log(`   - BTUs: ${btus}`);
                console.log(`   - Condiciones: ${conditions}\n`);

                // Mostrar algunos ejemplos
                console.log('📝 Ejemplos de datos:\n');
                const samples = await collection.find().limit(5).toArray();
                samples.forEach(doc => {
                    console.log(`   ${doc.type}: ${doc.label} (value: ${doc.value})`);
                });
            } else {
                console.log('⚠️  La colección está VACÍA - No hay datos\n');
            }
        } else {
            console.log('❌ NO se encontró la colección de opciones de producto\n');
            console.log('💡 Esto significa que necesitamos crear los datos iniciales\n');
        }

        await mongoose.connection.close();
        console.log('✅ Conexión cerrada\n');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkDatabase();
