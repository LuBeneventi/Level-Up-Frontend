// level-up-gaming-frontend/test/context/CartContext.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ReactNode } from 'react';
import { CartProvider, useCart } from '../../src/context/CartContext';
import { Product } from '../../src/types/Product';

// Mock de localStorage (necesario para persistencia)
const localStorageMock = (() => {
    let store: { [key: string]: string } = {};
    return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => { store[key] = value.toString(); }),
        clear: vi.fn(() => { store = {}; })
    };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock de AuthContext
vi.mock('../../src/context/AuthContext', () => ({
    useAuth: vi.fn(() => ({ user: null })), // Por defecto usuario invitado
}));

// Componente Wrapper para el hook
const MockWrapper = ({ children }: { children: ReactNode }) => (
    <CartProvider>{children}</CartProvider>
);

// 🚨 CORRECCIÓN CRÍTICA: Definiciones de productos COMPLETAS para la interfaz Product

const createMockProduct = (id: string, name: string, price: number, countInStock: number): Product => ({
    id: id,
    name: name,
    description: `Descripción para ${name}`,
    price: price,
    imageUrl: `/images/${id}.png`,
    rating: 4.5,
    numReviews: 10,
    isTopSelling: true,
    countInStock: countInStock,

    specifications: '{}',
    category: 'Consolas',
    reviews: [],
    active: false
});


const mockProductA: Product = createMockProduct('p1', 'Product A', 10000, 5);
const mockProductB: Product = createMockProduct('p2', 'Product B', 50000, 2);
const mockRedeemed: Product = {
    ...createMockProduct('r1', '[CANJE] Recompensa', 0, 1),
    reviews: [],
    category: 'Reward',
    specifications: '{}',
    numReviews: 0,
    rating: 0,
};


describe('CartContext: Lógica de Carrito y Totales', () => {

    beforeEach(() => {
        localStorageMock.clear();
        vi.clearAllMocks();
    });

    it('1. Deberia inicializar con un carrito empty(vacio) y contar 0', () => {
        const { result } = renderHook(() => useCart(), { wrapper: MockWrapper });

        expect(result.current.cartCount).toBe(0);
        expect(result.current.totalPrice).toBe(0);
        expect(result.current.cartItems).toHaveLength(0);
    });

    it('2.Deberia agregar un producto y calcular el precio correcto', () => {
        const { result } = renderHook(() => useCart(), { wrapper: MockWrapper });

        act(() => {
            result.current.addToCart(mockProductA, 2);
        });

        expect(result.current.cartCount).toBe(2);
        expect(result.current.totalPrice).toBe(20000);
        expect(result.current.cartItems).toHaveLength(1);
    });

    it('3. Deberia incrementar la cantidad de un producto existente(hasta el limite de su stock)', () => {
        const { result } = renderHook(() => useCart(), { wrapper: MockWrapper });

        act(() => {
            result.current.addToCart(mockProductB, 1);
        });

        act(() => {
            result.current.increaseQuantity(mockProductB.id);
        });
        act(() => {
            result.current.increaseQuantity(mockProductB.id);
        });

        expect(result.current.cartItems[0].quantity).toBe(2);
        expect(result.current.totalPrice).toBe(100000);
    });

    it('4. deberia remover el item cuando la cantidad disminuye a 0', () => {
        const { result } = renderHook(() => useCart(), { wrapper: MockWrapper });

        act(() => {
            result.current.addToCart(mockProductA, 1);
            result.current.decreaseQuantity(mockProductA.id);
        });

        expect(result.current.cartCount).toBe(0);
        expect(result.current.cartItems).toHaveLength(0);
    });

    it('5. "Vaciar carrito" deberia vaciar el carrito completo', () => {
        const { result } = renderHook(() => useCart(), { wrapper: MockWrapper });

        act(() => {
            result.current.addToCart(mockProductA, 1);
            result.current.addToCart(mockProductB, 1);
            result.current.clearCart();
        });

        expect(result.current.cartCount).toBe(0);
        expect(result.current.totalPrice).toBe(0);
    });

    it('6. Deberia manejar la adicion de puntos a recompensas y dejar el producto en precio 0', () => {
        const { result } = renderHook(() => useCart(), { wrapper: MockWrapper });

        act(() => {
            result.current.addToCart(mockProductA, 1);
            result.current.addToCart(mockRedeemed, 1, true, 1000);
        });

        expect(result.current.cartItems).toHaveLength(2);
        expect(result.current.totalPrice).toBe(10000);
        expect(result.current.cartItems.find(i => i.isRedeemed)?.pointsCost).toBe(1000);
    });

    it('7. Deberia disminuir la cantidad de un producto existente', () => {
        const { result } = renderHook(() => useCart(), { wrapper: MockWrapper });

        act(() => {
            result.current.addToCart(mockProductA, 3);
        });

        act(() => {
            result.current.decreaseQuantity(mockProductA.id);
        });

        expect(result.current.cartItems[0].quantity).toBe(2);
        expect(result.current.totalPrice).toBe(20000);
    });

    it('8. Deberia eliminar un producto del carrito por completo', () => {
        const { result } = renderHook(() => useCart(), { wrapper: MockWrapper });

        act(() => {
            result.current.addToCart(mockProductA, 1);
            result.current.addToCart(mockProductB, 1);
        });

        act(() => {
            result.current.removeFromCart(mockProductA.id);
        });

        expect(result.current.cartItems).toHaveLength(1);
        expect(result.current.cartItems[0].product.id).toBe(mockProductB.id);
        expect(result.current.totalPrice).toBe(50000);
    });

    it('9. Deberia persistir y cargar el carrito desde localStorage', () => {
        const { result: initialResult } = renderHook(() => useCart(), { wrapper: MockWrapper });

        act(() => {
            initialResult.current.addToCart(mockProductA, 2);
        });

        expect(localStorageMock.setItem).toHaveBeenCalledWith('cart_guest', JSON.stringify(initialResult.current.cartItems));

        const { result: finalResult } = renderHook(() => useCart(), { wrapper: MockWrapper });

        expect(finalResult.current.cartItems).toHaveLength(1);
        expect(finalResult.current.cartItems[0].product.id).toBe(mockProductA.id);
        expect(finalResult.current.cartItems[0].quantity).toBe(2);
        expect(finalResult.current.totalPrice).toBe(20000);
    });
});
