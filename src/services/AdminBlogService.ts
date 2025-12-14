// level-up-gaming-frontend/src/services/AdminBlogService.ts

import axios from './axiosConfig';
import { BlogPost, PostFormData } from '../types/Blog';
import { API_ENDPOINTS } from './api.config';

/**
 * Servicio para gestionar blog en el panel administrativo
 */
export const AdminBlogService = {
    /**
     * Obtiene todos los posts
     */
    async fetchPosts(): Promise<BlogPost[]> {
        try {
            const { data } = await axios.get(API_ENDPOINTS.BLOGS);
            return Array.isArray(data) ? data.reverse() : [];
        } catch (error) {
            throw new Error('Error al cargar los posts.');
        }
    },

    /**
     * Crea un nuevo post
     */
    async createPost(payload: PostFormData): Promise<BlogPost> {
        try {
            const { data } = await axios.post(`${API_ENDPOINTS.BLOGS}/admin`, payload);
            return data;
        } catch (error: any) {
            throw error;
        }
    },

    /**
     * Actualiza un post existente
     */
    async updatePost(postId: string, payload: PostFormData): Promise<BlogPost> {
        try {
            const { data } = await axios.put(`${API_ENDPOINTS.BLOGS}/${postId}/admin`, payload);
            return data;
        } catch (error: any) {
            throw error;
        }
    },

    /**
     * Elimina un post
     */
    async deletePost(postId: string): Promise<void> {
        try {
            await axios.delete(`${API_ENDPOINTS.BLOGS}/${postId}/admin`);
        } catch (error) {
            throw new Error('Fallo al eliminar el post.');
        }
    },
};

export default AdminBlogService;
