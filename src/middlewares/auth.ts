import { Request, Response, NextFunction } from 'express';

/**
 * Middleware para verificar si el usuario está autenticado
 */
export const isAuthenticated = (req: Request, res: Response, next: NextFunction): void => {
    if (req.session && req.session.userId) {
        // Usuario autenticado, continuar
        next();
    } else {
        // Usuario no autenticado
        res.status(401).json({
            success: false,
            message: 'No autenticado. Por favor inicia sesión.'
        });
    }
};

/**
 * Middleware para verificar si el usuario es super-admin
 */
export const isSuperAdmin = (req: Request, res: Response, next: NextFunction): void => {
    if (req.session && req.session.userId && req.session.userRole === 'super-admin') {
        // Usuario es super-admin, continuar
        next();
    } else {
        // Usuario no tiene permisos
        res.status(403).json({
            success: false,
            message: 'No tienes permisos para realizar esta acción.'
        });
    }
};
