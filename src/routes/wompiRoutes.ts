import express from 'express';
import * as wompiController from '../controllers/wompiController';

const router = express.Router();

/**
 * Rutas para Wompi Payment Gateway
 */

// Webhook de Wompi (recibe eventos de transacciones)
router.post('/webhook', wompiController.handleWebhook);

// Verificar estado de transacción
router.get('/transaction/:id', wompiController.getTransactionStatus);

export default router;
