import { Request, Response } from 'express';
import SiteConfig from '../models/SiteConfig';
import { uploadFileToS3 } from '../utils/s3Upload';

/**
 * GET /api/config/site
 * Obtener configuración actual del sitio (público)
 */
export const getSiteConfig = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log('📋 [getSiteConfig] Fetching site configuration...');

        // Usar método estático para obtener o crear configuración
        const config = await (SiteConfig as any).getSettings();

        console.log('✅ [getSiteConfig] Configuration retrieved:', {
            logoUrl: config.logoUrl ? 'Set' : 'Not set',
            logoText: config.logoText
        });

        res.status(200).json({
            success: true,
            data: config
        });

    } catch (error) {
        console.error('❌ [getSiteConfig] Error fetching configuration:', error);
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Error al obtener configuración'
        });
    }
};

/**
 * POST /api/config/site
 * Actualizar configuración del sitio (admin)
 */
export const updateSiteConfig = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log('📝 [updateSiteConfig] Update request received');
        console.log('📋 [updateSiteConfig] Body:', req.body);
        console.log('📁 [updateSiteConfig] File:', req.file ? req.file.originalname : 'No file');

        const {
            logoText,
            logoSubtext,
            logoHeight,
            primaryColor,
            secondaryColor,
            contactPhone,
            contactEmail,
            socialLinks
        } = req.body;

        // Obtener configuración actual
        let config = await (SiteConfig as any).getSettings();

        // Manejar archivos subidos
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        // Si hay archivo de logo, subirlo a S3
        if (files?.logo?.[0]) {
            console.log('☁️ [updateSiteConfig] Uploading logo to S3...');
            const logoUrl = await uploadFileToS3(files.logo[0]);
            config.logoUrl = logoUrl;
            console.log('✅ [updateSiteConfig] Logo uploaded:', logoUrl);
        }

        // Si hay archivo de favicon, subirlo a S3
        if (files?.favicon?.[0]) {
            console.log('☁️ [updateSiteConfig] Uploading favicon to S3...');
            const faviconUrl = await uploadFileToS3(files.favicon[0]);
            config.faviconUrl = faviconUrl;
            console.log('✅ [updateSiteConfig] Favicon uploaded:', faviconUrl);
        }

        // Actualizar campos de texto
        if (logoText !== undefined) config.logoText = logoText;
        if (logoSubtext !== undefined) config.logoSubtext = logoSubtext;
        if (logoHeight !== undefined) config.logoHeight = parseInt(logoHeight as any);
        if (contactPhone !== undefined) config.contactPhone = contactPhone;
        if (contactEmail !== undefined) config.contactEmail = contactEmail;

        // Actualizar redes sociales
        if (socialLinks) {
            try {
                const parsedLinks = typeof socialLinks === 'string'
                    ? JSON.parse(socialLinks)
                    : socialLinks;
                config.socialLinks = {
                    ...config.socialLinks,
                    ...parsedLinks
                };
            } catch (e) {
                console.warn('⚠️ [updateSiteConfig] Error parsing socialLinks:', e);
            }
        }

        // Guardar usuario que actualizó (si está disponible en la sesión)
        if (req.session?.userId) {
            config.updatedBy = req.session.userId;
        }

        config.updatedAt = new Date();
        await config.save();

        console.log('✅ [updateSiteConfig] Configuration updated successfully');

        res.status(200).json({
            success: true,
            message: 'Configuración actualizada exitosamente',
            data: config
        });

    } catch (error) {
        console.error('❌ [updateSiteConfig] Error updating configuration:', error);
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Error al actualizar configuración'
        });
    }
};
