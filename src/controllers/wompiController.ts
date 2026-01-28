import { Request, Response } from 'express';
import orderService from '../services/orderService';
import wompiService from '../services/wompiService';

/**
 * Controlador para manejar webhooks de Wompi
 */

/**
 * Recibe y procesa webhooks de Wompi
 * POST /api/wompi/webhook
 */
export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
    try {
        const webhookData = req.body;

        console.log('📥 Received Wompi webhook:', JSON.stringify(webhookData, null, 2));

        // Verificar que el evento sea de tipo transaction.updated
        if (webhookData.event !== 'transaction.updated') {
            console.log('⚠️  Ignoring non-transaction event:', webhookData.event);
            res.status(200).json({ received: true });
            return;
        }

        // Verificar la firma del webhook
        const isValid = wompiService.verifyWebhookSignature(webhookData);

        if (!isValid) {
            console.error('❌ Invalid webhook signature');
            res.status(401).json({
                success: false,
                message: 'Invalid signature'
            });
            return;
        }

        console.log('✅ Webhook signature verified');

        // Procesar el webhook
        await orderService.processWompiWebhook(webhookData);

        console.log('✅ Webhook processed successfully');

        // Responder rápidamente a Wompi
        res.status(200).json({
            success: true,
            message: 'Webhook processed successfully'
        });

    } catch (error: any) {
        console.error('💥 Error processing webhook:', error);

        // Aún así responder 200 para evitar reintentos de Wompi
        res.status(200).json({
            success: false,
            message: 'Webhook received but processing failed',
            error: error.message
        });
    }
};

/**
 * Verifica el estado de una transacción en Wompi
 * GET /api/wompi/transaction/:id
 */
export const getTransactionStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const transaction = await wompiService.getTransactionStatus(id as string);

        res.status(200).json({
            success: true,
            transaction
        });
    } catch (error: any) {
        console.error('Error fetching transaction status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch transaction status',
            error: error.message
        });
    }
};
