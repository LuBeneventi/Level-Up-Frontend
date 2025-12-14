// level-up-gaming-frontend/src/types/Reward.ts

export type RewardType = 'Producto' | 'Descuento' | 'Envio';
export type RewardSeason = 'Standard' | 'Halloween' | 'Navidad' | 'BlackFriday' | 'Verano';
export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING' | 'NONE';

export interface Reward {
    id: string;
    name: string;
    type: RewardType;
    pointsCost: number;
    description: string;
    isActive: boolean;
    season: RewardSeason;
    imageUrl: string;

    // Campos para descuentos dinámicos
    discountType?: DiscountType;
    discountValue?: number;

    // Campos para control de stock
    stock?: number | null;
    stockAvailable?: number | null;
}

export interface RewardFormData {
    name?: string;
    type?: RewardType;
    pointsCost?: number;
    description?: string;
    isActive?: boolean;
    season?: RewardSeason;
    imageUrl?: string;
    discountType?: DiscountType;
    discountValue?: number;
    stock?: number | null;
    stockAvailable?: number | null;
}

export interface StatusMessage {
    msg: string;
    type: 'success' | 'danger';
}