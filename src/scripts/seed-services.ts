import mongoose from 'mongoose';
import Content from '../models/Content';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://martben1:fPlyG0zQBfAGzh5B@martben.qy2cvvm.mongodb.net/?retryWrites=true&w=majority&appName=martben';

const services = [
    {
        type: 'service',
        title: 'Mantenimiento Preventivo HVAC',
        description: 'Nuestro servicio de mantenimiento preventivo es la clave para garantizar el rendimiento óptimo y prolongar la vida útil de tu sistema de climatización. Similar a un chequeo médico para tu equipo, nuestros técnicos certificados realizan inspecciones exhaustivas y ajustes precisos que previenen averías costosas antes de que ocurran.',
        imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop',
        isActive: true,
        order: 1,
        data: {
            features: [
                'Limpieza profunda de filtros y serpentines',
                'Verificación del sistema de refrigerante',
                'Inspección eléctrica completa',
                'Optimización del flujo de aire',
                'Calibración de termostato',
                'Sistema de drenaje'
            ],
            benefits: [
                'Reduce facturas de electricidad hasta un 30%',
                'Previene averías inesperadas',
                'Extiende la vida útil del equipo',
                'Mejora la calidad del aire interior'
            ],
            icon: '🔧',
            color: '#0EA5E9',
            gradient: 'linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%)'
        }
    },
    {
        type: 'service',
        title: 'Instalación Profesional de Sistemas HVAC',
        description: 'La instalación correcta de tu sistema de climatización es fundamental para garantizar eficiencia energética, rendimiento óptimo y durabilidad a largo plazo. Nuestro equipo de expertos certificados maneja cada proyecto con precisión técnica y cumplimiento estricto de normativas de seguridad.',
        imageUrl: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&h=600&fit=crop',
        isActive: true,
        order: 2,
        data: {
            features: [
                'Evaluación técnica inicial',
                'Selección del sistema ideal',
                'Preparación del área',
                'Instalación de unidades certificada',
                'Conexiones profesionales',
                'Pruebas y verificación completa'
            ],
            benefits: [
                'Instalación certificada por técnicos licenciados',
                'Cumplimiento de normativas locales',
                'Garantía del fabricante y de instalación',
                'Eficiencia energética optimizada'
            ],
            icon: '⚙️',
            color: '#8B5CF6',
            gradient: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)'
        }
    },
    {
        type: 'service',
        title: 'Reparación Especializada y Diagnóstico Avanzado',
        description: 'Cuando tu sistema de climatización presenta fallas, nuestro equipo de técnicos certificados utiliza tecnología de diagnóstico avanzada para identificar la raíz del problema y ofrecer soluciones duraderas, no solo parches temporales.',
        imageUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=600&fit=crop',
        isActive: true,
        order: 3,
        data: {
            features: [
                'Diagnóstico preciso con tecnología avanzada',
                'Reparación de fallas eléctricas',
                'Solución de fugas de refrigerante',
                'Reparación de ruidos anormales',
                'Corrección de problemas de enfriamiento',
                'Servicio de emergencia 24/7'
            ],
            benefits: [
                'Respuesta rápida ante emergencias',
                'Técnicos certificados con experiencia',
                'Repuestos originales de calidad',
                'Garantía en todas las reparaciones'
            ],
            icon: '🛠️',
            color: '#F59E0B',
            gradient: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)'
        }
    }
];

async function seedServices() {
    try {
        console.log('🔌 Conectando a MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Conectado a MongoDB');

        // Verificar si ya existen servicios
        const existingServices = await Content.find({ type: 'service' });

        if (existingServices.length > 0) {
            console.log(`⚠️  Ya existen ${existingServices.length} servicios en la base de datos.`);
            console.log('¿Deseas eliminarlos y crear nuevos? (Ctrl+C para cancelar)');

            // Esperar 3 segundos antes de continuar
            await new Promise(resolve => setTimeout(resolve, 3000));

            console.log('🗑️  Eliminando servicios existentes...');
            await Content.deleteMany({ type: 'service' });
            console.log('✅ Servicios existentes eliminados');
        }

        console.log('📝 Insertando servicios HVAC...');
        const result = await Content.insertMany(services);

        console.log(`✅ ${result.length} servicios insertados correctamente:`);
        result.forEach((service, index) => {
            console.log(`   ${index + 1}. ${service.title} (ID: ${service._id})`);
        });

        console.log('\n🎉 Seed completado exitosamente!');

    } catch (error) {
        console.error('❌ Error al ejecutar seed:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Conexión cerrada');
        process.exit(0);
    }
}

// Ejecutar el seed
seedServices();
