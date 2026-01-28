import { Request, Response } from 'express';
import crypto from 'crypto';
import Order from '../models/Order';
import OrderStatusHistory from '../models/OrderStatusHistory';

/**
 * POST /api/webhooks/wompi
 * Endpoint para recibir notificaciones de Wompi
 * 
 * Este endpoint es llamado por Wompi cuando el estado de una transacción cambia.
 * Permite recuperar pagos automáticamente sin depender del callback del widget.
 */
export const handleWompiWebhook = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log('📨 Webhook recibido de Wompi:', {
            event: req.body.event,
            timestamp: req.body.sent_at
        });

        // 1. Verificar firma del webhook
        const signature = req.headers['x-wompi-signature'] as string;
        const eventsSecret = process.env.WOMPI_EVENTS_SECRET || '';

        if (!signature) {
            console.error('❌ Webhook sin firma');
            res.status(401).json({ error: 'Missing signature' });
            return;
        }

        if (!eventsSecret) {
            console.error('❌ WOMPI_EVENTS_SECRET no configurado');
            res.status(500).json({ error: 'Server configuration error' });
            return;
        }

        // Calcular firma esperada
        const payload = JSON.stringify(req.body);
        const expectedSignature = crypto
            .createHmac('sha256', eventsSecret)
            .update(payload)
            .digest('hex');

        if (signature !== expectedSignature) {
            console.error('❌ Firma inválida del webhook');
            console.error('   Esperada:', expectedSignature);
            console.error('   Recibida:', signature);
            res.status(401).json({ error: 'Invalid signature' });
            return;
        }

        console.log('✅ Firma del webhook verificada correctamente');

        // 2. Extraer datos del evento
        const { event, data, sent_at } = req.body;

        // 3. Procesar solo eventos de transacciones
        if (event === 'transaction.updated') {
            const transaction = data.transaction;

            console.log(`📦 Procesando transacción actualizada:`);
            console.log(`   ID: ${transaction.id}`);
            console.log(`   Estado: ${transaction.status}`);
            console.log(`   Referencia: ${transaction.reference}`);
            console.log(`   Monto: $${transaction.amount_in_cents / 100}`);

            // 4. Buscar pedido por referencia (orderNumber)
            const order = await Order.findOne({
                orderNumber: transaction.reference
            });

            if (!order) {
                console.warn(`⚠️ Pedido no encontrado para referencia: ${transaction.reference}`);
                // Respondemos 200 para que Wompi no reintente
                res.status(200).json({
                    received: true,
                    message: 'Order not found but acknowledged'
                });
                return;
            }

            console.log(`✅ Pedido encontrado: ${order.orderNumber}`);

            // 5. Validar que el monto coincida
            const expectedAmount = Math.round(order.total * 100);
            if (transaction.amount_in_cents !== expectedAmount) {
                console.error(`❌ Monto no coincide:`);
                console.error(`   Wompi: $${transaction.amount_in_cents / 100}`);
                console.error(`   Pedido: $${order.total}`);
                res.status(400).json({ error: 'Amount mismatch' });
                return;
            }

            console.log(`✅ Monto validado correctamente`);

            // 6. Guardar estado anterior para el historial
            const previousStatus = order.status;

            // 7. Actualizar según el estado de la transacción
            if (transaction.status === 'APPROVED' && order.status !== 'payment_confirmed') {
                // Pago aprobado - actualizar pedido
                order.paymentStatus = 'approved';
                order.status = 'payment_confirmed';
                order.paidAt = new Date();
                order.wompiTransactionId = transaction.id;
                order.wompiPaymentMethod = transaction.payment_method_type;

                // Datos de tarjeta si están disponibles
                if (transaction.payment_method?.extra) {
                    order.wompiCardBrand = transaction.payment_method.extra.brand;
                    order.wompiCardLast4 = transaction.payment_method.extra.last_four;
                }

                // Código de aprobación
                if (transaction.status_message) {
                    order.wompiApprovalCode = transaction.status_message;
                }

                // Link al recibo
                order.wompiPaymentLink = `https://comercios.wompi.co/transactions/${transaction.id}`;

                order.statusUpdatedAt = new Date();
                await order.save();

                // Registrar en historial
                await OrderStatusHistory.create({
                    orderId: order._id,
                    orderNumber: order.orderNumber,
                    previousStatus: previousStatus as any,
                    newStatus: order.status as any,
                    changedByType: 'system',
                    notes: `Pago confirmado automáticamente vía webhook de Wompi - Transaction ID: ${transaction.id}`
                });

                console.log(`✅ Pedido ${order.orderNumber} actualizado exitosamente vía webhook`);
                console.log(`   Estado anterior: ${previousStatus}`);
                console.log(`   Estado nuevo: ${order.status}`);

            } else if (transaction.status === 'DECLINED') {
                // Pago rechazado
                if (order.paymentStatus !== 'declined') {
                    order.paymentStatus = 'declined';
                    order.wompiTransactionId = transaction.id;
                    await order.save();
                    console.log(`❌ Pago rechazado vía webhook: ${order.orderNumber}`);
                }

            } else if (transaction.status === 'VOIDED') {
                // Pago anulado
                if (order.paymentStatus !== 'voided') {
                    order.paymentStatus = 'voided';
                    await order.save();
                    console.log(`⚠️ Pago anulado vía webhook: ${order.orderNumber}`);
                }

            } else {
                console.log(`ℹ️ Estado no procesado: ${transaction.status} para pedido ${order.orderNumber}`);
            }

            // Responder exitosamente
            res.status(200).json({
                received: true,
                order_number: order.orderNumber,
                processed: true
            });

        } else {
            // Evento no procesado
            console.log(`ℹ️ Evento no procesado: ${event}`);
            res.status(200).json({
                received: true,
                message: `Event ${event} acknowledged but not processed`
            });
        }

    } catch (error: any) {
        console.error('❌ Error procesando webhook de Wompi:', error.message);
        console.error('Stack trace:', error.stack);

        // Responder con error 500 para que Wompi reintente
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
};
