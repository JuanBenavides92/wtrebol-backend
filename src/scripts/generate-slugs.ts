import mongoose from 'mongoose';
import slugify from 'slugify';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://martben1:fPlyG0zQBfAGzh5B@martben.qy2cvvm.mongodb.net/wtrebol?retryWrites=true&w=majority';

interface ProductDocument extends mongoose.Document {
    title: string;
    slug?: string;
    type: string;
}

/**
 * Script to generate slugs for existing products
 */
async function generateSlugs() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const Content = mongoose.model<ProductDocument>('Content', new mongoose.Schema({}, { strict: false }));

        // Get all products without slugs
        const products = await Content.find({
            type: 'product',
            $or: [{ slug: null }, { slug: { $exists: false } }]
        });

        console.log(`📦 Found ${products.length} products without slugs`);

        for (const product of products) {
            let baseSlug = slugify(product.title, {
                lower: true,
                strict: true,
                locale: 'es'
            });

            // Check for uniqueness
            let slug = baseSlug;
            let counter = 1;

            while (await Content.findOne({ slug, _id: { $ne: product._id } })) {
                slug = `${baseSlug}-${counter}`;
                counter++;
            }

            product.slug = slug;
            await product.save();
            console.log(`✓ Generated slug for "${product.title}": ${slug}`);
        }

        console.log('🎉 All slugs generated successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

generateSlugs();
