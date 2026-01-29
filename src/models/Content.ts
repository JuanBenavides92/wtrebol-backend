import mongoose, { Document, Schema } from 'mongoose';
import slugify from 'slugify';

/**
 * Interface para el documento de Contenido
 */
export interface IContent extends Document {
    type: 'slide' | 'product' | 'service' | 'setting' | 'advantage' | 'faq';
    title: string;
    description?: string;
    imageUrl?: string;
    price?: string;
    order?: number;
    isActive: boolean;
    // Product-specific fields
    category?: 'split' | 'cassette' | 'piso-cielo' | 'industrial' | 'accesorio';
    btuCapacity?: number;
    usageType?: 'residencial' | 'comercial' | 'industrial';
    inStock?: boolean;
    brand?: string;
    // URLs & SEO
    slug?: string;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
    // Identification
    sku?: string;
    condition?: 'nuevo' | 'usado';
    // Stock & Availability
    stockQuantity?: number;
    lowStockThreshold?: number;
    stockStatus?: 'in-stock' | 'low-stock' | 'out-of-stock' | 'pre-order';
    estimatedDeliveryDays?: number; // Días estimados de entrega
    // Gallery
    images?: string[];
    mainImageIndex?: number;
    // Rich Content
    longDescription?: string;
    videoUrl?: string;
    documents?: Array<{
        name: string;
        url: string;
        type: 'manual' | 'datasheet' | 'warranty' | 'certificate' | 'other';
    }>;
    // Specifications (flexible)
    specifications?: Record<string, string | number>;
    // Features
    features?: string[];
    // Warranty
    warranty?: {
        duration: string;
        type: string;
        details?: string;
    };
    // Shipping & Installation
    shipping?: {
        freeShipping: boolean;
        shippingCost?: string;
        estimatedDays?: string;
        availableRegions?: string[];
    };
    installation?: {
        required: boolean;
        cost?: string;
        estimatedHours?: string;
    };
    // Related Products
    relatedProducts?: string[];
    accessories?: string[];
    // FAQs
    faqs?: Array<{
        question: string;
        answer: string;
    }>;
    // Badges
    badges?: Array<'nuevo' | 'oferta' | 'mas-vendido' | 'envio-gratis' | 'destacado'>;
    // Analytics
    views?: number;
    lastViewed?: Date;
    layout?: 'image-right' | 'image-left' | 'image-background';
    buttonText?: string;
    buttonLink?: string;
    overlayOpacity?: number;
    // Text styling
    titleSize?: number;
    titleColor?: string;
    titleGradient?: boolean;
    titleBold?: boolean;
    titleItalic?: boolean;
    descriptionSize?: number;
    descriptionColor?: string;
    descriptionGradient?: boolean;
    descriptionBold?: boolean;
    descriptionItalic?: boolean;
    data?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Schema de Contenido para MongoDB
 */
const ContentSchema: Schema = new Schema({
    type: {
        type: String,
        required: [true, 'El tipo de contenido es requerido'],
        enum: ['slide', 'product', 'service', 'setting', 'advantage', 'faq'],
        index: true
    },
    title: {
        type: String,
        required: [true, 'El título es requerido'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    imageUrl: {
        type: String,
        trim: true
    },
    price: {
        type: String,
        trim: true
    },
    order: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    // Product-specific fields
    category: {
        type: String,
        enum: ['split', 'cassette', 'piso-cielo', 'industrial', 'accesorio'],
        index: true
    },
    btuCapacity: {
        type: Number,
        index: true
    },
    usageType: {
        type: String,
        enum: ['residencial', 'comercial', 'industrial'],
        default: 'residencial'
    },
    inStock: {
        type: Boolean,
        default: true
    },
    brand: {
        type: String,
        trim: true
    },
    // URLs & SEO
    slug: {
        type: String,
        unique: true,
        sparse: true,
        index: true,
        trim: true
    },
    metaTitle: String,
    metaDescription: String,
    metaKeywords: [String],
    // Identification
    sku: {
        type: String,
        trim: true,
        uppercase: true
    },
    condition: {
        type: String,
        enum: ['nuevo', 'usado'],
        default: 'nuevo'
    },
    // Stock & Availability
    stockQuantity: {
        type: Number,
        min: 0,
        default: 0
    },
    lowStockThreshold: {
        type: Number,
        default: 5
    },
    stockStatus: {
        type: String,
        enum: ['in-stock', 'low-stock', 'out-of-stock', 'pre-order'],
        default: 'in-stock'
    },
    estimatedDeliveryDays: {
        type: Number,
        min: 0, // 0 indicates "not specified"
        max: 365
    },
    // Gallery
    images: [String],
    mainImageIndex: {
        type: Number,
        default: 0
    },
    // Rich Content
    longDescription: String,
    videoUrl: String,
    documents: [{
        name: String,
        url: String,
        type: {
            type: String,
            enum: ['manual', 'datasheet', 'warranty', 'certificate', 'other']
        }
    }],
    // Specifications (flexible key-value)
    specifications: {
        type: Map,
        of: Schema.Types.Mixed
    },
    // Features
    features: [String],
    // Warranty
    warranty: {
        duration: String,
        type: String,
        details: String
    },
    // Shipping
    shipping: {
        freeShipping: {
            type: Boolean,
            default: false
        },
        shippingCost: String,
        estimatedDays: String,
        availableRegions: [String]
    },
    // Installation
    installation: {
        required: {
            type: Boolean,
            default: false
        },
        cost: String,
        estimatedHours: String
    },
    // Related Products (references to other Content docs)
    relatedProducts: [{
        type: Schema.Types.ObjectId,
        ref: 'Content'
    }],
    accessories: [{
        type: Schema.Types.ObjectId,
        ref: 'Content'
    }],
    // FAQs
    faqs: [{
        question: String,
        answer: String
    }],
    // Badges
    badges: [{
        type: String,
        enum: ['nuevo', 'oferta', 'mas-vendido', 'envio-gratis', 'destacado']
    }],
    // Analytics
    views: {
        type: Number,
        default: 0
    },
    lastViewed: Date,
    layout: {
        type: String,
        enum: ['image-right', 'image-left', 'image-background'],
        default: 'image-right'
    },
    buttonText: {
        type: String,
        trim: true
    },
    buttonLink: {
        type: String,
        trim: true
    },
    overlayOpacity: {
        type: Number,
        min: 0,
        max: 100,
        default: 50
    },
    titleSize: {
        type: Number,
        min: 12,
        max: 200,
        default: 48
    },
    titleColor: {
        type: String,
        default: 'auto'
    },
    titleGradient: {
        type: Boolean,
        default: false
    },
    titleBold: {
        type: Boolean,
        default: true
    },
    titleItalic: {
        type: Boolean,
        default: false
    },
    descriptionSize: {
        type: Number,
        min: 12,
        max: 100,
        default: 18
    },
    descriptionColor: {
        type: String,
        default: 'auto'
    },
    descriptionGradient: {
        type: Boolean,
        default: false
    },
    descriptionBold: {
        type: Boolean,
        default: false
    },
    descriptionItalic: {
        type: Boolean,
        default: false
    },
    data: {
        type: Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

/**
 * Índices para optimizar búsquedas
 */
ContentSchema.index({ type: 1, order: 1 });
ContentSchema.index({ type: 1, isActive: 1 });

/**
 * Middleware para auto-generar slug antes de guardar
 * TEMPORARILY DISABLED - Will be re-implemented after fixing type issues
 */
/*
ContentSchema.pre('save', async function () {
    // Solo generar slug para productos si no existe
    if (this.type === 'product' && this.isModified('title') && !this.slug) {
        let baseSlug = slugify(this.title, {
            lower: true,
            strict: true,
            locale: 'es'
        });

        // Generar slug único
        let slug = baseSlug;
        let counter = 1;
        
        // Usar modelo directamente
        const Content = mongoose.model('Content');
        while (await Content.findOne({ slug, _id: { $ne: this._id } })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        this.slug = slug;
    }
});
*/

export default mongoose.model<IContent>('Content', ContentSchema);
