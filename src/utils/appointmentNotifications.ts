import nodemailer from 'nodemailer';
import { IAppointment } from '../models/Appointment';
import AppointmentSettings from '../models/AppointmentSettings';

/**
 * Configurar transporter de Nodemailer
 */
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

/**
 * Enviar notificación de nueva cita al admin
 */
export const sendAdminNotification = async (appointment: IAppointment): Promise<void> => {
    try {
        const settings = await AppointmentSettings.findOne();

        if (!settings || !settings.notifications.emailEnabled) {
            console.log('Notificaciones por email deshabilitadas');
            return;
        }

        const transporter = createTransporter();

        // Formatear tipo de servicio
        const serviceNames: Record<string, string> = {
            maintenance: 'Mantenimiento',
            installation: 'Instalación',
            repair: 'Reparación',
            quotation: 'Cotización',
            emergency: 'Emergencia',
            deepClean: 'Limpieza Profunda',
            gasRefill: 'Recarga de Gas'
        };

        const serviceName = serviceNames[appointment.type] || appointment.type;

        // Formatear fecha
        const date = new Date(appointment.scheduledDate);
        const formattedDate = date.toLocaleDateString('es-CO', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const emailBody = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #0EA5E9;">🔔 Nueva Cita Agendada</h2>
                
                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Información del Cliente</h3>
                    <p><strong>Nombre:</strong> ${appointment.customer.name}</p>
                    <p><strong>Teléfono:</strong> ${appointment.customer.phone}</p>
                    <p><strong>Email:</strong> ${appointment.customer.email}</p>
                    <p><strong>Dirección:</strong> ${appointment.customer.address}</p>
                    ${appointment.customer.notes ? `<p><strong>Notas:</strong> ${appointment.customer.notes}</p>` : ''}
                </div>

                <div style="background-color: #e0f2fe; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Detalles de la Cita</h3>
                    <p><strong>Servicio:</strong> ${serviceName}</p>
                    <p><strong>Fecha:</strong> ${formattedDate}</p>
                    <p><strong>Hora:</strong> ${appointment.startTime} - ${appointment.endTime}</p>
                    <p><strong>Duración:</strong> ${appointment.duration} minutos</p>
                </div>

                ${appointment.serviceDetails?.issue ? `
                    <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Detalles del Servicio</h3>
                        ${appointment.serviceDetails.equipmentType ? `<p><strong>Tipo de Equipo:</strong> ${appointment.serviceDetails.equipmentType}</p>` : ''}
                        ${appointment.serviceDetails.brand ? `<p><strong>Marca:</strong> ${appointment.serviceDetails.brand}</p>` : ''}
                        ${appointment.serviceDetails.model ? `<p><strong>Modelo:</strong> ${appointment.serviceDetails.model}</p>` : ''}
                        <p><strong>Problema:</strong> ${appointment.serviceDetails.issue}</p>
                    </div>
                ` : ''}

                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 14px;">
                        Para contactar al cliente por WhatsApp: 
                        <a href="https://wa.me/${appointment.customer.phone.replace(/\D/g, '')}" 
                           style="color: #0EA5E9; text-decoration: none;">
                            Abrir WhatsApp
                        </a>
                    </p>
                </div>
            </div>
        `;

        await transporter.sendMail({
            from: `"WTREBOL Sistema de Citas" <${process.env.EMAIL_USER}>`,
            to: settings.notifications.adminEmail,
            subject: `🔔 Nueva Cita: ${appointment.customer.name} - ${serviceName}`,
            html: emailBody
        });

        console.log(`✅ Email de notificación enviado a ${settings.notifications.adminEmail}`);

        // Actualizar flag de notificación
        appointment.notifications.emailSent = true;
        await appointment.save();

    } catch (error) {
        console.error('❌ Error al enviar notificación al admin:', error);
    }
};

/**
 * Enviar confirmación al cliente
 */
export const sendCustomerConfirmation = async (appointment: IAppointment): Promise<void> => {
    try {
        const settings = await AppointmentSettings.findOne();

        if (!settings || !settings.notifications.emailEnabled) {
            return;
        }

        const transporter = createTransporter();

        const serviceNames: Record<string, string> = {
            maintenance: 'Mantenimiento',
            installation: 'Instalación',
            repair: 'Reparación',
            quotation: 'Cotización',
            emergency: 'Emergencia',
            deepClean: 'Limpieza Profunda',
            gasRefill: 'Recarga de Gas'
        };

        const serviceName = serviceNames[appointment.type] || appointment.type;

        const date = new Date(appointment.scheduledDate);
        const formattedDate = date.toLocaleDateString('es-CO', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const emailBody = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #0EA5E9;">✅ Cita Confirmada</h2>
                
                <p>Estimado/a ${appointment.customer.name},</p>
                
                <p>Su cita ha sido agendada exitosamente:</p>

                <div style="background-color: #e0f2fe; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Servicio:</strong> ${serviceName}</p>
                    <p><strong>Fecha:</strong> ${formattedDate}</p>
                    <p><strong>Hora:</strong> ${appointment.startTime}</p>
                    <p><strong>Duración estimada:</strong> ${appointment.duration} minutos</p>
                    <p><strong>Dirección:</strong> ${appointment.customer.address}</p>
                </div>

                <p>Recibirá un recordatorio 24 horas antes de su cita.</p>

                <p style="margin-top: 30px;">
                    Si necesita cancelar o reprogramar, por favor contáctenos con anticipación.
                </p>

                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 14px;">
                        WTREBOL Innovación<br>
                        Soluciones integrales de climatización
                    </p>
                </div>
            </div>
        `;

        await transporter.sendMail({
            from: `"WTREBOL" <${process.env.EMAIL_USER}>`,
            to: appointment.customer.email,
            subject: `Confirmación de Cita - ${serviceName}`,
            html: emailBody
        });

        console.log(`✅ Email de confirmación enviado a ${appointment.customer.email}`);

    } catch (error) {
        console.error('❌ Error al enviar confirmación al cliente:', error);
    }
};

/**
 * Enviar recordatorio de cita
 */
export const sendReminderEmail = async (appointment: IAppointment): Promise<void> => {
    try {
        const settings = await AppointmentSettings.findOne();

        if (!settings || !settings.notifications.emailEnabled) {
            return;
        }

        const transporter = createTransporter();

        const serviceNames: Record<string, string> = {
            maintenance: 'Mantenimiento',
            installation: 'Instalación',
            repair: 'Reparación',
            quotation: 'Cotización',
            emergency: 'Emergencia',
            deepClean: 'Limpieza Profunda',
            gasRefill: 'Recarga de Gas'
        };

        const serviceName = serviceNames[appointment.type] || appointment.type;

        const date = new Date(appointment.scheduledDate);
        const formattedDate = date.toLocaleDateString('es-CO', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const emailBody = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #F59E0B;">⏰ Recordatorio de Cita</h2>
                
                <p>Estimado/a ${appointment.customer.name},</p>
                
                <p>Le recordamos que tiene una cita programada:</p>

                <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Servicio:</strong> ${serviceName}</p>
                    <p><strong>Fecha:</strong> ${formattedDate}</p>
                    <p><strong>Hora:</strong> ${appointment.startTime}</p>
                    <p><strong>Dirección:</strong> ${appointment.customer.address}</p>
                </div>

                <p style="color: #D97706; font-weight: bold;">
                    Por favor, confirme su asistencia o avísenos si necesita reprogramar.
                </p>

                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 14px;">
                        WTREBOL Innovación<br>
                        Soluciones integrales de climatización
                    </p>
                </div>
            </div>
        `;

        await transporter.sendMail({
            from: `"WTREBOL - Recordatorio" <${process.env.EMAIL_USER}>`,
            to: appointment.customer.email,
            subject: `⏰ Recordatorio: Cita de ${serviceName} - ${formattedDate}`,
            html: emailBody
        });

        console.log(`✅ Recordatorio enviado a ${appointment.customer.email}`);

    } catch (error) {
        console.error('❌ Error al enviar recordatorio:', error);
        throw error;
    }
};
