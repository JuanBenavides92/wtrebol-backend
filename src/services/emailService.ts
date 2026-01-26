import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

/**
 * Servicio de Email con Nodemailer
 * Configurado para usar Gmail SMTP
 */
class EmailService {
    private transporter: Transporter;

    constructor() {
        // Configurar transporter de Nodemailer con Gmail
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true', // false para puerto 587
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        // Verificar conexión al iniciar
        this.verifyConnection();
    }

    /**
     * Verifica la conexión con el servidor SMTP
     */
    private async verifyConnection() {
        try {
            await this.transporter.verify();
            console.log('✅ Servidor SMTP conectado y listo para enviar emails');
        } catch (error) {
            console.error('❌ Error al conectar con servidor SMTP:', error);
        }
    }

    /**
     * Envía un email
     * @param to - Email del destinatario
     * @param subject - Asunto del email
     * @param html - Contenido HTML del email
     * @param text - Contenido texto plano (opcional)
     */
    async sendEmail(to: string, subject: string, html: string, text?: string) {
        try {
            const info = await this.transporter.sendMail({
                from: `"${process.env.SMTP_FROM_NAME || 'WTREBOL'}" <${process.env.SMTP_FROM_EMAIL}>`,
                to,
                subject,
                html,
                text: text || this.stripHtml(html),
            });

            console.log('✅ Email enviado:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('❌ Error al enviar email:', error);
            return { success: false, error };
        }
    }

    /**
     * Envía email de confirmación de pedido al cliente
     */
    async sendOrderConfirmation(orderData: {
        customerEmail: string;
        customerName: string;
        orderNumber: string;
        items: Array<{ title: string; quantity: number; price: string }>;
        total: number;
        shippingInfo: { address: string; city: string };
    }) {
        const { customerEmail, customerName, orderNumber, items, total, shippingInfo } = orderData;

        const itemsHtml = items
            .map(
                (item) => `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.title}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.price}</td>
            </tr>
        `
            )
            .join('');

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #0ea5e9 0%, #10b981 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🎉 ¡Pedido Confirmado!</h1>
    </div>
    
    <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px; margin-bottom: 20px;">Hola <strong>${customerName}</strong>,</p>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
            ¡Gracias por tu compra! Hemos recibido tu pedido <strong>#${orderNumber}</strong> y lo estamos procesando.
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #0ea5e9; margin-top: 0; font-size: 20px;">📦 Resumen del Pedido</h2>
            
            <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
                <thead>
                    <tr style="background: #f3f4f6;">
                        <th style="padding: 10px; text-align: left; border-bottom: 2px solid #0ea5e9;">Producto</th>
                        <th style="padding: 10px; text-align: center; border-bottom: 2px solid #0ea5e9;">Cant.</th>
                        <th style="padding: 10px; text-align: right; border-bottom: 2px solid #0ea5e9;">Precio</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="2" style="padding: 15px 10px 10px 10px; text-align: right; font-weight: bold; font-size: 18px;">Total:</td>
                        <td style="padding: 15px 10px 10px 10px; text-align: right; font-weight: bold; font-size: 18px; color: #10b981;">
                            $${total.toLocaleString('es-CO', { minimumFractionDigits: 0 })}
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #0ea5e9; margin-top: 0; font-size: 20px;">📍 Dirección de Envío</h2>
            <p style="margin: 5px 0;"><strong>${shippingInfo.address}</strong></p>
            <p style="margin: 5px 0; color: #6b7280;">${shippingInfo.city}</p>
        </div>
        
        <div style="background: #e0f2fe; border-left: 4px solid #0ea5e9; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; font-size: 14px;">
                <strong>📧 ¿Necesitas ayuda?</strong><br>
                Responde a este email o contáctanos a través de nuestros canales de atención al cliente.
            </p>
        </div>
        
        <p style="font-size: 14px; color: #6b7280; text-align: center; margin-top: 30px;">
            Gracias por confiar en WTREBOL<br>
            <a href="${process.env.FRONTEND_URL}" style="color: #0ea5e9; text-decoration: none;">www.wtrebol.com</a>
        </p>
    </div>
</body>
</html>
        `;

        return this.sendEmail(customerEmail, `Confirmación de Pedido #${orderNumber}`, html);
    }

    /**
     * Envía email de nuevo pedido a los administradores
     */
    async sendNewOrderNotification(orderData: {
        orderNumber: string;
        customerName: string;
        customerEmail: string;
        total: number;
        itemCount: number;
    }) {
        const { orderNumber, customerName, customerEmail, total, itemCount } = orderData;

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🔔 Nuevo Pedido Recibido</h1>
    </div>
    
    <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #8b5cf6; margin-top: 0;">Detalles del Pedido</h2>
            <table style="width: 100%;">
                <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Número de Pedido:</td>
                    <td style="padding: 8px 0; font-weight: bold; text-align: right;">#${orderNumber}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Cliente:</td>
                    <td style="padding: 8px 0; font-weight: bold; text-align: right;">${customerName}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Email:</td>
                    <td style="padding: 8px 0; text-align: right;">${customerEmail}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Productos:</td>
                    <td style="padding: 8px 0; font-weight: bold; text-align: right;">${itemCount} ${itemCount === 1 ? 'producto' : 'productos'}</td>
                </tr>
                <tr style="border-top: 2px solid #8b5cf6;">
                    <td style="padding: 15px 0 0 0; color: #6b7280; font-size: 18px; font-weight: bold;">Total:</td>
                    <td style="padding: 15px 0 0 0; text-align: right; font-size: 20px; font-weight: bold; color: #10b981;">
                        $${total.toLocaleString('es-CO', { minimumFractionDigits: 0 })}
                    </td>
                </tr>
            </table>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL}/admin/pedidos/${orderNumber}" 
               style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                Ver Pedido en Panel Admin
            </a>
        </div>
        
        <p style="font-size: 14px; color: #6b7280; text-align: center; margin-top: 30px;">
            Panel de Administración WTREBOL
        </p>
    </div>
</body>
</html>
        `;

        // Enviar a múltiples admins si es necesario
        const adminEmails = ['anvidga1@gmail.com']; // Puedes agregar más emails aquí

        const promises = adminEmails.map(email =>
            this.sendEmail(email, `🔔 Nuevo Pedido #${orderNumber}`, html)
        );

