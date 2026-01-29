// Quick script to verify ProductOptions in MongoDB
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://martben1:fPlyG0zQBfAGzh5B@martben.qy2cvvm.mongodb.net/?retryWrites=true&w=majority&appName=martben';

const ProductOptionSchema = new mongoose.Schema({
    type: String,
    value: String,
    label: String,
    isActive: Boolean,
    usageCount: Number,
}, { timestamps: true });

const ProductOption = mongoose.model('ProductOption', ProductOptionSchema);

async function checkOptions() {
    try {
        await mongoose.connect(MONGODB_URI);

        const categories = await ProductOption.find({ type: 'category' });
        const btus = await ProductOption.find({ type: 'btu' });
        const conditions = await ProductOption.find({ type: 'condition' });

        console.log(`\n✅ Categorías en BD: ${categories.length}`);
        categories.forEach(c => console.log(`   - ${c.label}`));

        console.log(`\n✅ BTUs en BD: ${btus.length}`);
        btus.forEach(b => console.log(`   - ${b.label}`));

        console.log(`\n✅ Condiciones en BD: ${conditions.length}`);
        conditions.forEach(c => console.log(`   - ${c.label}`));

        console.log(`\n📊 Total: ${categories.length + btus.length + conditions.length} opciones\n`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

checkOptions();
