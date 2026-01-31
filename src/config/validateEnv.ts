/**
 * Validate required environment variables on startup
 */
export const validateEnv = (): void => {
    const required = [
        'MONGODB_URI',
        'JWT_SECRET',
        'SESSION_SECRET',
        'FRONTEND_URL',
        'AWS_ACCESS_KEY_ID',
        'AWS_SECRET_ACCESS_KEY',
        'AWS_BUCKET_NAME',
        'AWS_REGION',
    ];

    // Email is required for appointment notifications
    const emailVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS'];

    const missing = required.filter(key => !process.env[key]);
    const missingEmail = emailVars.filter(key => !process.env[key]);

    if (missing.length > 0) {
        throw new Error(`❌ Missing required environment variables: ${missing.join(', ')}`);
    }

    if (missingEmail.length > 0) {
        console.warn(`⚠️  Warning: Email not configured. Missing: ${missingEmail.join(', ')}`);
        console.warn('⚠️  Appointment notifications will not work!');
    }

    // Validate JWT secret strength in production
    if (process.env.NODE_ENV === 'production') {
        if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
            throw new Error('❌ JWT_SECRET must be at least 32 characters in production');
        }
        if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length < 32) {
            throw new Error('❌ SESSION_SECRET must be at least 32 characters in production');
        }
    }

    console.log('✅ Environment variables validated');
};
