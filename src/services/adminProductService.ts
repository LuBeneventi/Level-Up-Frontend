// level-up-gaming-frontend/src/services/AdminProductService.ts

import axios from './axiosConfig';
import { Product, ProductPayload } from '../types/Product';
import { API_ENDPOINTS } from './api.config';
import { PRODUCT_CATEGORIES, MAX_PRODUCT_STOCK, MAX_PRODUCT_PRICE_CLP } from '../utils/constants';

/**
 * Constantes del servicio (exportadas desde utils/constants)
 */
export const CATEGORIES = PRODUCT_CATEGORIES;
export const MAX_STOCK = MAX_PRODUCT_STOCK;
export const MAX_PRICE_CLP = MAX_PRODUCT_PRICE_CLP;

/**
 * Servicio para gestionar productos en el panel administrativo
 */
export const AdminProductService = {
    // Constantes públicas
    CATEGORIES,
    MAX_STOCK,
    MAX_PRICE_CLP,

    /**
     * Obtiene todos los productos
     */
    async fetchProducts(): Promise<Product[]> {
        try {
            const { data } = await axios.get(`${API_ENDPOINTS.PRODUCTS}?admin=true`);
            return Array.isArray(data) ? data : [];
        } catch (error) {
            throw new Error('No se pudo cargar la lista de productos.');
        }
    },

    /**
     * Crea un nuevo producto
     */
    async createProduct(payload: ProductPayload): Promise<Product> {
        try {
            const { data } = await axios.post(API_ENDPOINTS.PRODUCTS, payload);
            return data;
        } catch (error: any) {
            throw error;
        }
    },

    /**
     * Actualiza un producto existente
     */
    async updateProduct(productId: string, payload: ProductPayload): Promise<Product> {
        try {
            const { data } = await axios.put(`${API_ENDPOINTS.PRODUCTS}/${productId}`, payload);
            return data;
        } catch (error: any) {
            throw error;
        }
    },

    /**
     * Activa o desactiva un producto
     */
    async toggleProductActiveStatus(productId: string, active: boolean): Promise<Product> {
        try {
            const { data } = await axios.put(`${API_ENDPOINTS.PRODUCTS}/${productId}`, { active });
            return data;
        } catch (error) {
            throw new Error('Fallo al cambiar el estado del producto.');
        }
    },

    /**
     * Elimina un producto
     */
    async deleteProduct(productId: string): Promise<void> {
        try {
            await axios.delete(`${API_ENDPOINTS.PRODUCTS}/${productId}`);
        } catch (error) {
            throw new Error('Fallo al eliminar el producto.');
        }
    },
};

export default AdminProductService;
