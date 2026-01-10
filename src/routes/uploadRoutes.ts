import { Router } from 'express';
import { uploadFile, deleteFile } from '../controllers/uploadController';
import { upload } from '../middlewares/upload';
import { isAuthenticated } from '../middlewares/auth';

const router = Router();

/**
 * @route   POST /api/upload
 * @desc    Subir archivo (imagen o video) a AWS S3
 * @access  Private (requiere autenticación)
 * @body    multipart/form-data con campo 'file'
 */
router.post('/', isAuthenticated, upload.single('file'), uploadFile);

/**
 * @route   DELETE /api/upload
 * @desc    Eliminar archivo de AWS S3
 * @access  Private (requiere autenticación)
 * @body    { "url": "https://..." }
 */
router.delete('/', isAuthenticated, deleteFile);

export default router;
