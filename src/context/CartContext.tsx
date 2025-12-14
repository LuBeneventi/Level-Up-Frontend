// level-up-gaming-frontend/src/context/CartContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { Product } from '../types/Product';
import { useAuth } from './AuthContext';

// 1. Tipos de Item del Carrito
export interface CartItem {
    product: Product;
    quantity: number;
    isRedeemed?: boolean; // True si viene de un canje
    pointsCost?: number;   // Costo del canje (para restar al checkout)
}

// 2. Tipos del Contexto
interface CartContextType {
    cartItems: CartItem[];
    cartCount: number;
    totalPrice: number;
    addToCart: (product: Product, quantity?: number, isRedeemed?: boolean, pointsCost?: number) => void;
    removeFromCart: (productId: string) => void;
    increaseQuantity: (productId: string) => void;
    decreaseQuantity: (productId: string) => void;
    clearCart: () => void;
}

// 3. Creación del Contexto
const CartContext = createContext<CartContextType | undefined>(undefined);

// 4. Proveedor del Contexto
interface CartProviderProps {
    children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
    const { user } = useAuth();
    const cartKey = user ? `cart_${user.id}` : 'cart_guest';


    // Estado del carrito
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    // Ref para rastrear cambio de usuario y evitar sobrescritura
    const prevKeyRef = useRef(cartKey);

    // 1. Cargar carrito y fusionar si es necesario
    useEffect(() => {
        const loadCart = () => {
            const storedUserCart = localStorage.getItem(cartKey);
            let userCartItems: CartItem[] = storedUserCart ? JSON.parse(storedUserCart) : [];

            // Si el usuario acaba de loguearse (pasamos de guest a user)
            if (user && prevKeyRef.current === 'cart_guest') {
                const storedGuestCart = localStorage.getItem('cart_guest');
                if (storedGuestCart) {
                    const guestCartItems: CartItem[] = JSON.parse(storedGuestCart);

                    if (guestCartItems.length > 0) {
                        // FUSIONAR CARRITOS
                        // Recorremos los items del invitado y los sumamos al del usuario
                        guestCartItems.forEach(guestItem => {
                            const existingItemIndex = userCartItems.findIndex(ui => ui.product.id === guestItem.product.id);

                            if (existingItemIndex !== -1) {
                                // Si ya existe, sumamos cantidad (respetando stock máximo)
                                const currentQty = userCartItems[existingItemIndex].quantity;
                                const newQty = Math.min(currentQty + guestItem.quantity, guestItem.product.countInStock);
                                userCartItems[existingItemIndex].quantity = newQty;
                            } else {
                                // Si no existe, lo agregamos
                                userCartItems.push(guestItem);
                            }
                        });

                        // Limpiamos el carrito de invitado para que no se duplique después
                        localStorage.removeItem('cart_guest');
                    }
                }
            }

            setCartItems(userCartItems);
        };

        loadCart();
    }, [cartKey, user]);

    // 2. Guardar carrito cuando cambian los items
    useEffect(() => {
        // Solo guardar si la clave no ha cambiado en este render (evita guardar el carrito del usuario anterior en la clave del nuevo)
        if (prevKeyRef.current !== cartKey) {
            prevKeyRef.current = cartKey;
            return;
        }
        localStorage.setItem(cartKey, JSON.stringify(cartItems));
    }, [cartItems, cartKey]);


    // CALCULAR VALORES DERIVADOS
    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    // Nota: Los ítems canjeados tienen precio 0, así que el total es correcto
    const totalPrice = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

    // LÓGICA DE MANEJO DE ESTADO

    const addToCart = (product: Product, quantity = 1, isRedeemed = false, pointsCost = 0) => {
        setCartItems(prevItems => {
            const exists = prevItems.find(item => item.product.id === product.id);

            if (exists) {
                // Si existe, incrementa la cantidad (revisando stock)
                return prevItems.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: Math.min(item.quantity + quantity, item.product.countInStock) }
                        : item
                );
            } else {
                // Si no existe, añade el nuevo item (revisando stock)
                if (product.countInStock > 0 || isRedeemed) { // Permite añadir el canje aunque el stock sea 0 (es un mock product)
                    return [...prevItems, {
                        product,
                        quantity: Math.min(quantity, product.countInStock || 1), // Stock 1 para canje si es 0
                        isRedeemed,
                        pointsCost
                    }];
                }
                return prevItems; // No añade si el stock es 0
            }
        });
    };

    const removeFromCart = (productId: string) => {
        setCartItems(prevItems => prevItems.filter(item => item.product.id !== productId));
    };

    const increaseQuantity = (productId: string) => {
        setCartItems(prevItems =>
            prevItems.map(item =>
                item.product.id === productId
                    ? { ...item, quantity: Math.min(item.quantity + 1, item.product.countInStock) }
                    : item
            )
        );
    };

    const decreaseQuantity = (productId: string) => {
        setCartItems(prevItems =>
            prevItems
                .map(item =>
                    item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item
                )
                .filter(item => item.quantity > 0) // Elimina si la cantidad llega a 0
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };


    const value = {
        cartItems,
        cartCount,
        totalPrice,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// 5. Hook Personalizado para Consumir el Contexto
export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart debe ser usado dentro de un CartProvider');
    }
    return context;
};