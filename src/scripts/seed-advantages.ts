import mongoose from 'mongoose';
import Content from '../models/Content';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://martben1:fPlyG0zQBfAGzh5B@martben.qy2cvvm.mongodb.net/?retryWrites=true&w=majority&appName=martben';

const advantages = [
    {
        type: 'advantage',
        title: 'Certificaciones Profesionales',
        description: 'Técnicos certificados y licenciados con años de experiencia en sistemas HVAC',
        imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop',
        isActive: true,
        order: 1,
        buttonText: 'Ver Certificaciones',
        buttonLink: '/nosotros#certificaciones',
        data: {
            // Frente de la card
            icon: 'Award',
            color: '#0EA5E9',
            gradient: 'from-sky-400 to-blue-500',
            showButton: true,

            // Reverso de la card - Información detallada
            backContent: {
                statistics: [
                    { label: 'Técnicos Certificados', value: '15+' },
                    { label: 'Años de Experiencia', value: '20+' },
                    { label: 'Certificaciones Activas', value: '45+' }
                ],
                details: [
                    'Certificación EPA Universal para manejo de refrigerantes',
                    'Licencias NATE (North American Technician Excellence)',
                    'Certificación en sistemas de eficiencia energética',
                    'Capacitación continua en nuevas tecnologías HVAC',
                    'Cumplimiento de normativas locales e internacionales'
                ],
                cta: 'Nuestro equipo está altamente calificado para garantizar instalaciones y reparaciones de la más alta calidad.'
            }
        }
    },
    {
        type: 'advantage',
        title: 'Respuesta Rápida',
        description: 'Atención inmediata a tus solicitudes con tiempos de respuesta optimizados',
        imageUrl: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=600&fit=crop',
        isActive: true,
        order: 2,
        buttonText: 'Solicitar Servicio',
        buttonLink: '/contacto',
        data: {
            icon: 'Zap',
            color: '#F59E0B',
            gradient: 'from-amber-400 to-orange-500',
            showButton: true,

            backContent: {
                statistics: [
                    { label: 'Tiempo de Respuesta', value: '< 2h' },
                    { label: 'Disponibilidad', value: '24/7' },
                    { label: 'Satisfacción', value: '98%' }
                ],
                details: [
                    'Servicio de emergencia disponible 24/7',
                    'Respuesta inicial en menos de 2 horas',
                    'Técnicos móviles en toda la ciudad',
                    'Sistema de priorización de emergencias',
                    'Seguimiento en tiempo real de tu solicitud'
                ],
                cta: 'Cuando necesitas ayuda urgente, estamos a solo una llamada de distancia.'
            }
        }
    },
    {
        type: 'advantage',
        title: 'Garantía Total',
        description: 'Todos nuestros servicios incluyen garantía completa en mano de obra y repuestos',
        imageUrl: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=600&fit=crop',
        isActive: true,
        order: 3,
        buttonText: 'Ver Garantías',
        buttonLink: '/servicios#garantias',
        data: {
            icon: 'Shield',
            color: '#10B981',
            gradient: 'from-emerald-400 to-green-500',
            showButton: true,

            backContent: {
                statistics: [
                    { label: 'Garantía Mano de Obra', value: '2 años' },
                    { label: 'Garantía Repuestos', value: '5 años' },
                    { label: 'Cobertura', value: '100%' }
                ],
                details: [
                    'Garantía de 2 años en mano de obra',
                    'Hasta 5 años de garantía en repuestos originales',
                    'Cobertura completa sin letra pequeña',
                    'Servicio post-garantía con descuentos especiales',
                    'Soporte técnico gratuito durante el periodo de garantía'
                ],
                cta: 'Tu tranquilidad es nuestra prioridad. Respaldamos cada trabajo que realizamos.'
            }
        }
    },
    {
        type: 'advantage',
        title: 'Tecnología de Punta',
        description: 'Equipos y herramientas de última generación para diagnósticos precisos',
        imageUrl: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=600&fit=crop',
        isActive: true,
        order: 4,
        buttonText: 'Conocer Tecnología',
        buttonLink: '/nosotros#tecnologia',
        data: {
            icon: 'Wrench',
            color: '#8B5CF6',
            gradient: 'from-purple-400 to-violet-500',
            showButton: true,

            backContent: {
                statistics: [
                    { label: 'Equipos Especializados', value: '50+' },
                    { label: 'Precisión Diagnóstico', value: '99.5%' },
                    { label: 'Inversión Anual', value: '$100K+' }
                ],
                details: [
                    'Cámaras termográficas para detección de fugas',
                    'Analizadores digitales de refrigerante',
                    'Manómetros digitales de alta precisión',
                    'Equipos de recuperación y reciclaje de refrigerante',
                    'Software de diagnóstico avanzado para sistemas modernos'
                ],
                cta: 'Invertimos constantemente en tecnología para ofrecerte el mejor servicio.'
            }
        }
    },
    {
        type: 'advantage',
        title: 'Precios Transparentes',
        description: 'Cotizaciones claras sin costos ocultos. Sabes exactamente qué pagas',
        imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=600&fit=crop',
        isActive: true,
        order: 5,
        buttonText: 'Solicitar Cotización',
        buttonLink: '/contacto#cotizacion',
        data: {
            icon: 'DollarSign',
            color: '#EC4899',
            gradient: 'from-pink-400 to-rose-500',
            showButton: true,

            backContent: {
                statistics: [
                    { label: 'Cotizaciones Gratuitas', value: '100%' },
                    { label: 'Clientes Satisfechos', value: '500+' },
                    { label: 'Costos Ocultos', value: '0' }
                ],
                details: [
                    'Cotizaciones detalladas sin compromiso',
                    'Desglose completo de costos de mano de obra y materiales',
                    'Sin cargos sorpresa al finalizar el trabajo',
                    'Opciones de pago flexibles',
                    'Descuentos por contratos de mantenimiento preventivo'
                ],
                cta: 'Creemos en la honestidad y transparencia en cada transacción.'
            }
        }
    },
    {
        type: 'advantage',
        title: 'Seguimiento Digital',
        description: 'Plataforma online para agendar, dar seguimiento y gestionar tus servicios',
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
        isActive: true,
        order: 6,
        buttonText: 'Acceder a Portal',
        buttonLink: '/calendario',
        data: {
            icon: 'Smartphone',
            color: '#06B6D4',
            gradient: 'from-cyan-400 to-teal-500',
            showButton: true,

            backContent: {
                statistics: [
                    { label: 'Usuarios Activos', value: '300+' },
                    { label: 'Citas Agendadas', value: '1,200+' },
                    { label: 'Satisfacción Digital', value: '4.9/5' }
                ],
                details: [
                    'Portal web para agendar citas 24/7',
                    'Notificaciones en tiempo real del estado de tu servicio',
                    'Historial completo de mantenimientos y reparaciones',
                    'Recordatorios automáticos de mantenimiento preventivo',
                    'Acceso a facturas y garantías digitales'
                ],
                cta: 'Gestiona tus servicios desde cualquier lugar, en cualquier momento.'
            }
        }
    }
];

async function seedAdvantages() {
    try {
        console.log('🔌 Conectando a MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Conectado a MongoDB');

        // Verificar si ya existen ventajas
        const existingAdvantages = await Content.find({ type: 'advantage' });

        if (existingAdvantages.length > 0) {
            console.log(`⚠️  Ya existen ${existingAdvantages.length} ventajas en la base de datos.`);
            console.log('¿Deseas eliminarlas y crear nuevas? (Ctrl+C para cancelar)');

            // Esperar 3 segundos antes de continuar
            await new Promise(resolve => setTimeout(resolve, 3000));

            console.log('🗑️  Eliminando ventajas existentes...');
            await Content.deleteMany({ type: 'advantage' });
            console.log('✅ Ventajas existentes eliminadas');
        }

        console.log('📝 Insertando ventajas "¿Por Qué Elegirnos?"...');
        const result = await Content.insertMany(advantages);

        console.log(`✅ ${result.length} ventajas insertadas correctamente:`);
        result.forEach((advantage, index) => {
            console.log(`   ${index + 1}. ${advantage.title} (ID: ${advantage._id})`);
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
seedAdvantages();