        return Promise.all(promises);
    }

    /**
     * Envía email de cambio de estado de pedido
     */
    async sendOrderStatusUpdate(orderData: {
        customerEmail: string;
        customerName: string;
        orderNumber: string;
        newStatus: string;
        statusLabel: string;
        notes?: string;
    }) {
        const { customerEmail, customerName, orderNumber, statusLabel, notes } = orderData;

        const statusEmojis: Record<string, string> = {
            confirmed: '✅',
            processing: '⚙️',
            shipped: '🚚',
            delivered: '📦',
            cancelled: '❌'
        };

        const emoji = statusEmojis[orderData.newStatus] || '📋';

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #0ea5e9 0%, #10b981 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">${emoji} Actualización de Pedido</h1>
    </div>
    
    <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px; margin-bottom: 20px;">Hola <strong>${customerName}</strong>,</p>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
            Tu pedido <strong>#${orderNumber}</strong> ha sido actualizado.
        </p>
        
        <div style="background: white; padding: 25px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center;">
            <p style="font-size: 14px; color: #6b7280; margin: 0 0 10px 0;">Nuevo Estado:</p>
            <p style="font-size: 24px; font-weight: bold; color: #0ea5e9; margin: 0;">
                ${emoji} ${statusLabel}
            </p>
        </div>
        
        ${notes ? `
        <div style="background: #e0f2fe; border-left: 4px solid #0ea5e9; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; font-size: 14px;">
                <strong>Nota:</strong><br>
                ${notes}
            </p>
        </div>
        ` : ''}
        
        <p style="font-size: 14px; color: #6b7280; text-align: center; margin-top: 30px;">
            Gracias por tu compra<br>
            <a href="${process.env.FRONTEND_URL}" style="color: #0ea5e9; text-decoration: none;">www.wtrebol.com</a>
        </p>
    </div>
</body>
</html>
        `;

        return this.sendEmail(customerEmail, `Actualización de Pedido #${orderNumber}`, html);
    }

    /**
     * Remueve tags HTML de un string
     */
    private stripHtml(html: string): string {
        return html.replace(/<[^>]*>/g, '');
    }
}

// Exportar instancia singleton
export default new EmailService();
