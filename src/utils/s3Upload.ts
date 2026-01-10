import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, S3_CONFIG } from '../config/s3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

/**
 * Generar nombre único para archivo
 */
export const generateUniqueFileName = (originalName: string): string => {
    const extension = path.extname(originalName);
    const uniqueId = uuidv4();
    return `${uniqueId}${extension}`;
};

/**
 * Subir archivo a S3
 */
export const uploadFileToS3 = async (
    file: Express.Multer.File
): Promise<string> => {
    try {
        const fileName = generateUniqueFileName(file.originalname);
        const key = `${S3_CONFIG.folder}${fileName}`;

        const command = new PutObjectCommand({
            Bucket: S3_CONFIG.bucketName,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype
            // ACL removido - el bucket usa políticas en lugar de ACLs
        });

        await s3Client.send(command);

        // Construir URL pública
        const publicUrl = `https://${S3_CONFIG.bucketName}.s3.${S3_CONFIG.region}.amazonaws.com/${key}`;

        return publicUrl;

    } catch (error) {
        console.error('Error al subir archivo a S3:', error);
        throw new Error('Error al subir archivo a S3');
    }
};

/**
 * Eliminar archivo de S3
 */
export const deleteFileFromS3 = async (fileUrl: string): Promise<void> => {
    try {
        // Extraer la key del URL
        const urlParts = fileUrl.split('.amazonaws.com/');
        if (urlParts.length < 2) {
            throw new Error('URL de S3 inválida');
        }

        const key = urlParts[1];

        const command = new DeleteObjectCommand({
            Bucket: S3_CONFIG.bucketName,
            Key: key
        });

        await s3Client.send(command);

    } catch (error) {
        console.error('Error al eliminar archivo de S3:', error);
        throw new Error('Error al eliminar archivo de S3');
    }
};
