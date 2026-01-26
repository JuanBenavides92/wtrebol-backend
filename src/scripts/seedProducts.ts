import mongoose from 'mongoose';
import Content from '../models/Content';
import dotenv from 'dotenv';

dotenv.config();

const products = [
    // SPLITS / MINISPLITS
    {
        type: 'product',
        category: 'split',
        title: 'Minisplit Inverter 9000 BTU',
        description: 'Ideal para dormitorios y espacios pequeños hasta 15m². Tecnología inverter para máximo ahorro energético.',
        btuCapacity: 9000,
        usageType: 'residencial',
        price: '$850.000',
        brand: 'LG',
        inStock: true,
        order: 1,
        isActive: true,
        imageUrl: 'https://images.unsplash.com/photo-1632823471565-1ecdf5c6da46?q=80&w=2070',
    },
    {
        type: 'product',
        category: 'split',
        title: 'Split Inverter 12000 BTU',
        description: 'Perfecto para habitaciones hasta 20m². Sistema inverter con bajo consumo eléctrico. Silencioso.',
        btuCapacity: 12000,
        usageType: 'residencial',
        price: '$1.200.000',
        brand: 'Samsung',
        inStock: true,
        order: 2,
        isActive: true,
        imageUrl: 'https://images.unsplash.com/photo-1574955075265-849c2bd8df14?q=80&w=2070',
    },
    {
        type: 'product',
        category: 'split',
        title: 'Minisplit 18000 BTU',
        description: 'Para salas y espacios de hasta 30m². Alta eficiencia energética, Control remoto Smart WiFi.',
        btuCapacity: 18000,
        usageType: 'residencial',
        price: '$1.750.000',
        brand: 'Daikin',
        inStock: true,
        order: 3,
        isActive: true,
        imageUrl: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=2070',
    },
    {
        type: 'product',
        category: 'split',
        title: 'Split 24000 BTU Comercial',
        description: 'Alta capacidad para oficinas y comercios hasta 40m². Diseño robusto y compacto.',
        btuCapacity: 24000,
        usageType: 'comercial',
        price: '$2.400.000',
        brand: 'Carrier',
        inStock: true,
        order: 4,
        isActive: true,
        imageUrl: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?q=80&w=2070',
    },

    // CASSETTES
    {
        type: 'product',
        category: 'cassette',
        title: 'Cassette 4 Vías 18000 BTU',
        description: 'Sistema de techo con distribución de aire en 4 direcciones. Ideal para oficinas pequeñas.',
        btuCapacity: 18000,
        usageType: 'comercial',
        price: '$3.200.000',
        brand: 'LG',
        inStock: true,
        order: 5,
        isActive: true,
        imageUrl: 'https://images.unsplash.com/photo-1574955075265-849c2bd8df14?q=80&w=2070',
    },
    {
        type: 'product',
        category: 'cassette',
        title: 'Cassette 24000 BTU',
        description: 'Distribución uniforme del aire. Panel decorativo incluido. Espacios hasta 50m².',
        btuCapacity: 24000,
        usageType: 'comercial',
        price: '$3.800.000',
        brand: 'Samsung',
        inStock: true,
        order: 6,
        isActive: true,
        imageUrl: 'https://images.unsplash.com/photo-1574955075265-849c2bd8df14?q=80&w=2070',
    },
    {
        type: 'product',
        category: 'cassette',
        title: 'Cassette 36000 BTU Comercial',
        description: 'Alta capacidad para locales comerciales hasta 70m². Sistema inteligente de distribución.',
        btuCapacity: 36000,
        usageType: 'comercial',
        price: '$4.500.000',
        brand: 'Daikin',
        inStock: true,
        order: 7,
        isActive: true,
        imageUrl: 'https://images.unsplash.com/photo-1532634726645-c7ee0dbb11dd?q=80&w=2070',
    },
    {
        type: 'product',
        category: 'cassette',
        title: 'Cassette 48000 BTU Industrial',
        description: 'Potencia industrial para espacios amplios hasta 100m². Control WiFi y programación.',
        btuCapacity: 48000,
        usageType: 'industrial',
        price: '$5.800.000',
        brand: 'Carrier',
        inStock: true,
        order: 8,
        isActive: true,
        imageUrl: 'https://images.unsplash.com/photo-1532634726645-c7ee0dbb11dd?q=80&w=2070',
    },

    // PISO-CIELO
    {
        type: 'product',
        category: 'piso-cielo',
        title: 'Piso-Cielo 24000 BTU',
        description: 'Instalación versátil en piso o techo. Silencioso y eficiente. Espacios hasta 50m².',
        btuCapacity: 24000,
        usageType: 'comercial',
        price: '$2.900.000',
        brand: 'LG',
        inStock: true,
        order: 9,
        isActive: true,
        imageUrl: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?q=80&w=2070',
    },
    {
        type: 'product',
        category: 'piso-cielo',
        title: 'Piso-Cielo 36000 BTU',
        description: 'Mayor capacidad para áreas comerciales. Filtro antibacterial y modo sleep.',
        btuCapacity: 36000,
        usageType: 'comercial',
        price: '$3.600.000',
        brand: 'Samsung',
        inStock: true,
        order: 10,
        isActive: true,
        imageUrl: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?q=80&w=2070',
    },
    {
        type: 'product',
        category: 'piso-cielo',
        title: 'Piso-Cielo 48000 BTU Heavy Duty',
        description: 'Uso intensivo para restaurantes, gimnasios y locales grandes hasta 100m².',
        btuCapacity: 48000,
        usageType: 'comercial',
        price: '$4.700.000',
        brand: 'Daikin',
        inStock: true,
        order: 11,
        isActive: true,
        imageUrl: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?q=80&w=2070',
    },

    // INDUSTRIAL
    {
        type: 'product',
        category: 'industrial',
        title: 'Condensadora Industrial 48000 BTU',
        description: 'Sistema industrial para procesos. Refrigerante ecológico R410A. Alta durabilidad.',
        btuCapacity: 48000,
        usageType: 'industrial',
        price: '$6.800.000',
        brand: 'Carrier',
        inStock: true,
        order: 12,
        isActive: true,
        imageUrl: 'https://images.unsplash.com/photo-1532634726645-c7ee0dbb11dd?q=80&w=2070',
    },
    {
        type: 'product',
        category: 'industrial',
        title: 'Sistema VRF 60000 BTU',
        description: 'Variable Refrigerant Flow. Hasta 8 evaporadoras. Control independiente por zona.',
        btuCapacity: 60000,
        usageType: 'industrial',
        price: '$12.500.000',
        brand: 'Daikin',
        inStock: false,
        order: 13,
        isActive: true,
        imageUrl: 'https://images.unsplash.com/photo-1532634726645-c7ee0dbb11dd?q=80&w=2070',
    },

    // ACCESORIOS
    {
        type: 'product',
        category: 'accesorio',
        title: 'Kit Instalación Completa',
        description: 'Incluye tuberías de cobre, cable eléctrico, canaleta, accesorios de montaje y cinta aislante.',
        price: '$850.000',
        brand: 'WTREBOL',
        inStock: true,
        order: 14,
        isActive: true,
        imageUrl: 'https://images.unsplash.com/photo-1542919528-d4631286684d?q=80&w=2070',
    },
    {
        type: 'product',
        category: 'accesorio',
        title: 'Control Remoto Universal',
        description: 'Compatible con las principales marcas (LG, Samsung, Daikin, Carrier). Fácil configuración.',
        price: '$65.000',
        brand: 'WTREBOL',
        inStock: true,
        order: 15,
        isActive: true,
        imageUrl: 'https://images.unsplash.com/photo-1542919528-d4631286684d?q=80&w=2070',
    },
    {
        type: 'product',
        category: 'accesorio',
        title: 'Soporte Condensadora Reforzado',
        description: 'Estructura metálica galvanizada para unidad exterior. Soporta hasta 80kg.',
        price: '$180.000',
        brand: 'WTREBOL',
        inStock: true,
        order: 16,
        isActive: true,
        imageUrl: 'https://images.unsplash.com/photo-1542919528-d4631286684d?q=80&w=2070',
    },
];

async function seedProducts() {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/wtrebol';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        // Clear existing products
        const deleteResult = await Content.deleteMany({ type: 'product' });
        console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing products`);

        // Insert new products
        const insertResult = await Content.insertMany(products);
        console.log(`✅ Inserted ${insertResult.length} new products`);

        // Show summary by category
        const categories = await Content.aggregate([
            { $match: { type: 'product' } },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
        ]);

        console.log('\n📊 Products by category:');
        categories.forEach((cat) => {
            console.log(`   ${cat._id || 'sin categoría'}: ${cat.count} products`);
        });
        console.log(`\n🎉 Seed completed successfully!\n`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding products:', error);
        process.exit(1);
    }
}

seedProducts();
