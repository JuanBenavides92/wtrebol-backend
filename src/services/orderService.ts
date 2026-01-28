import Order, { IOrder, IOrderItem } from '../models/Order';
import WompiTransaction from '../models/WompiTransaction';
import wompiService from './wompiService';
import storeSettingsService from './storeSettingsService';
import nodemailer from 'nodemailer';

/**
 * Interface para crear una orden
 */
interface CreateOrderData {
    customerId: string;
    customerEmail: string;
    customerName: string;
    customerPhone: string;
    items: IOrderItem[];
    shippingInfo: {
        name: string;
        phone: string;
        address: string;
        city: string;
        notes?: string;
    };
    idempotencyKey?: string; // Llave de idempotencia para prevenir duplicados
}

/**
 * Servicio para manejar la lógica de órdenes
 */
class OrderService {
    /**
     * Crea una nueva orden y genera la firma de Wompi
     */
    async createOrder(data: CreateOrderData): Promise<IOrder> {
        try {
            // Calcular subtotal
            const subtotal = data.items.reduce((sum, item) => sum + item.subtotal, 0);

            // Obtener configuración de la tienda y calcular impuestos dinámicamente
            const taxes = await storeSettingsService.calculateTaxes(subtotal);

            // Total
            const total = taxes.total;

            // Generar referencia única
            const orderNumber = wompiService.generateOrderReference();

            // Convertir total a centavos
            const totalInCents = wompiService.convertToCents(total);

            // Generar firma de integridad
            const signature = wompiService.generateSignature(
                orderNumber,
                totalInCents,
                'COP'
            );

            // Crear la orden
            const order = new Order({
                orderNumber,
                customerId: data.customerId,
                customerEmail: data.customerEmail,
                customerName: data.customerName,
                items: data.items,
                subtotal,
                taxVAT: taxes.taxVAT,
                taxConsumption: taxes.taxConsumption,
                shipping: taxes.shipping,
                total,
                currency: 'COP',
                status: 'pending_payment',
                paymentStatus: 'pending',
                wompiSignature: signature,
                shippingInfo: data.shippingInfo,
                idempotencyKey: data.idempotencyKey // Incluir llave de idempotencia
            });

            await order.save();

            return order;
        } catch (error: any) {
            console.error('Error creating order:', error);
            throw new Error(`Failed to create order: ${error.message}`);
        }
    }

    /**
     * Obtiene una orden por ID
     */
    async getOrderById(orderId: string): Promise<IOrder | null> {
        try {
            return await Order.findById(orderId);
        } catch (error: any) {
            console.error('Error fetching order:', error);
            throw new Error(`Failed to fetch order: ${error.message}`);
        }
    }

    /**
     * Obtiene una orden por número de orden (referencia)
     */
    async getOrderByNumber(orderNumber: string): Promise<IOrder | null> {
        try {
            return await Order.findOne({ orderNumber });
        } catch (error: any) {
            console.error('Error fetching order by number:', error);
            throw new Error(`Failed to fetch order: ${error.message}`);
        }
    }

    /**
     * Obtiene todas las órdenes de un cliente
     */
    async getCustomerOrders(customerId: string): Promise<IOrder[]> {
        try {
            return await Order.find({ customerId })
                .sort({ createdAt: -1 })
                .limit(50);
        } catch (error: any) {
            console.error('Error fetching customer orders:', error);
            throw new Error(`Failed to fetch customer orders: ${error.message}`);
        }
    }

    /**
     * Actualiza el estado de una orden
     */
    async updateOrderStatus(
        orderId: string,
        status: string,
        paymentStatus?: string
    ): Promise<IOrder | null> {
        try {
            const updateData: any = {
                status,
                statusUpdatedAt: new Date()
            };

            if (paymentStatus) {
                updateData.paymentStatus = paymentStatus;

                if (paymentStatus === 'approved') {
                    updateData.paidAt = new Date();
                    updateData.status = 'payment_confirmed'; // Cambiar estado a confirmado si el pago fue aprobado
                }
            }

            return await Order.findByIdAndUpdate(
                orderId,
                updateData,
                { new: true }
            );
        } catch (error: any) {
            console.error('Error updating order status:', error);
            throw new Error(`Failed to update order status: ${error.message}`);
        }
    }

