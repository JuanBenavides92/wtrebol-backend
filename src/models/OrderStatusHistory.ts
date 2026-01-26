import mongoose, { Document, Schema } from 'mongoose';
import { OrderStatus } from './Order';

/**
 * Interface para el historial de cambios de estado de pedidos
 */
export interface IOrderStatusHistory extends Document {
    orderId: mongoose.Types.ObjectId;
    orderNumber: string;
    previousStatus: OrderStatus;
    newStatus: OrderStatus;
    changedBy: mongoose.Types.ObjectId | null; // Admin user ID, null for system/customer
    changedByType: 'admin' | 'customer' | 'system';
    notes?: string;
    createdAt: Date;
}

/**
 * Schema de OrderStatusHistory para MongoDB
 */
const OrderStatusHistorySchema: Schema = new Schema({
    orderId: {
        type: Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
        index: true
    },
    orderNumber: {
        type: String,
        required: true,
        index: true
    },
    previousStatus: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
        required: true
    },
    newStatus: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
        required: true
    },
    changedBy: {
        type: Schema.Types.ObjectId,
        refPath: 'changedByType',
        default: null
    },
    changedByType: {
        type: String,
        enum: ['admin', 'customer', 'system'],
        default: 'system'
    },
    notes: String
}, {
    timestamps: { createdAt: true, updatedAt: false }
});

/**
 * Índices para optimizar búsquedas
 */
OrderStatusHistorySchema.index({ orderId: 1, createdAt: -1 });
OrderStatusHistorySchema.index({ orderNumber: 1, createdAt: -1 });

export default mongoose.model<IOrderStatusHistory>('OrderStatusHistory', OrderStatusHistorySchema);
