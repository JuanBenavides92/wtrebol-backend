import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || '';
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || '';
const AWS_REGION = process.env.AWS_REGION || 'us-east-2';

if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
    throw new Error('AWS credentials are not configured in .env file');
}

/**
 * Cliente de AWS S3 configurado
 */
export const s3Client = new S3Client({
    region: AWS_REGION,
    credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY
    }
});

/**
 * Configuración del bucket
 */
export const S3_CONFIG = {
    bucketName: process.env.AWS_BUCKET_NAME || 'martbenbucket',
    folder: process.env.AWS_S3_FOLDER || 'Servicio Web/wtrebol/',
    region: AWS_REGION
};
