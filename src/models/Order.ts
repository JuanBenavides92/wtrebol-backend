import mongoose, { Document, Schema } from 'mongoose';

/**
 * Estados posibles de un pedido (Mejorados)
 */
export type OrderStatus =
    | 'pending_payment'      // Pendiente de Pago (creada pero no pagada)
    | 'payment_confirmed'    // Pago Confirmado (pagado, esperando preparación)
    | 'preparing'            // En Preparación (admin preparando el pedido)
    | 'shipped'              // En Camino (enviado, en tránsito)
    | 'delivered'            // Entregado (completado)
    | 'cancelled';           // Cancelada

/**
 * Estados de pago
 */
export type PaymentStatus = 'pending' | 'approved' | 'declined' | 'voided';

/**
 * Item individual dentro de un pedido
 */
export interface IOrderItem {
    productId: string;
    title: string;
    price: string;
    priceNumeric: number;
    quantity: number;
    subtotal: number; // Precio * Cantidad
    imageUrl?: string;
    category?: string;
    btuCapacity?: number;
}

/**
 * Información de entrega
 */
export interface IShippingInfo {
    name: string;
    phone: string;
    address: string;
    city: string;
    notes?: string;
}

/**
 * Interface para el documento de Order (Pedido)
 */
export interface IOrder extends Document {
    orderNumber: string;
    customerId: mongoose.Types.ObjectId;
    customerEmail: string;
    customerName: string;
    items: IOrderItem[];
    subtotal: number;
    taxVAT: number; // IVA (19%)
    taxConsumption: number; // Impuesto al consumo
    shipping: number;
    total: number;
    currency: 'COP';
    status: OrderStatus;
    paymentStatus: PaymentStatus; // Estado del pago

    // Wompi Payment Gateway - Información Detallada
    wompiTransactionId?: string;
    wompiSignature: string; // Firma de integridad SHA256
    wompiPaymentMethod?: string; // CARD, PSE, NEQUI, etc.
    wompiCardBrand?: string; // VISA, MASTERCARD, AMEX, etc.
    wompiCardLast4?: string; // Últimos 4 dígitos de la tarjeta
    wompiApprovalCode?: string; // Código de aprobación bancaria
    wompiPaymentLink?: string; // Enlace al recibo oficial de Wompi

    shippingInfo: IShippingInfo;
    notes?: string;

    // Idempotency Key para prevenir pedidos duplicados
    idempotencyKey?: string;

    createdAt: Date;
    updatedAt: Date;
    statusUpdatedAt: Date;
    paidAt?: Date;
    cancelledAt?: Date;
    cancelledReason?: string;
}

/**
 * Schema de Order para MongoDB
 */
const OrderSchema: Schema = new Schema({
    orderNumber: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    customerId: {
        type: Schema.Types.ObjectId,
        ref: 'Customer',
        required: true,
        index: true
    },
    customerEmail: {
        type: String,
        required: true
    },
    customerName: {
        type: String,
        required: true
    },
    items: [{
        productId: { type: String, required: true },
        title: { type: String, required: true },
        price: { type: String, required: true },
        priceNumeric: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
        imageUrl: String,
        category: String,
        btuCapacity: Number
    }],
    subtotal: {
        type: Number,
        required: true,
        min: 0
    },
    taxVAT: {
        type: Number,
        default: 0,
        min: 0
    },
    taxConsumption: {
        type: Number,
        default: 0,
        min: 0
    },
    shipping: {
        type: Number,
        default: 0,
        min: 0
    },
    total: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['pending_payment', 'payment_confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending_payment',
        index: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'approved', 'declined', 'voided'],
        default: 'pending',
        index: true
    },
    wompiTransactionId: {
        type: String,
        index: true
    },
    wompiSignature: {
        type: String,
        required: false
    },
    wompiPaymentMethod: String,
    wompiCardBrand: String, // VISA, MASTERCARD, AMEX, etc.
    wompiCardLast4: String, // Últimos 4 dígitos
    wompiApprovalCode: String, // Código de aprobación bancaria
    wompiPaymentLink: String, // Enlace al recibo oficial
    shippingInfo: {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        notes: String
    },
    notes: String,

    // Idempotency Key para prevenir pedidos duplicados
    idempotencyKey: {
        type: String,
        unique: true,
        sparse: true, // Permite null pero unique cuando existe
        index: true
    },

    statusUpdatedAt: {
        type: Date,
        default: Date.now
    },
    paidAt: Date,
    cancelledAt: Date,
    cancelledReason: String
}, {
    timestamps: true
});

/**
 * Pre-save middleware para generar orderNumber automáticamente
 */
OrderSchema.pre('save', async function () {
    if (!this.orderNumber) {
        const count = await mongoose.model('Order').countDocuments();
        const timestamp = Date.now().toString().slice(-6);
        this.orderNumber = `WT-${timestamp}-${(count + 1).toString().padStart(4, '0')}`;
    }
});

/**
 * Índices para optimizar búsquedas
 */
OrderSchema.index({ customerId: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ customerEmail: 1 });

export default mongoose.model<IOrder>('Order', OrderSchema);
