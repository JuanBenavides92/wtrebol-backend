import multer from 'multer';
import { Request } from 'express';

/**
 * Configuración de Multer para upload de archivos
 */

// Tipos de archivo permitidos
const ALLOWED_FILE_TYPES = [
    // Imágenes
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    // Videos
    'video/mp4',
    'video/webm',
    'video/quicktime', // .mov
    'video/x-msvideo'  // .avi
];

// Tamaño máximo: 30MB
const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30MB en bytes

/**
 * Filtro de archivos
 */
const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    if (ALLOWED_FILE_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de archivo no permitido. Solo se permiten imágenes (jpg, png, webp, gif) y videos (mp4, webm, mov, avi)'));
    }
};

/**
 * Configuración de Multer
 * Almacena archivos en memoria (buffer) para subirlos directamente a S3
 */
export const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: MAX_FILE_SIZE
    },
    fileFilter: fileFilter
});
