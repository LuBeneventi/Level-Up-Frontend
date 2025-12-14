// level-up-gaming-frontend/src/types/Order.ts

export type OrderStatus = 'Pendiente' | 'Procesando' | 'Enviado' | 'Entregado' | 'Cancelado';

export interface OrderItem {
    id?: number;
    productId?: string;
    name: string;
    price: number;
    qty: number;
    quantity?: number; // For compatibility if needed
    image?: string;
}

export interface ShippingAddress {
    street: string;
    city: string;
    region: string;
}

export interface Order {
    id: string;
    userId: string;
    userRut?: string; // Opcional para transición
    items: OrderItem[];
    shippingAddress: ShippingAddress;
    paymentMethod: string;          // ✅ AGREGAR
    totalPrice: number;
    shippingPrice: number;          // ✅ AGREGAR
    isPaid: boolean;                // ✅ AGREGAR
    status: OrderStatus;
    createdAt: string;
    paidAt?: string;                // ✅ AGREGAR
    deliveredAt?: string;           // ✅ AGREGAR
}

export interface OrderUpdatePayload {
    status: OrderStatus;
}
