import { Request, Response, NextFunction } from 'express';

/**
 * Middleware para verificar si el usuario está autenticado
 */
export const isAuthenticated = (req: Request, res: Response, next: NextFunction): void => {
    console.log('🔐 [isAuthenticated] ================================');
    console.log('🔐 [isAuthenticated] URL:', req.method, req.path);
    console.log('🔐 [isAuthenticated] Cookies recibidas:', req.headers.cookie);
    console.log('🔐 [isAuthenticated] Session ID:', req.sessionID);
    console.log('🔐 [isAuthenticated] Session data:', JSON.stringify(req.session, null, 2));
    console.log('🔐 [isAuthenticated] userId en session:', req.session?.userId);

    if (req.session && req.session.userId) {
        console.log('✅ [isAuthenticated] Usuario autenticado:', req.session.userId);
        // Usuario autenticado, continuar
        next();
    } else {
        console.error('❌ [isAuthenticated] NO autenticado - session:', !!req.session, 'userId:', req.session?.userId);
        // Usuario no autenticado
        res.status(401).json({
            success: false,
            message: 'No autenticado. Por favor inicia sesión.'
        });
    }
    console.log('🔐 [isAuthenticated] ================================');
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
