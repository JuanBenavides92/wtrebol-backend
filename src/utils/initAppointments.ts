import AppointmentSettings from '../models/AppointmentSettings';

/**
 * Inicializar configuración por defecto del sistema de citas
 */
export const initializeAppointmentSettings = async (): Promise<void> => {
    try {
        // Verificar si ya existe configuración
        const existingSettings = await AppointmentSettings.findOne();

        if (existingSettings) {
            console.log('✅ Configuración de citas ya existe');
            return;
        }

        // Crear configuración por defecto
        const defaultSettings = new AppointmentSettings({
            businessHours: {
                monday: { start: '08:00', end: '20:00', enabled: true },
                tuesday: { start: '08:00', end: '20:00', enabled: true },
                wednesday: { start: '08:00', end: '20:00', enabled: true },
                thursday: { start: '08:00', end: '20:00', enabled: true },
                friday: { start: '08:00', end: '20:00', enabled: true },
                saturday: { start: '08:00', end: '20:00', enabled: true },
                sunday: { start: '08:00', end: '20:00', enabled: true }
            },
            appointmentTypes: {
                maintenance: {
                    duration: 90,
                    enabled: true,
                    color: '#0EA5E9'
                },
                installation: {
                    duration: 240,
                    enabled: true,
                    color: '#8B5CF6'
                },
                repair: {
                    duration: 120,
                    enabled: true,
                    color: '#F59E0B'
                },
                quotation: {
                    duration: 45,
                    enabled: true,
                    color: '#10B981'
                },
                emergency: {
                    duration: 90,
                    enabled: true,
                    color: '#EF4444'
                },
                deepClean: {
                    duration: 150,
                    enabled: true,
                    color: '#06B6D4'
                },
                gasRefill: {
                    duration: 60,
                    enabled: true,
                    color: '#EC4899'
                }
            },
            slotInterval: 30,
            bufferTime: 15,
            maxAppointmentsPerDay: 20,
            blackoutDates: [],
            notifications: {
                emailEnabled: true,
                adminEmail: process.env.ADMIN_EMAIL || 'admin@wtrebol.com',
                reminderHoursBefore: 24,
                emailTemplates: {
                    confirmation: `
                        Estimado/a {{customerName}},
                        
                        Su cita ha sido confirmada:
                        
                        Servicio: {{serviceType}}
                        Fecha: {{date}}
                        Hora: {{time}}
                        Dirección: {{address}}
                        
                        Gracias por confiar en WTREBOL.
                    `,
                    reminder: `
                        Estimado/a {{customerName}},
                        
                        Le recordamos su cita:
                        
                        Servicio: {{serviceType}}
                        Fecha: {{date}}
                        Hora: {{time}}
                        
                        Nos vemos pronto!
                    `,
                    cancellation: `
                        Estimado/a {{customerName}},
                        
                        Su cita ha sido cancelada:
                        
                        Fecha: {{date}}
                        Hora: {{time}}
                        
                        Si desea reagendar, contáctenos.
                    `,
                    adminNotification: `
                        Nueva cita agendada:
                        
                        Cliente: {{customerName}}
                        Teléfono: {{customerPhone}}
                        Email: {{customerEmail}}
                        Servicio: {{serviceType}}
                        Fecha: {{date}}
                        Hora: {{time}}
                        Dirección: {{address}}
                        Notas: {{notes}}
                    `
                }
            }
        });

        await defaultSettings.save();
        console.log('✅ Configuración de citas inicializada correctamente');

    } catch (error) {
        console.error('❌ Error al inicializar configuración de citas:', error);
    }
};
