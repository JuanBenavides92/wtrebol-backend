/**
 * Tipos TypeScript para la API de Wompi
 */

export interface WompiTransaction {
    id: string;
    status: 'APPROVED' | 'DECLINED' | 'PENDING' | 'VOIDED' | 'ERROR';
    amount_in_cents: number;
    currency: string;
    payment_method_type: string;
    payment_method: {
        type: string;
        extra?: {
            brand?: string;
            last_four?: string;
            bin?: string;
            name?: string;
        };
    };
    reference: string;
    customer_email?: string;
    created_at: string;
    finalized_at?: string;
    status_message?: string;
}

export interface WompiApiResponse {
    data: WompiTransaction;
}
