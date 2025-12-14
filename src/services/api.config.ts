// level-up-gaming-frontend/src/services/api.config.ts

/**
 * Configuración centralizada de la API
 * Cambia aquí la URL base según tu entorno
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Endpoints disponibles
export const API_ENDPOINTS = {
    ORDERS: `${API_BASE_URL}/orders`,
    USERS: `${API_BASE_URL}/users`,
    PRODUCTS: `${API_BASE_URL}/products`,
    BLOGS: `${API_BASE_URL}/blog`,
    EVENTS: `${API_BASE_URL}/events`,
    VIDEOS: `${API_BASE_URL}/videos`,
    REWARDS: `${API_BASE_URL}/rewards`,
};

export default API_ENDPOINTS;
