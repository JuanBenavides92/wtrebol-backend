import { Request, Response } from 'express';
import { uploadFileToS3, deleteFileFromS3 } from '../utils/s3Upload';

/**
 * POST /api/upload
 * Subir archivo (imagen o video) a S3
 */
export const uploadFile = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log('📤 [uploadFile] Upload request received');

        if (!req.file) {
            console.warn('⚠️ [uploadFile] No file provided in request');
            res.status(400).json({
                success: false,
                message: 'No se proporcionó ningún archivo'
            });
            return;
        }

        console.log('📋 [uploadFile] File details:', {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
        });

        // Subir archivo a S3
        console.log('☁️ [uploadFile] Uploading to S3...');
        const fileUrl = await uploadFileToS3(req.file);
        console.log('✅ [uploadFile] File uploaded successfully:', fileUrl);

        res.status(200).json({
            success: true,
            message: 'Archivo subido exitosamente',
            data: {
                url: fileUrl,
                fileName: req.file.originalname,
                fileSize: req.file.size,
                mimeType: req.file.mimetype
            }
        });

    } catch (error) {
        console.error('❌ [uploadFile] Error al subir archivo:', error);
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Error al subir archivo'
        });
    }
};

/**
 * DELETE /api/upload
 * Eliminar archivo de S3
 */
export const deleteFile = async (req: Request, res: Response): Promise<void> => {
    try {
        const { url } = req.body;

        if (!url) {
            res.status(400).json({
                success: false,
                message: 'URL del archivo es requerida'
            });
            return;
        }

        await deleteFileFromS3(url);

        res.status(200).json({
            success: true,
            message: 'Archivo eliminado exitosamente'
        });

    } catch (error) {
        console.error('Error al eliminar archivo:', error);
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Error al eliminar archivo'
        });
    }
};
