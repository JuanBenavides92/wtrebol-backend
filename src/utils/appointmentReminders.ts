import cron from 'node-cron';
import Appointment from '../models/Appointment';
import AppointmentSettings from '../models/AppointmentSettings';
import { sendReminderEmail } from './appointmentNotifications';

/**
 * Enviar recordatorios de citas
 * Se ejecuta cada hora
 */
export const startReminderScheduler = () => {
    // Ejecutar cada hora
    cron.schedule('0 * * * *', async () => {
        try {
            console.log('🔔 Verificando citas para enviar recordatorios...');

            const settings = await AppointmentSettings.findOne();
            if (!settings || !settings.notifications.emailEnabled) {
                console.log('⏭️  Notificaciones deshabilitadas');
                return;
            }

            const reminderHours = settings.notifications.reminderHoursBefore;
            const now = new Date();
            const reminderTime = new Date(now.getTime() + reminderHours * 60 * 60 * 1000);

            // Buscar citas que necesitan recordatorio
            const appointments = await Appointment.find({
                status: { $in: ['pending', 'confirmed'] },
                'notifications.reminderSent': false,
                scheduledDate: {
                    $gte: now,
                    $lte: reminderTime
                }
            });

            console.log(`📨 Encontradas ${appointments.length} citas para recordatorio`);

            for (const appointment of appointments) {
                try {
                    await sendReminderEmail(appointment);

                    appointment.notifications.reminderSent = true;
                    await appointment.save();

                    console.log(`✅ Recordatorio enviado para cita ${appointment._id}`);
                } catch (error) {
                    console.error(`❌ Error enviando recordatorio para cita ${appointment._id}:`, error);
                }
            }

        } catch (error) {
            console.error('❌ Error en el scheduler de recordatorios:', error);
        }
    });

    console.log('⏰ Scheduler de recordatorios iniciado (cada hora)');
};
