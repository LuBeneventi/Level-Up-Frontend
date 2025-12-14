// level-up-gaming-frontend/src/types/User.ts

export type UserRole = 'admin' | 'seller' | 'customer';

export interface UserAddress {
    street: string;
    city: string;
    region: string;
    zipCode?: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    rut: string;
    role: UserRole;
    age?: number;
    address?: UserAddress;
    points: number;
    isActive: boolean;
    hasDuocDiscount: boolean;
    referralCode?: string;
    createdAt?: string;
}

export interface UserCreatePayload {
    name: string;
    email: string;
    password: string;
    rut: string;
    role: UserRole;
    age: number;
    address: UserAddress;
}

export interface UserUpdatePayload {
    name?: string;
    email?: string;
    rut?: string;
    role?: UserRole;
    age?: number;
    address?: UserAddress;
    hasDuocDiscount?: boolean;
}
