import mongoose from 'mongoose';
import Content from './src/models/Content.js';
import slugify from 'slugify';

const MONGODB_URI = 'mongodb+srv://martben1:fPlyG0zQBfAGzh5B@martben.qy2cvvm.mongodb.net/?retryWrites=true&w=majority&appName=martben';

async function generateSlugsForProducts() {
    try {
        console.log('🔌 Conectando a MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Conectado a MongoDB');

        // Find all products without slug or with empty slug
        const productsWithoutSlug = await Content.find({
            type: 'product',
            $or: [
                { slug: { $exists: false } },
                { slug: null },
                { slug: '' }
            ]
        });

        console.log(`\n📦 Encontrados ${productsWithoutSlug.length} productos sin slug\n`);

        if (productsWithoutSlug.length === 0) {
            console.log('✅ Todos los productos ya tienen slug');
            await mongoose.disconnect();
            return;
        }

        let updated = 0;
        let skipped = 0;

        for (const product of productsWithoutSlug) {
            if (!product.title) {
                console.log(`⚠️  Producto ${product._id} no tiene título, saltando...`);
                skipped++;
                continue;
            }

            // Generate slug from title
            let baseSlug = slugify(product.title, {
                lower: true,
                strict: true,
                locale: 'es'
            });

            // Check if slug already exists (for uniqueness)
            let slug = baseSlug;
            let counter = 1;

            while (await Content.findOne({ slug, _id: { $ne: product._id } })) {
                slug = `${baseSlug}-${counter}`;
                counter++;
            }

            // Update product with slug
            product.slug = slug;
            await product.save();

            console.log(`✅ "${product.title}" -> slug: "${slug}"`);
            updated++;
        }

        console.log(`\n📊 Resumen:`);
        console.log(`   ✅ Actualizados: ${updated}`);
        console.log(`   ⚠️  Saltados: ${skipped}`);
        console.log(`   📝 Total: ${productsWithoutSlug.length}`);

        await mongoose.disconnect();
        console.log('\n🔌 Desconectado de MongoDB');
        console.log('✨ Proceso completado exitosamente');

    } catch (error) {
        console.error('❌ Error:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
}

generateSlugsForProducts();
