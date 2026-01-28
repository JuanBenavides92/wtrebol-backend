import express from 'express';
import { handleWompiWebhook } from '../controllers/webhooksController';

const router = express.Router();

/**
 * POST /api/webhooks/wompi
 * 
 * Endpoint público para recibir notificaciones de Wompi.
 * No requiere autenticación de usuario, la seguridad se maneja
 * mediante verificación de firma HMAC.
 */
router.post('/wompi', handleWompiWebhook);

export default router;
