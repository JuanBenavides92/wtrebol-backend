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

        console.log('📝 Actualizando contenido:', id);
        console.log('📦 Datos recibidos:', JSON.stringify(updateData, null, 2));

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

        console.log('🔍 [DEBUG] Inspeccionando schema de Content...');
        console.log('📋 [DEBUG] category schema:', JSON.stringify(Content.schema.path('category')));
        console.log('📋 [DEBUG] condition schema:', JSON.stringify(Content.schema.path('condition')));

        // Actualizar el contenido
        const content = await Content.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        console.log('✅ Contenido actualizado exitosamente');

        res.status(200).json({
            success: true,
            message: 'Contenido actualizado exitosamente',
            data: content
        });

    } catch (error) {
        console.error('❌ Error al actualizar contenido:', error);

        // Detailed error logging
        if (error instanceof Error) {
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
            if ('errors' in error) {
                console.error('Validation errors:', JSON.stringify((error as any).errors, null, 2));
            }
        }

        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Error al actualizar contenido',
            error: error instanceof Error ? error.name : 'Unknown error'
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

/**
 * GET /api/content/product/slug/:slug
 * Obtener un producto por su slug
 */
export const getProductBySlug = async (req: Request, res: Response): Promise<void> => {
    try {
        const { slug } = req.params;

        const product = await Content.findOne({
            type: 'product',
            slug,
            isActive: true
        })
            .populate('relatedProducts')
            .populate('accessories');

        if (!product) {
            res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
            return;
        }

        // Incrementar contador de vistas
        product.views = (product.views || 0) + 1;
        product.lastViewed = new Date();
        await product.save();

        res.status(200).json({
            success: true,
            data: product
        });

    } catch (error) {
        console.error('Error al obtener producto por slug:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener producto'
        });
    }
};

/**
 * GET /api/content/:id/related
 * Obtener productos relacionados de un producto
 */
export const getRelatedProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { limit = 6 } = req.query;

        const product = await Content.findById(id);

        if (!product) {
            res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
            return;
        }

        // Obtener productos relacionados y accesorios
        const relatedIds = [
            ...(product.relatedProducts || []),
            ...(product.accessories || [])
        ];

        let relatedProducts = await Content.find({
            _id: { $in: relatedIds },
            isActive: true
        }).limit(Number(limit));

        // Si no hay suficientes relacionados, rellenar con productos de la misma categoría
        if (relatedProducts.length < Number(limit) && product.category) {
            // @ts-ignore - Mongoose type compatibility
            const additionalProducts = await Content.find({
                type: 'product',
                category: product.category,
                _id: { $ne: id, $nin: relatedIds },
                isActive: true
            }).limit(Number(limit) - relatedProducts.length);

            // @ts-ignore - Mongoose type compatibility
            relatedProducts = [...relatedProducts, ...additionalProducts];
        }

        res.status(200).json({
            success: true,
            count: relatedProducts.length,
            data: relatedProducts
        });

    } catch (error) {
        console.error('Error al obtener productos relacionados:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener productos relacionados'
        });
    }
};

/**
 * GET /api/content/featured
 * Obtener productos destacados para la landing page (máximo 3)
 */
export const getFeaturedProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const featuredProducts = await Content.find({
            type: 'product',
            isFeatured: true,
            isActive: true
        })
            .sort({ order: 1, createdAt: -1 })
            .limit(3);

        res.status(200).json({
            success: true,
            count: featuredProducts.length,
            data: featuredProducts
        });

    } catch (error) {
        console.error('Error al obtener productos destacados:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener productos destacados'
        });
    }
};

/**
 * PATCH /api/content/:id/toggle-featured
 * Toggle featured status de un producto (con validación de máximo 3)
 */
export const toggleFeatured = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        console.log('⭐ [toggleFeatured] Iniciando toggle para producto:', id);

        const product = await Content.findById(id);
        console.log('📦 [toggleFeatured] Producto encontrado:', {
            id: product?._id,
            title: product?.title,
            type: product?.type,
            isFeatured_ANTES: product?.isFeatured
        });

        if (!product) {
            res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
            return;
        }

        if (product.type !== 'product') {
            res.status(400).json({
                success: false,
                message: 'Solo los productos pueden ser destacados'
            });
            return;
        }

        // Si se está intentando activar featured
        if (!product.isFeatured) {
            // Verificar cuántos productos ya están destacados
            const featuredCount = await Content.countDocuments({
                type: 'product',
                isFeatured: true
            });

            console.log('📊 [toggleFeatured] Productos destacados actuales:', featuredCount);

            if (featuredCount >= 3) {
                res.status(400).json({
                    success: false,
                    message: 'Ya hay 3 productos destacados. Debes quitar uno antes de agregar otro.'
                });
                return;
            }
        }

        // Toggle featured status
        const valorAnterior = product.isFeatured;
        product.isFeatured = !product.isFeatured;
        console.log('🔄 [toggleFeatured] Cambiando isFeatured:', {
            antes: valorAnterior,
            despues: product.isFeatured
        });

        const savedProduct = await product.save();
        console.log('💾 [toggleFeatured] Producto guardado:', {
            id: savedProduct._id,
            title: savedProduct.title,
            isFeatured_DESPUES: savedProduct.isFeatured
        });

        // Verificar que realmente se guardó
        const verification = await Content.findById(id);
        console.log('✅ [toggleFeatured] Verificación en DB:', {
            id: verification?._id,
            isFeatured: verification?.isFeatured
        });

        res.status(200).json({
            success: true,
            message: product.isFeatured
                ? 'Producto marcado como destacado'
                : 'Producto removido de destacados',
            data: savedProduct
        });

    } catch (error) {
        console.error('Error al cambiar estado featured:', error);
        res.status(500).json({
            success: false,
            message: 'Error al cambiar estado featured'
        });
    }
};

