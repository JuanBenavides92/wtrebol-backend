/**
 * Alternative Migration Script: Product Options via API
 * 
 * Este script usa el servidor backend en ejecución para crear las opciones
 * en lugar de conectarse directamente a MongoDB.
 * 
 * Ejecutar con: npx ts-node src/scripts/migrate-product-options-api.ts
 */

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000';

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

async function createOption(type: string, value: string, label: string): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE}/api/product-options`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ type, value, label }),
        });

        const result: any = await response.json();

        if (response.ok && result.success) {
            return true;
        } else if (response.status === 409) {
            // Ya existe
            return false;
        } else {
            console.error(`   ❌ Error: ${result.message}`);
            return false;
        }
    } catch (error) {
        console.error(`   ❌ Error de red:`, error);
        return false;
    }
}

async function migrateProductOptions() {
    try {
        console.log('🔄 Iniciando migración de opciones de producto...\n');
        console.log(`📡 Conectando a: ${API_BASE}\n`);

        let totalCreated = 0;
        let totalSkipped = 0;

        // Migrar categorías
        console.log('📦 Migrando categorías...');
        for (const cat of INITIAL_OPTIONS.categories) {
            const created = await createOption('category', cat.value, cat.label);
            if (created) {
                console.log(`   ✅ Categoría "${cat.label}" creada`);
                totalCreated++;
            } else {
                console.log(`   ⏭️  Categoría "${cat.label}" ya existe`);
                totalSkipped++;
            }
        }

        // Migrar BTU
        console.log('\n🔥 Migrando capacidades BTU...');
        for (const btu of INITIAL_OPTIONS.btu) {
            const created = await createOption('btu', btu.value, btu.label);
            if (created) {
                console.log(`   ✅ BTU "${btu.label}" creado`);
                totalCreated++;
            } else {
                console.log(`   ⏭️  BTU "${btu.label}" ya existe`);
                totalSkipped++;
            }
        }

        // Migrar condiciones
        console.log('\n📋 Migrando condiciones...');
        for (const cond of INITIAL_OPTIONS.conditions) {
            const created = await createOption('condition', cond.value, cond.label);
            if (created) {
                console.log(`   ✅ Condición "${cond.label}" creada`);
                totalCreated++;
            } else {
                console.log(`   ⏭️  Condición "${cond.label}" ya existe`);
                totalSkipped++;
            }
        }

        console.log('\n' + '='.repeat(50));
        console.log('✅ Migración completada!');
        console.log(`   📊 Total creadas: ${totalCreated}`);
        console.log(`   ⏭️  Total omitidas: ${totalSkipped}`);
        console.log('='.repeat(50) + '\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error durante la migración:', error);
        process.exit(1);
    }
}

// Ejecutar migración
migrateProductOptions();
