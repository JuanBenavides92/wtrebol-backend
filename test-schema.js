// Test script to verify Content model accepts dynamic values
// Run with: node test-schema.js

const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://martben1:fPlyG0zQBfAGzh5B@martben.qy2cvvm.mongodb.net/?retryWrites=true&w=majority&appName=martben';

async function testSchema() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Conectado a MongoDB');

        // Get the Content model
        const Content = mongoose.connection.models.Content || require('./src/models/Content').default;

        console.log('\n📋 Schema de category:');
        console.log(JSON.stringify(Content.schema.path('category'), null, 2));

        console.log('\n📋 Schema de condition:');
        console.log(JSON.stringify(Content.schema.path('condition'), null, 2));

        // Try to create a test document
        console.log('\n🧪 Intentando crear producto con valores dinámicos...');

        const testProduct = new Content({
            type: 'product',
            title: 'Test Dynamic Values',
            category: 'juan',  // Valor dinámico
            condition: 'juan', // Valor dinámico
            isActive: true
        });

        // Validate without saving
        const validationError = testProduct.validateSync();

        if (validationError) {
            console.log('❌ Validación falló:');
            console.log(validationError.message);
        } else {
            console.log('✅ Validación exitosa - acepta valores dinámicos');
        }

        await mongoose.disconnect();
        console.log('\n✅ Desconectado');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

testSchema();
