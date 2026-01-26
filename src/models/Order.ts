import mongoose, { Document, Schema } from 'mongoose';

/**
 * Estados posibles de un pedido
 */
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

/**
 * Item individual dentro de un pedido
 */
export interface IOrderItem {
    productId: string;
    title: string;
    price: string;
    priceNumeric: number;
    quantity: number;
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
    shipping: number;
    total: number;
    status: OrderStatus;
    shippingInfo: IShippingInfo;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
    statusUpdatedAt: Date;
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
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending',
        index: true
    },
    shippingInfo: {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        notes: String
    },
    notes: String,
    statusUpdatedAt: {
        type: Date,
        default: Date.now
    }
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
