// src/context/AuthContext.tsx

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios'; // Import the default axios instance
import { API_BASE_URL } from '../services/api.config'; // Import API_BASE_URL

// Create a pre-configured axios instance
export const apiClient = axios.create({
    baseURL: API_BASE_URL, // Use the base URL from api.config.ts
});

// 1. Definición de Tipos de Dirección y Usuario
interface Address {
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
    age: number;
    role: 'admin' | 'customer' | 'seller';
    token: string;
    hasDuocDiscount: boolean;
    points: number;
    referralCode: string;
    address: Address; // 🚨 Incluido para la gestión de envío
}

interface AuthContextType {
    user: User | null;
    isLoggedIn: boolean;
    login: (loginIdentifier: string, password: string) => Promise<boolean>;
    logout: () => void;
    register: (name: string, email: string, password: string) => Promise<boolean>;
    updateProfile: (userData: Partial<User>) => Promise<boolean>;
    // 🚨 Función para guardar el usuario tras registro o actualización de perfil (PUT)
    setUserFromRegistration: (userData: User) => void;
}

// 2. Creación del Contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Proveedor del Contexto
interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    // Inicializar el estado leyendo desde localStorage
    const [user, setUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const isLoggedIn = !!user;

    // Persistir el usuario en localStorage cada vez que cambie
    useEffect(() => {
        if (user) {
            // Set header for the apiClient instance
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            // Remove header from apiClient instance
            delete apiClient.defaults.headers.common['Authorization'];
            localStorage.removeItem('user');
        }
    }, [user]);

    // Función de Login que llama a la API de tu Backend
    const login = async (loginIdentifier: string, password: string): Promise<boolean> => {
        try {
            // Send 'email' to match backend's LoginRequest DTO
            const res = await apiClient.post('/users/login', { email: loginIdentifier, password }); // Use apiClient
            const userData: User = res.data;

            setUser(userData);
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`; // Set for apiClient
            return true;
        } catch (error) {
            setUser(null);
            return false;
        }
    };

    // 🚨 FUNCIÓN PARA GUARDAR EL ESTADO DIRECTAMENTE (Usada en Registro y Edición de Perfil)
    const setUserFromRegistration = (userData: User) => {
        setUser(userData);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`; // Set for apiClient
    };

    // Función de Logout
    const logout = async () => {
        try {
            if (user?.token) {
                await apiClient.post('/users/logout');
            }
        } catch (error) {
            console.error("Logout failed on server", error);
        } finally {
            // Always clear local state
            setUser(null);
            localStorage.removeItem('user');
            delete apiClient.defaults.headers.common['Authorization'];
        }
    };

    // Listen for storage events to sync logout across tabs
    useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === 'user' && event.newValue === null) {
                setUser(null);
                delete apiClient.defaults.headers.common['Authorization'];
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    // Axios interceptor to handle 401 Unauthorized responses
    useEffect(() => {
        const interceptor = apiClient.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response && error.response.status === 401) {
                    logout();
                }
                return Promise.reject(error);
            }
        );

        return () => {
            apiClient.interceptors.response.eject(interceptor);
        };
    }, []);

    const register = async (name: string, email: string, password: string): Promise<boolean> => {
        try {
            const res = await apiClient.post('/users/register', { name, email, password }); // Use apiClient
            const userData: User = res.data;
            setUser(userData);
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`; // Set for apiClient
            return true;
        } catch (error) {
            return false;
        }
    };

    const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
        try {
            // For updateProfile, it's better to pass the token directly in the request config
            // as the user.token might be stale if the update itself generates a new token.
            // However, if the backend doesn't return a new token, using the default is fine.
            // Let's stick to the default for consistency with the current pattern.
            const res = await apiClient.put('/users/profile', userData); // Use apiClient
            const updatedUserData: User = res.data;
            setUser(updatedUserData);
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${updatedUserData.token}`; // Set for apiClient
            return true;
        } catch (error) {
            return false;
        }
    };

    const value = {
        user,
        isLoggedIn,
        login,
        logout,
        register,
        updateProfile,
        setUserFromRegistration,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 4. Hook Personalizado para usar el Contexto
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};