    /**
     * Procesa un webhook de Wompi
     */
    async processWompiWebhook(webhookData: any): Promise<void> {
        try {
            const transaction = webhookData.data.transaction;
            const reference = transaction.reference;

            // Buscar la orden por referencia
            const order = await this.getOrderByNumber(reference);

            if (!order) {
                console.error(`Order not found for reference: ${reference}`);
                return;
            }

            // Guardar la transacción
            const wompiTransaction = new WompiTransaction({
                orderId: order._id,
                transactionId: transaction.id,
                reference: reference,
                status: transaction.status,
                statusMessage: transaction.status_message,
                paymentMethod: transaction.payment_method_type,
                paymentMethodType: transaction.payment_method?.type,
                amount: transaction.amount_in_cents,
                currency: transaction.currency,
                customerEmail: transaction.customer_email,
                rawWebhookData: webhookData
            });

            await wompiTransaction.save();

            // Actualizar estado de la orden según el estado de la transacción
            let orderStatus = order.status;
            let paymentStatus = 'pending';

            switch (transaction.status) {
                case 'APPROVED':
                    orderStatus = 'payment_confirmed';
                    paymentStatus = 'approved';
                    break;
                case 'DECLINED':
                    orderStatus = 'pending_payment';
                    paymentStatus = 'declined';
                    break;
                case 'VOIDED':
                    orderStatus = 'cancelled';
                    paymentStatus = 'voided';
                    break;
                case 'ERROR':
                    orderStatus = 'pending_payment';
                    paymentStatus = 'declined';
                    break;
            }

            // Actualizar orden
            await this.updateOrderStatus(order._id.toString(), orderStatus, paymentStatus);

            // Actualizar wompiTransactionId y paymentMethod en la orden
            await Order.findByIdAndUpdate(order._id, {
                wompiTransactionId: transaction.id,
                wompiPaymentMethod: transaction.payment_method_type
            });

            // Enviar email de confirmación si el pago fue aprobado
            if (transaction.status === 'APPROVED') {
                await this.sendOrderConfirmationEmail(order, transaction);
            }

        } catch (error: any) {
            console.error('Error processing Wompi webhook:', error);
            throw new Error(`Failed to process webhook: ${error.message}`);
        }
    }

    /**
     * Envía email de confirmación de orden
     */
    private async sendOrderConfirmationEmail(order: IOrder, transaction: any): Promise<void> {
        try {
            // Configurar transporter de nodemailer
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT || '587'),
                secure: process.env.SMTP_SECURE === 'true',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            });

            // Formatear items para el email
            const itemsHtml = order.items.map(item => `
                <tr>
                    <td>${item.title}</td>
                    <td>${item.quantity}</td>
                    <td>$${item.priceNumeric.toLocaleString('es-CO')}</td>
                    <td>$${item.subtotal.toLocaleString('es-CO')}</td>
                </tr>
            `).join('');

            const emailHtml = `
                <h2>¡Gracias por tu compra en WTREBOL!</h2>
                <p>Hola ${order.customerName},</p>
                <p>Tu pago ha sido procesado exitosamente. Aquí están los detalles de tu orden:</p>
                
                <h3>Orden #${order.orderNumber}</h3>
                
                <table border="1" cellpadding="10" style="border-collapse: collapse; width: 100%;">
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Cantidad</th>
                            <th>Precio Unit.</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>
                
                <p><strong>Subtotal:</strong> $${order.subtotal.toLocaleString('es-CO')}</p>
                <p><strong>IVA (19%):</strong> $${order.taxVAT.toLocaleString('es-CO')}</p>
                <p><strong>Total:</strong> $${order.total.toLocaleString('es-CO')}</p>
                
                <h3>Información de Envío:</h3>
                <p>
                    <strong>Nombre:</strong> ${order.shippingInfo.name}<br>
                    <strong>Teléfono:</strong> ${order.shippingInfo.phone}<br>
                    <strong>Dirección:</strong> ${order.shippingInfo.address}<br>
                    <strong>Ciudad:</strong> ${order.shippingInfo.city}
                </p>
                
                <p><strong>Método de Pago:</strong> ${transaction.payment_method_type}</p>
                <p><strong>ID de Transacción:</strong> ${transaction.id}</p>
                
                <p>Nos pondremos en contacto contigo pronto para coordinar la entrega.</p>
                
                <p>Saludos,<br>Equipo WTREBOL</p>
            `;

            await transporter.sendMail({
                from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
                to: order.customerEmail,
                subject: `Confirmación de Orden #${order.orderNumber} - WTREBOL`,
                html: emailHtml
            });

            console.log(`✅ Confirmation email sent to ${order.customerEmail}`);
        } catch (error: any) {
            console.error('Error sending confirmation email:', error);
            // No lanzar error para no bloquear el proceso del webhook
        }
    }
}

export default new OrderService();
