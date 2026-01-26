const mongoose = require('mongoose');

// Datos de los servicios actuales de ServiciosSection3D.tsx
const servicesData = [
    {
        type: 'service',
        title: 'Mantenimiento Preventivo HVAC',
        description: 'Nuestro servicio de mantenimiento preventivo es la clave para garantizar el rendimiento óptimo y prolongar la vida útil de tu sistema de climatización. Similar a un chequeo médico para tu equipo, nuestros técnicos certificados realizan inspecciones exhaustivas y ajustes precisos que previenen averías costosas antes de que ocurran.',
        imageUrl: '', // Se debe agregar URL de imagen desde el admin
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
            gradient: 'linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%)',
            buttonText: 'Solicitar Servicio',
            buttonLink: '/contacto'
        }
    },
    {
        type: 'service',
        title: 'Instalación Profesional de Sistemas HVAC',
        description: 'La instalación correcta de tu sistema de climatización es fundamental para garantizar eficiencia energética, rendimiento óptimo y durabilidad a largo plazo. Nuestro equipo de expertos certificados maneja cada proyecto con precisión técnica y cumplimiento estricto de normativas de seguridad.',
        imageUrl: '',
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
            gradient: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
            buttonText: 'Solicitar Servicio',
            buttonLink: '/contacto'
        }
    },
    {
        type: 'service',
        title: 'Reparación Especializada y Diagnóstico Avanzado',
        description: 'Cuando tu sistema de climatización presenta fallas, nuestro equipo de técnicos certificados utiliza tecnología de diagnóstico avanzada para identificar la raíz del problema y ofrecer soluciones duraderas, no solo parches temporales.',
        imageUrl: '',
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
            gradient: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
            buttonText: 'Solicitar Servicio',
            buttonLink: '/contacto'
        }
    }
];

async function migrate() {
    try {
        // Conectar a MongoDB
        await mongoose.connect('mongodb+srv://martben1:fPlyG0zQBfAGzh5B@martben.qy2cvvm.mongodb.net/?retryWrites=true&w=majority&appName=martben');

        console.log('✅ Conectado a MongoDB');

        // Definir schema inline para evitar problemas de importación
        const ContentSchema = new mongoose.Schema({
            type: {
                type: String,
                required: true,
                enum: ['slide', 'product', 'service', 'setting', 'feature', 'faq']
            },
            title: { type: String, required: true },
            description: String,
            imageUrl: String,
            isActive: { type: Boolean, default: true },
            order: { type: Number, default: 0 },
            data: mongoose.Schema.Types.Mixed
        }, { timestamps: true });

        const Content = mongoose.models.Content || mongoose.model('Content', ContentSchema);

        // Eliminar servicios existentes
        const deleteResult = await Content.deleteMany({ type: 'service' });
        console.log(`🗑️  Servicios antiguos eliminados: ${deleteResult.deletedCount}`);

        // Insertar nuevos servicios
        const insertResult = await Content.insertMany(servicesData);
        console.log(`✅ ${insertResult.length} servicios migrados exitosamente`);

        // Mostrar servicios creados
        console.log('\n📋 Servicios creados:');
        insertResult.forEach((service, index) => {
            console.log(`   ${index + 1}. ${service.title} (${service.data.icon})`);
        });

        console.log('\n⚠️  IMPORTANTE: Recuerda agregar las imágenes desde el panel administrativo');

        await mongoose.connection.close();
        console.log('\n✅ Migración completada. Conexión cerrada.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error en migración:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

// Ejecutar migración
migrate();
