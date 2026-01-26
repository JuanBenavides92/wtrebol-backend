import { Request, Response, NextFunction } from 'express';

/**
 * Extender Request para incluir customerId y customerEmail
 */
declare global {
    namespace Express {
        interface Request {
            customerId?: string;
            customerEmail?: string;
        }
    }
}

/**
 * Middleware para verificar si el cliente está autenticado
 */
export const isCustomerAuthenticated = (req: Request, res: Response, next: NextFunction): void => {
    if (req.session && req.session.customerId) {
        // Cliente autenticado, agregar a req para uso posterior
        req.customerId = req.session.customerId;
        req.customerEmail = req.session.customerEmail;
        next();
    } else {
        // Cliente no autenticado
        res.status(401).json({
            success: false,
            message: 'No autenticado. Por favor inicia sesión como cliente.'
        });
    }
};
