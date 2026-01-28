import mongoose, { Document, Schema } from 'mongoose';

/**
 * Interface para el documento de WompiTransaction
 */
export interface IWompiTransaction extends Document {
    orderId: mongoose.Types.ObjectId;
    transactionId: string; // ID de la transacción en Wompi
    reference: string; // Referencia de la orden (orderNumber)
    status: string; // APPROVED, DECLINED, VOIDED, ERROR, PENDING
    statusMessage?: string;
    paymentMethod: string; // CARD, PSE, NEQUI, BANCOLOMBIA_TRANSFER, etc.
    paymentMethodType?: string; // Tipo específico del método
    amount: number; // Monto en centavos
    currency: string; // COP
    customerEmail: string;
    rawWebhookData: any; // Datos completos del webhook
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Schema de WompiTransaction para MongoDB
 */
const WompiTransactionSchema: Schema = new Schema({
    orderId: {
        type: Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
        index: true
    },
    transactionId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    reference: {
        type: String,
        required: true,
        index: true
    },
    status: {
        type: String,
        required: true,
        enum: ['APPROVED', 'DECLINED', 'VOIDED', 'ERROR', 'PENDING'],
        index: true
    },
    statusMessage: String,
    paymentMethod: {
        type: String,
        required: true
    },
    paymentMethodType: String,
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        required: true,
        default: 'COP'
    },
    customerEmail: {
        type: String,
        required: true
    },
    rawWebhookData: {
        type: Schema.Types.Mixed,
        required: true
    }
}, {
    timestamps: true
});

// Índices para búsquedas eficientes
WompiTransactionSchema.index({ orderId: 1, createdAt: -1 });
WompiTransactionSchema.index({ status: 1 });
WompiTransactionSchema.index({ customerEmail: 1 });

export default mongoose.model<IWompiTransaction>('WompiTransaction', WompiTransactionSchema);
