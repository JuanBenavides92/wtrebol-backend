/**
 * Migration Script: Product Options
 * 
 * Este script migra las opciones hardcodeadas de productos
 * (categorías, BTU, condiciones) a la base de datos MongoDB.
 * 
 * Ejecutar con: npx ts-node src/scripts/migrate-product-options.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ProductOption from '../models/ProductOption';

// Cargar variables de entorno
dotenv.config();

// Opciones iniciales a migrar
const INITIAL_OPTIONS = {
    categories: [
        { value: 'split', label: 'Split / Minisplit' },
        { value: 'cassette', label: 'Cassette 4 Vías' },
        { value: 'piso-cielo', label: 'Piso-Cielo' },
        { value: 'industrial', label: 'Industrial' },
        { value: 'accesorio', label: 'Accesorio' },
    ],
    btu: [
        { value: '9000', label: '9.000 BTU' },
        { value: '12000', label: '12.000 BTU' },
        { value: '18000', label: '18.000 BTU' },
        { value: '24000', label: '24.000 BTU' },
        { value: '30000', label: '30.000 BTU' },
        { value: '36000', label: '36.000 BTU' },
        { value: '48000', label: '48.000 BTU' },
        { value: '60000', label: '60.000 BTU' },
    ],
    conditions: [
        { value: 'nuevo', label: 'Nuevo' },
        { value: 'usado', label: 'Usado' },
    ],
};

async function migrateProductOptions() {
    try {
        console.log('🔄 Iniciando migración de opciones de producto...\n');

        // Conectar a MongoDB
        const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/wtrebol';
        await mongoose.connect(MONGO_URI);
        console.log('✅ Conectado a MongoDB\n');

        let totalCreated = 0;
        let totalSkipped = 0;

        // Migrar categorías
        console.log('📦 Migrando categorías...');
        for (const cat of INITIAL_OPTIONS.categories) {
            const existing = await ProductOption.findOne({ type: 'category', value: cat.value });
            if (existing) {
                console.log(`   ⏭️  Categoría "${cat.label}" ya existe`);
                totalSkipped++;
            } else {
                await ProductOption.create({
                    type: 'category',
                    value: cat.value,
                    label: cat.label,
                    isActive: true,
                    usageCount: 0,
                });
                console.log(`   ✅ Categoría "${cat.label}" creada`);
                totalCreated++;
            }
        }

        // Migrar BTU
        console.log('\n🔥 Migrando capacidades BTU...');
        for (const btu of INITIAL_OPTIONS.btu) {
            const existing = await ProductOption.findOne({ type: 'btu', value: btu.value });
            if (existing) {
                console.log(`   ⏭️  BTU "${btu.label}" ya existe`);
                totalSkipped++;
            } else {
                await ProductOption.create({
                    type: 'btu',
                    value: btu.value,
                    label: btu.label,
                    isActive: true,
                    usageCount: 0,
                });
                console.log(`   ✅ BTU "${btu.label}" creado`);
                totalCreated++;
            }
        }

        // Migrar condiciones
        console.log('\n📋 Migrando condiciones...');
        for (const cond of INITIAL_OPTIONS.conditions) {
            const existing = await ProductOption.findOne({ type: 'condition', value: cond.value });
            if (existing) {
                console.log(`   ⏭️  Condición "${cond.label}" ya existe`);
                totalSkipped++;
            } else {
                await ProductOption.create({
                    type: 'condition',
                    value: cond.value,
                    label: cond.label,
                    isActive: true,
                    usageCount: 0,
                });
                console.log(`   ✅ Condición "${cond.label}" creada`);
                totalCreated++;
            }
        }

        console.log('\n' + '='.repeat(50));
        console.log('✅ Migración completada!');
        console.log(`   📊 Total creadas: ${totalCreated}`);
        console.log(`   ⏭️  Total omitidas: ${totalSkipped}`);
        console.log('='.repeat(50) + '\n');

        // Cerrar conexión
        await mongoose.connection.close();
        console.log('👋 Conexión cerrada');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error durante la migración:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

// Ejecutar migración
migrateProductOptions();
