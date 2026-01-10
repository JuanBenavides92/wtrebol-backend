import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Content from '../models/Content';
import fs from 'fs';
import path from 'path';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || '';

const seedSlides = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Conectado a MongoDB\n');

        // Leer el archivo JSON
        const slidesData = JSON.parse(
            fs.readFileSync(path.join(__dirname, '../../seed-slides.json'), 'utf-8')
        );

        // Insertar cada slide
        for (const slideData of slidesData) {
            const slide = new Content(slideData);
            await slide.save();
            console.log(`✅ Slide creado: ${slide.title} (order: ${slide.order})`);
        }

        console.log('\n🎉 Todos los slides fueron creados exitosamente');

        await mongoose.connection.close();
        console.log('🔌 Conexión cerrada');

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

seedSlides();
