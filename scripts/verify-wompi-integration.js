/**
 * Script de verificación simple para Wompi
 */

require('dotenv').config();

async function testWompiConfig() {
    console.log('\n🧪 Verificación de Configuración de Wompi\n');
    console.log('='.repeat(50));

    // Verificar variables de entorno
    console.log('\n📋 Variables de Entorno:');
    console.log('   WOMPI_API_URL:', process.env.WOMPI_API_URL || '❌ NO CONFIGURADO');
    console.log('   WOMPI_PUBLIC_KEY:', process.env.WOMPI_PUBLIC_KEY ? `✅ ${process.env.WOMPI_PUBLIC_KEY.substring(0, 20)}...` : '❌ NO CONFIGURADO');
    console.log('   WOMPI_PRIVATE_KEY:', process.env.WOMPI_PRIVATE_KEY ? `✅ ${process.env.WOMPI_PRIVATE_KEY.substring(0, 20)}...` : '❌ NO CONFIGURADO');

    if (!process.env.WOMPI_PRIVATE_KEY) {
        console.error('\n❌ ERROR: WOMPI_PRIVATE_KEY no está configurado');
        console.error('   Agrega esta variable a tu archivo .env');
        process.exit(1);
    }

    // Verificar archivos
    const fs = require('fs');
    const path = require('path');

    console.log('\n📦 Archivos de Wompi Verification:');

    const files = [
        'src/types/wompi.ts',
        'src/services/wompiVerificationService.ts',
        'src/controllers/ordersController.ts'
    ];

    let allFilesExist = true;

    for (const file of files) {
        const filePath = path.join(__dirname, '..', file);
        const exists = fs.existsSync(filePath);
        console.log(`   ${exists ? '✅' : '❌'} ${file}`);
        if (!exists) allFilesExist = false;
    }

    if (!allFilesExist) {
        console.error('\n❌ ERROR: Algunos archivos no existen');
        process.exit(1);
    }

    // Probar conexión con Wompi API
    console.log('\n🔍 Probando Conexión con Wompi API...');

    const axios = require('axios');

    try {
        // Intentar consultar una transacción de prueba (fallará, pero verifica la conexión)
        const response = await axios.get(
            `${process.env.WOMPI_API_URL}/transactions/test-12345`,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.WOMPI_PRIVATE_KEY}`
                },
                validateStatus: () => true // Aceptar cualquier status
            }
        );

        if (response.status === 404) {
            console.log('   ✅ Conexión exitosa con Wompi API');
            console.log('   ✅ Autenticación correcta (404 esperado para transaction ID de prueba)');
        } else if (response.status === 401) {
            console.error('   ❌ Error de autenticación');
            console.error('   ❌ Verifica que WOMPI_PRIVATE_KEY sea correcta');
            process.exit(1);
        } else {
            console.log(`   ⚠️ Respuesta inesperada: ${response.status}`);
        }

    } catch (error) {
        if (error.code === 'ENOTFOUND') {
            console.error('   ❌ No se pudo conectar a Wompi API');
            console.error('   ❌ Verifica tu conexión a internet');
        } else {
            console.error('   ❌ Error:', error.message);
        }
        process.exit(1);
    }

    console.log('\n' + '='.repeat(50));
    console.log('\n🎉 VERIFICACIÓN COMPLETADA EXITOSAMENTE\n');
    console.log('✅ Todas las configuraciones están correctas');
    console.log('✅ El servicio de verificación de Wompi está listo\n');
    console.log('💡 Próximos pasos:');
    console.log('   1. Crear un pedido en el checkout');
    console.log('   2. Completar el pago con Wompi');
    console.log('   3. Verificar los logs del backend para ver la verificación\n');

    process.exit(0);
}

testWompiConfig().catch(error => {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
});
