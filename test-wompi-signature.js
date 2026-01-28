// Script de prueba para verificar la firma de Wompi
const crypto = require('crypto');

// Credenciales de sandbox
const INTEGRITY_SECRET = 'test_integrity_2EcJ5RjJHsEwja04HpxPoChbkvbXFNbE';

// Datos de la última orden (del log del frontend)
const reference = 'WT-1769481545560-12WJ1F';
const amountInCents = 101150000;
const currency = 'COP';

// Generar firma
const concatenated = `${reference}${amountInCents}${currency}${INTEGRITY_SECRET}`;
const signature = crypto.createHash('sha256').update(concatenated).digest('hex');

console.log('=== Test de Firma Wompi ===');
console.log('Reference:', reference);
console.log('Amount (cents):', amountInCents);
console.log('Currency:', currency);
console.log('Integrity Secret:', INTEGRITY_SECRET);
console.log('\nString to hash:', concatenated);
console.log('\nGenerated Signature:', signature);
console.log('\nExpected format for Wompi widget:');
console.log(`signature:integrity=${signature}`);
