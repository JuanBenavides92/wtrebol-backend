import axios from 'axios';
import Order from '../models/Order';
import OrderStatusHistory from '../models/OrderStatusHistory';
import { WompiTransaction, WompiApiResponse } from '../types/wompi';

/**
 * Servicio para verificar transacciones con la API de Wompi
 */
export class WompiVerificationService {
    private readonly apiUrl: string;
    private readonly privateKey: string;

    constructor() {
        this.apiUrl = process.env.WOMPI_API_URL || 'https://production.wompi.co/v1';
        this.privateKey = process.env.WOMPI_PRIVATE_KEY || '';

        if (!this.privateKey) {
            console.warn('⚠️ WOMPI_PRIVATE_KEY not configured. Payment verification will not work.');
        }
    }

    /**
     * Consulta el estado de una transacción en Wompi
     */
    async verifyTransaction(transactionId: string): Promise<WompiTransaction | null> {
        try {
            console.log(`🔍 Verificando transacción con Wompi API: ${transactionId}`);

            const response = await axios.get<WompiApiResponse>(
                `${this.apiUrl}/transactions/${transactionId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.privateKey}`
                    },
                    timeout: 10000 // 10 segundos timeout
                }
            );

            if (response.data && response.data.data) {
                console.log(`✅ Transacción verificada con Wompi:`, {
                    id: response.data.data.id,
                    status: response.data.data.status,
                    reference: response.data.data.reference,
                    amount: response.data.data.amount_in_cents / 100
                });
                return response.data.data;
            }

            console.warn('⚠️ Respuesta de Wompi sin datos');
            return null;

        } catch (error: any) {
            if (error.response?.status === 404) {
                console.error(`❌ Transacción no encontrada en Wompi: ${transactionId}`);
            } else if (error.response?.status === 401) {
                console.error('❌ Error de autenticación con Wompi. Verifica WOMPI_PRIVATE_KEY');
            } else {
                console.error('❌ Error al verificar transacción con Wompi:', error.message);
            }
            return null;
        }
    }

    /**
     * Verifica una transacción y actualiza el pedido
     */
    async verifyAndUpdateOrder(
        orderId: string,
        transactionId: string,
        customerId?: string
    ): Promise<any> {
        // 1. Verificar transacción con Wompi API
        const transaction = await this.verifyTransaction(transactionId);

        if (!transaction) {
            throw new Error('No se pudo verificar la transacción con Wompi. La transacción no existe o hubo un error de conexión.');
        }

        // 2. Buscar pedido en la base de datos
        const query: any = { _id: orderId };
        if (customerId) {
            query.customerId = customerId;
        }

        const order = await Order.findOne(query);

        if (!order) {
            throw new Error('Pedido no encontrado');
        }

        // 3. Validar que la referencia coincida
        if (transaction.reference !== order.orderNumber) {
            console.error(`❌ Referencia no coincide:`, {
                wompi: transaction.reference,
                order: order.orderNumber
            });
            throw new Error(
                `La referencia de Wompi (${transaction.reference}) no coincide con el pedido (${order.orderNumber}). Posible intento de fraude.`
            );
        }

        // 4. Validar que el monto coincida
        const expectedAmount = Math.round(order.total * 100);
        if (transaction.amount_in_cents !== expectedAmount) {
            console.error(`❌ Monto no coincide:`, {
                wompi: transaction.amount_in_cents / 100,
                order: order.total
            });
            throw new Error(
                `El monto de Wompi ($${transaction.amount_in_cents / 100}) no coincide con el pedido ($${order.total}). Posible intento de fraude.`
            );
        }

        // 5. Guardar estado anterior para el historial
        const previousStatus = order.status;

        // 6. Actualizar según el estado verificado de Wompi
        if (transaction.status === 'APPROVED') {
            // Pago aprobado - actualizar pedido
            order.paymentStatus = 'approved';
            order.status = 'payment_confirmed';
            order.paidAt = new Date();
            order.wompiTransactionId = transaction.id;
            order.wompiPaymentMethod = transaction.payment_method_type;

            // Datos de tarjeta si están disponibles
            if (transaction.payment_method.extra) {
                order.wompiCardBrand = transaction.payment_method.extra.brand;
                order.wompiCardLast4 = transaction.payment_method.extra.last_four;
            }

            // Código de aprobación
            if (transaction.status_message) {
                order.wompiApprovalCode = transaction.status_message;
            }

            // Link al recibo oficial de Wompi
            order.wompiPaymentLink = `https://comercios.wompi.co/transactions/${transaction.id}`;

            order.statusUpdatedAt = new Date();

            await order.save();

            // Registrar en historial de estados
            await OrderStatusHistory.create({
                orderId: order._id,
                orderNumber: order.orderNumber,
                previousStatus: previousStatus as any,
                newStatus: order.status as any,
                changedByType: 'system',
                notes: `Pago verificado con Wompi API - Transaction ID: ${transaction.id} - Status: ${transaction.status}`
            });

            console.log(`✅ Pedido ${order.orderNumber} actualizado y verificado con Wompi`);

            return {
                success: true,
                message: 'Pago verificado y confirmado con Wompi',
                order,
                transaction,
                verified: true
            };

        } else if (transaction.status === 'DECLINED') {
            // Pago rechazado
            order.paymentStatus = 'declined';
            order.wompiTransactionId = transaction.id;
            await order.save();

            console.log(`❌ Pago rechazado por Wompi: ${order.orderNumber}`);

            return {
                success: false,
                message: 'El pago fue rechazado por la entidad bancaria',
                transaction,
                verified: true
            };

        } else if (transaction.status === 'PENDING') {
            // Pago pendiente
            console.log(`⏳ Pago pendiente en Wompi: ${order.orderNumber}`);

            return {
                success: false,
                message: 'El pago está pendiente de confirmación',
                transaction,
                verified: true
            };

        } else {
            // Otro estado (VOIDED, ERROR, etc.)
            console.log(`⚠️ Pago en estado ${transaction.status}: ${order.orderNumber}`);

            return {
                success: false,
                message: `El pago está en estado: ${transaction.status}`,
                transaction,
                verified: true
            };
        }
    }
}

export default new WompiVerificationService();
