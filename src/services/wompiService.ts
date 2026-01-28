import crypto from 'crypto';
import axios from 'axios';

/**
 * Servicio para manejar la integración con Wompi Payment Gateway
 */
class WompiService {
    private publicKey: string;
    private privateKey: string;
    private integritySecret: string;
    private eventsSecret: string;
    private apiUrl: string;

    constructor() {
        this.publicKey = process.env.WOMPI_PUBLIC_KEY || '';
        this.privateKey = process.env.WOMPI_PRIVATE_KEY || '';
        this.integritySecret = process.env.WOMPI_INTEGRITY_SECRET || '';
        this.eventsSecret = process.env.WOMPI_EVENTS_SECRET || '';
        this.apiUrl = process.env.WOMPI_API_URL || 'https://production.wompi.co/v1';

        // Log para verificar qué credenciales se están usando
        console.log('🔑 Wompi Service initialized:');
        console.log('   Public Key:', this.publicKey.substring(0, 15) + '...');
        console.log('   API URL:', this.apiUrl);
        console.log('   Integrity Secret:', this.integritySecret ? 'SET' : 'NOT SET');

        if (!this.publicKey || !this.integritySecret) {
            console.warn('⚠️  Wompi credentials not configured properly');
        }
    }

    /**
     * Genera una referencia única para la orden
     * Formato: WT-{timestamp}-{random}
     */
    generateOrderReference(): string {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `WT-${timestamp}-${random}`;
    }

    /**
     * Genera la firma de integridad SHA256 para Wompi
     * @param reference - Referencia única de la orden
     * @param amountInCents - Monto en centavos
     * @param currency - Moneda (COP)
     * @param expirationTime - Fecha de expiración (opcional)
     * @returns Hash SHA256
     */
    generateSignature(
        reference: string,
        amountInCents: number,
        currency: string,
        expirationTime?: string
    ): string {
        let concatenated = `${reference}${amountInCents}${currency}`;

        // Si hay tiempo de expiración, agregarlo
        if (expirationTime) {
            concatenated += expirationTime;
        }

        // Agregar el secreto de integridad al final
        concatenated += this.integritySecret;

        console.log('🔐 Generating Wompi signature:');
        console.log('   Reference:', reference);
        console.log('   Amount (cents):', amountInCents);
        console.log('   Currency:', currency);
        console.log('   String to hash:', `${reference}${amountInCents}${currency}${this.integritySecret.substring(0, 10)}...`);

        // Generar hash SHA256
        const hash = crypto
            .createHash('sha256')
            .update(concatenated)
            .digest('hex');

        console.log('   Generated signature:', hash);

        return hash;
    }

    /**
     * Verifica la firma de integridad recibida del callback
     * @param reference - Referencia de la orden
     * @param amountInCents - Monto en centavos
     * @param currency - Moneda
     * @param receivedSignature - Firma recibida del callback
     * @returns true si la firma es válida
     */
    verifyIntegritySignature(
        reference: string,
        amountInCents: number,
        currency: string,
        receivedSignature: string
    ): boolean {
        if (!this.integritySecret) {
            console.warn('⚠️ WOMPI_INTEGRITY_SECRET no configurado, no se puede verificar firma');
            return false;
        }

        // Generar la firma esperada
        const expectedSignature = this.generateSignature(reference, amountInCents, currency);

        const isValid = expectedSignature === receivedSignature;

        if (!isValid) {
            console.error('❌ Firma de integridad inválida');
            console.error('   Esperada:', expectedSignature);
            console.error('   Recibida:', receivedSignature);
        } else {
            console.log('✅ Firma de integridad verificada correctamente');
        }

        return isValid;
    }


    /**
     * Verifica la firma de un webhook de Wompi
     * @param event - Evento recibido del webhook
     * @returns true si la firma es válida
     */
    verifyWebhookSignature(event: any): boolean {
        try {
            const receivedSignature = event.signature?.checksum;
            const eventData = event.data;

            if (!receivedSignature || !eventData) {
                return false;
            }

            // Wompi envía la firma en el campo signature.checksum
            // La firma se calcula con el evento completo + events secret
            const eventString = JSON.stringify(eventData);
            const calculatedSignature = crypto
                .createHash('sha256')
                .update(eventString + this.eventsSecret)
                .digest('hex');

            return receivedSignature === calculatedSignature;
        } catch (error) {
            console.error('Error verifying webhook signature:', error);
            return false;
        }
    }

    /**
     * Consulta el estado de una transacción en la API de Wompi
     * @param transactionId - ID de la transacción
     * @returns Datos de la transacción
     */
    async getTransactionStatus(transactionId: string): Promise<any> {
        try {
            const response = await axios.get(
                `${this.apiUrl}/transactions/${transactionId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.publicKey}`
                    }
                }
            );

            return response.data;
        } catch (error: any) {
            console.error('Error fetching transaction from Wompi:', error.message);
            throw error;
        }
    }

    /**
     * Convierte un monto en pesos a centavos
     * @param amount - Monto en pesos (ej: 95000)
     * @returns Monto en centavos (ej: 9500000)
     */
    convertToCents(amount: number): number {
        return Math.round(amount * 100);
    }

    /**
     * Convierte un monto en centavos a pesos
     * @param amountInCents - Monto en centavos (ej: 9500000)
     * @returns Monto en pesos (ej: 95000)
     */
    convertFromCents(amountInCents: number): number {
        return amountInCents / 100;
    }

    /**
     * Calcula el IVA (19%) de un monto
     * @param amount - Monto base
     * @returns IVA calculado
     */
    calculateVAT(amount: number): number {
        return Math.round(amount * 0.19);
    }

    /**
     * Obtiene la llave pública de Wompi
     */
    getPublicKey(): string {
        return this.publicKey;
    }
}

export default new WompiService();
