/**
 * Migration Script: Create Initial Product Options
 * 
 * Este script crea las opciones iniciales para los selectores dinámicos
 * en el formulario de productos:
 * - Categorías
 * - BTU
 * - Condición
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://martben1:fPlyG0zQBfAGzh5B@martben.qy2cvvm.mongodb.net/?retryWrites=true&w=majority&appName=martben';

// Definir el schema (mismo que ProductOption.ts)
const ProductOptionSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            required: true,
            enum: ['category', 'btu', 'condition'],
            index: true,
        },
        value: {
            type: String,
            required: true,
            trim: true,
        },
        label: {
            type: String,
            required: true,
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        usageCount: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    {
        timestamps: true,
    }
);

ProductOptionSchema.index({ type: 1, isActive: 1 });
ProductOptionSchema.index({ type: 1, value: 1 }, { unique: true });

const ProductOption = mongoose.model('ProductOption', ProductOptionSchema);

// Opciones iniciales para Category
const categories = [
    { type: 'category', value: 'split', label: 'Split (Mini Split)' },
    { type: 'category', value: 'ventana', label: 'Ventana' },
    { type: 'category', value: 'central', label: 'Central' },
    { type: 'category', value: 'portatil', label: 'Portátil' },
    { type: 'category', value: 'cassette', label: 'Cassette' },
    { type: 'category', value: 'piso-techo', label: 'Piso-Techo' },
];

// Opciones iniciales para BTU
const btus = [
    { type: 'btu', value: '9000', label: '9,000 BTU' },
    { type: 'btu', value: '12000', label: '12,000 BTU' },
    { type: 'btu', value: '18000', label: '18,000 BTU' },
    { type: 'btu', value: '24000', label: '24,000 BTU' },
    { type: 'btu', value: '36000', label: '36,000 BTU' },
    { type: 'btu', value: '48000', label: '48,000 BTU' },
    { type: 'btu', value: '60000', label: '60,000 BTU' },
];

// Opciones iniciales para Condition
const conditions = [
    { type: 'condition', value: 'nuevo', label: 'Nuevo' },
    { type: 'condition', value: 'usado-excelente', label: 'Usado - Excelente' },
    { type: 'condition', value: 'usado-bueno', label: 'Usado - Bueno' },
    { type: 'condition', value: 'reacondicionado', label: 'Reacondicionado' },
];

const allOptions = [...categories, ...btus, ...conditions];

async function migrateProductOptions() {
    try {
        console.log('\n╔═══════════════════════════════════════════════════════════════╗');
        console.log('║         🔄 MIGRACIÓN: Product Options                        ║');
        console.log('╚═══════════════════════════════════════════════════════════════╝\n');

        // Connect to MongoDB
        console.log('📡 Conectando a MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Conectado a MongoDB\n');

        // Delete existing options
        console.log('🗑️  Eliminando opciones existentes...');
        const deleted = await ProductOption.deleteMany({});
        console.log(`   Eliminadas: ${deleted.deletedCount} opciones\n`);

        // Insert new options
        console.log('📥 Insertando nuevas opciones...\n');

        let created = 0;
        for (const option of allOptions) {
            try {
                await ProductOption.create(option);
                console.log(`   ✅ ${option.type.padEnd(10)} | ${option.label}`);
                created++;
            } catch (error) {
                console.log(`   ❌ ${option.type.padEnd(10)} | ${option.label} - ${error.message}`);
            }
        }

        console.log(`\n📊 Resumen:`);
        console.log(`   Total a crear: ${allOptions.length}`);
        console.log(`   Creadas exitosamente: ${created}`);
        console.log(`   Fallidas: ${allOptions.length - created}`);

        // Verify counts
        const categoryCount = await ProductOption.countDocuments({ type: 'category' });
        const btuCount = await ProductOption.countDocuments({ type: 'btu' });
        const conditionCount = await ProductOption.countDocuments({ type: 'condition' });

        console.log(`\n✅ Verificación:`);
        console.log(`   Categorías: ${categoryCount}`);
        console.log(`   BTUs: ${btuCount}`);
        console.log(`   Condiciones: ${conditionCount}`);

        console.log('\n🎉 Migración completada exitosamente!\n');

    } catch (error) {
        console.error('\n❌ Error durante la migración:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Conexión cerrada');
    }
}

// Ejecutar migración
migrateProductOptions();
