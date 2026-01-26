import { Request, Response } from 'express';
import Content from '../models/Content';
import slugify from 'slugify';

/**
 * POST /api/content/generate-slugs
 * Generate slugs for all products that don't have one
 */
export const generateSlugs = async (req: Request, res: Response): Promise<void> => {
    try {
        // Get all products without slugs
        const products = await Content.find({
            type: 'product',
            $or: [{ slug: null }, { slug: { $exists: false } }, { slug: '' }]
        });

        console.log(`Found ${products.length} products without slugs`);
        const results = [];

        for (const product of products) {
            let baseSlug = slugify(product.title, {
                lower: true,
                strict: true,
                locale: 'es'
            });

            // Check for uniqueness
            let slug = baseSlug;
            let counter = 1;

            // @ts-ignore - Mongoose type compatibility
            while (await Content.findOne({ slug, _id: { $ne: product._id } })) {
                slug = `${baseSlug}-${counter}`;
                counter++;
            }

            product.slug = slug;
            await product.save();

            results.push({
                id: product._id,
                title: product.title,
                slug
            });

            console.log(`Generated slug for "${product.title}": ${slug}`);
        }

        res.status(200).json({
            success: true,
            message: `Generated ${results.length} slugs`,
            data: results
        });

    } catch (error) {
        console.error('Error generating slugs:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating slugs'
        });
    }
};
