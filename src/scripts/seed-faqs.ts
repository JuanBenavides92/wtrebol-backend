import mongoose from 'mongoose';
import Content from '../models/Content';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://martben1:fPlyG0zQBfAGzh5B@martben.qy2cvvm.mongodb.net/?retryWrites=true&w=majority&appName=martben';

const faqs = [
    {
        type: 'faq',
        title: '¿Cada cuánto debo hacer mantenimiento a mi aire acondicionado?',
        description: 'Recomendamos realizar mantenimiento preventivo cada 6 meses para uso residencial y cada 3-4 meses para uso comercial.',
        isActive: true,
        order: 1,
        data: {
            icon: 'Clock',
            category: 'Mantenimiento',
            color: '#0EA5E9',
            gradient: 'from-sky-400 to-blue-500',
            backContent: {
                detailedAnswer: 'El mantenimiento preventivo regular es crucial para el rendimiento óptimo de tu sistema HVAC. Para uso residencial, recomendamos servicios cada 6 meses (idealmente antes del verano y del invierno). Para uso comercial o industrial, la frecuencia debe ser cada 3-4 meses debido al uso más intensivo. Esto incluye limpieza de filtros, revisión de refrigerante, inspección eléctrica y calibración de termostato.',
                tips: [
                    'Cambia los filtros cada 1-3 meses según el uso',
                    'Limpia las rejillas de ventilación mensualmente',
                    'Mantén el área alrededor de la unidad exterior libre de obstrucciones',
                    'Programa mantenimientos antes de las temporadas de mayor uso',
                    'Revisa el termostato regularmente para detectar anomalías'
                ],
                relatedLinks: [
                    { text: 'Ver planes de mantenimiento', url: '/servicios#mantenimiento' },
                    { text: 'Agendar servicio', url: '/calendario' }
                ]
            }
        }
    },
    {
        type: 'faq',
        title: '¿Cuánto tiempo tarda una instalación de aire acondicionado?',
        description: 'Una instalación residencial típica toma entre 4-8 horas. Para sistemas comerciales puede tomar 1-3 días.',
        isActive: true,
        order: 2,
        data: {
            icon: 'Wrench',
            category: 'Instalación',
            color: '#8B5CF6',
            gradient: 'from-purple-400 to-violet-500',
            backContent: {
                detailedAnswer: 'El tiempo de instalación varía según la complejidad del proyecto. Para sistemas residenciales estándar (split o mini-split), el proceso toma entre 4-8 horas. Esto incluye preparación del área, instalación de unidades interior y exterior, conexiones eléctricas y de refrigerante, y pruebas finales. Para sistemas comerciales, ductos centralizados o instalaciones múltiples, el proyecto puede extenderse de 1 a 3 días. Te proporcionamos un cronograma detallado en la cotización.',
                tips: [
                    'Despeja el área de instalación antes de nuestra llegada',
                    'Asegúrate de tener acceso eléctrico adecuado',
                    'Consulta sobre permisos necesarios en tu localidad',
                    'Planifica la instalación en temporada baja para mejor disponibilidad',
                    'Pregunta por opciones de financiamiento para proyectos grandes'
                ],
                relatedLinks: [
                    { text: 'Solicitar cotización', url: '/contacto#cotizacion' },
                    { text: 'Ver servicios de instalación', url: '/servicios#instalacion' }
                ]
            }
        }
    },
    {
        type: 'faq',
        title: '¿Qué garantía ofrecen en sus servicios?',
        description: 'Ofrecemos garantía de 1 año en mano de obra y respetamos la garantía del fabricante en equipos y repuestos.',
        isActive: true,
        order: 3,
        data: {
            icon: 'Shield',
            category: 'Garantía',
            color: '#10B981',
            gradient: 'from-emerald-400 to-green-500',
            backContent: {
                detailedAnswer: 'Nuestras garantías están diseñadas para darte total tranquilidad. Ofrecemos 1 año de garantía en toda mano de obra realizada por nuestros técnicos certificados. Además, respetamos y gestionamos la garantía del fabricante en todos los equipos y repuestos originales (típicamente 2-5 años según el fabricante). Todos nuestros servicios están respaldados por técnicos licenciados y certificados. Si surge algún problema durante el periodo de garantía, lo solucionamos sin costo adicional.',
                tips: [
                    'Guarda tu factura y certificado de garantía en lugar seguro',
                    'Registra tu equipo con el fabricante para activar la garantía',
                    'Realiza mantenimientos preventivos para mantener la garantía vigente',
                    'Contacta inmediatamente si detectas algún problema',
                    'Solo técnicos autorizados deben realizar reparaciones bajo garantía'
                ],
                relatedLinks: [
                    { text: 'Ver términos de garantía', url: '/servicios#garantias' },
                    { text: 'Contactar soporte', url: '/contacto' }
                ]
            }
        }
    },
    {
        type: 'faq',
        title: '¿Trabajan fines de semana y días festivos?',
        description: 'Sí, trabajamos 7 días a la semana. Para emergencias, ofrecemos servicio 24/7 los 365 días del año.',
        isActive: true,
        order: 4,
        data: {
            icon: 'Calendar',
            category: 'Horarios',
            color: '#F59E0B',
            gradient: 'from-amber-400 to-orange-500',
            backContent: {
                detailedAnswer: 'Entendemos que los problemas con tu sistema de climatización no respetan horarios. Por eso, trabajamos 7 días a la semana, incluyendo fines de semana y días festivos. Nuestro horario regular es de 8 AM a 8 PM. Para emergencias (como fallas totales del sistema en condiciones extremas), ofrecemos servicio de emergencia 24/7 los 365 días del año. Los servicios fuera de horario regular pueden tener un cargo adicional, pero siempre te informamos antes de proceder.',
                tips: [
                    'Agenda con anticipación para mejor disponibilidad',
                    'Los servicios de emergencia tienen prioridad pero pueden tener cargo extra',
                    'Usa nuestro sistema de citas online para agendar 24/7',
                    'Para emergencias, llama directamente a nuestra línea de urgencias',
                    'Considera planes de mantenimiento preventivo para evitar emergencias'
                ],
                relatedLinks: [
                    { text: 'Agendar cita online', url: '/calendario' },
                    { text: 'Ver horarios y tarifas', url: '/contacto' }
                ]
            }
        }
    },
    {
        type: 'faq',
        title: '¿Qué formas de pago aceptan?',
        description: 'Aceptamos efectivo, transferencias bancarias, tarjetas de crédito/débito y pagos digitales.',
        isActive: true,
        order: 5,
        data: {
            icon: 'DollarSign',
            category: 'Pagos',
            color: '#EC4899',
            gradient: 'from-pink-400 to-rose-500',
            backContent: {
                detailedAnswer: 'Ofrecemos múltiples opciones de pago para tu conveniencia: efectivo, transferencias bancarias, tarjetas de crédito y débito (Visa, Mastercard, American Express), y pagos digitales (PSE, Nequi, Daviplata). Para proyectos grandes (instalaciones completas, sistemas comerciales), ofrecemos planes de financiamiento con cuotas mensuales y tasas competitivas. No cobramos recargos por pagos con tarjeta. Emitimos factura electrónica para todos los servicios.',
                tips: [
                    'Pregunta por descuentos en pago de contado',
                    'Planes de financiamiento disponibles para proyectos >$2M',
                    'Solicita cotización detallada antes de cualquier trabajo',
                    'Guarda tus facturas para garantía y deducción de impuestos',
                    'Pagos parciales disponibles para proyectos grandes'
                ],
                relatedLinks: [
                    { text: 'Solicitar financiamiento', url: '/contacto#financiamiento' },
                    { text: 'Ver precios', url: '/servicios' }
                ]
            }
        }
    },
    {
        type: 'faq',
        title: '¿Cómo puedo agendar un servicio?',
        description: 'Puedes agendar llamándonos, por WhatsApp, o a través de nuestro sistema de citas online.',
        isActive: true,
        order: 6,
        data: {
            icon: 'Phone',
            category: 'Agendamiento',
            color: '#06B6D4',
            gradient: 'from-cyan-400 to-teal-500',
            backContent: {
                detailedAnswer: 'Hemos diseñado múltiples canales para que agendar sea fácil y conveniente. Puedes llamarnos directamente durante horario de oficina, enviarnos un mensaje por WhatsApp (respondemos en minutos), o usar nuestro sistema de citas online disponible 24/7. El sistema online te permite ver disponibilidad en tiempo real, seleccionar fecha y hora, y recibir confirmación inmediata. Te confirmamos todas las citas en menos de 2 horas y enviamos recordatorios automáticos 24 horas antes.',
                tips: [
                    'Usa el sistema online para ver disponibilidad en tiempo real',
                    'Proporciona detalles del problema para mejor diagnóstico',
                    'Ten a mano modelo y marca de tu equipo',
                    'Agenda con 2-3 días de anticipación para mejor disponibilidad',
                    'Para emergencias, llama directamente - no uses el sistema online'
                ],
                relatedLinks: [
                    { text: 'Agendar ahora', url: '/calendario' },
                    { text: 'Contactar por WhatsApp', url: 'https://wa.me/573001234567' }
                ]
            }
        }
    }
];

async function seedFAQs() {
    try {
        console.log('🔌 Conectando a MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Conectado a MongoDB');

        // Verificar si ya existen FAQs
        const existingFAQs = await Content.find({ type: 'faq' });

        if (existingFAQs.length > 0) {
            console.log(`⚠️  Ya existen ${existingFAQs.length} FAQs en la base de datos.`);
            console.log('¿Deseas eliminarlas y crear nuevas? (Ctrl+C para cancelar)');

            // Esperar 3 segundos antes de continuar
            await new Promise(resolve => setTimeout(resolve, 3000));

            console.log('🗑️  Eliminando FAQs existentes...');
            await Content.deleteMany({ type: 'faq' });
            console.log('✅ FAQs existentes eliminadas');
        }

        console.log('📝 Insertando Preguntas Frecuentes...');
        const result = await Content.insertMany(faqs);

        console.log(`✅ ${result.length} FAQs insertadas correctamente:`);
        result.forEach((faq, index) => {
            console.log(`   ${index + 1}. ${faq.title.substring(0, 50)}... (ID: ${faq._id})`);
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
seedFAQs();
