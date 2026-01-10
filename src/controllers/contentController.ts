import { Request, Response } from 'express';
import Content from '../models/Content';
import { deleteFileFromS3 } from '../utils/s3Upload';

/**
 * GET /api/content/:type
 * Obtener todo el contenido de un tipo específico
 */
export const getContentByType = async (req: Request, res: Response): Promise<void> => {
    try {
        const { type } = req.params;
        const { active } = req.query;

        // Construir filtro
        const filter: any = { type };
        if (active === 'true') {
            filter.isActive = true;
        }

        const content = await Content.find(filter).sort({ order: 1, createdAt: -1 });

        res.status(200).json({
            success: true,
            count: content.length,
            data: content
        });

    } catch (error) {
        console.error('Error al obtener contenido:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener contenido'
        });
    }
};

/**
 * GET /api/content/item/:id
 * Obtener un contenido específico por ID
 */
export const getContentById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const content = await Content.findById(id);

        if (!content) {
            res.status(404).json({
                success: false,
                message: 'Contenido no encontrado'
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: content
        });

    } catch (error) {
        console.error('Error al obtener contenido:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener contenido'
        });
    }
};

/**
 * POST /api/content
 * Crear nuevo contenido
 */
export const createContent = async (req: Request, res: Response): Promise<void> => {
    try {
        const { type, title, description, imageUrl, price, order, isActive, data } = req.body;

        // Validar campos requeridos
        if (!type || !title) {
            res.status(400).json({
                success: false,
                message: 'Tipo y título son requeridos'
            });
            return;
        }

        const newContent = new Content({
            type,
            title,
            description,
            imageUrl,
            price,
            order,
            isActive,
            data
        });

        await newContent.save();

        res.status(201).json({
            success: true,
            message: 'Contenido creado exitosamente',
            data: newContent
        });

    } catch (error) {
        console.error('Error al crear contenido:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear contenido'
        });
    }
};

/**
 * PUT /api/content/:id
 * Actualizar contenido existente
 */
export const updateContent = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Obtener el contenido actual antes de actualizar
        const oldContent = await Content.findById(id);

        if (!oldContent) {
            res.status(404).json({
                success: false,
                message: 'Contenido no encontrado'
            });
            return;
        }

        // Si se está actualizando la imagen y había una imagen anterior, eliminarla de S3
        if (updateData.imageUrl && oldContent.imageUrl && updateData.imageUrl !== oldContent.imageUrl) {
            try {
                await deleteFileFromS3(oldContent.imageUrl);
                console.log(`✅ Imagen anterior eliminada de S3: ${oldContent.imageUrl}`);
            } catch (s3Error) {
                console.error('⚠️  Error al eliminar imagen anterior de S3:', s3Error);
                // Continuar con la actualización aunque falle la eliminación
            }
        }

        // Actualizar el contenido
        const content = await Content.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Contenido actualizado exitosamente',
            data: content
        });

    } catch (error) {
        console.error('Error al actualizar contenido:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar contenido'
        });
    }
};

/**
 * DELETE /api/content/:id
 * Eliminar contenido
 */
export const deleteContent = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const content = await Content.findById(id);

        if (!content) {
            res.status(404).json({
                success: false,
                message: 'Contenido no encontrado'
            });
            return;
        }

        // Eliminar imagen de S3 si existe
        if (content.imageUrl) {
            try {
                await deleteFileFromS3(content.imageUrl);
                console.log(`✅ Imagen eliminada de S3: ${content.imageUrl}`);
            } catch (s3Error) {
                console.error('⚠️  Error al eliminar imagen de S3:', s3Error);
                // Continuar con la eliminación del contenido aunque falle S3
            }
        }

        // Eliminar contenido de la base de datos
        await Content.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Contenido eliminado exitosamente'
        });

    } catch (error) {
        console.error('Error al eliminar contenido:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar contenido'
        });
    }
};
