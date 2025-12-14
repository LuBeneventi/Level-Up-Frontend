// level-up-gaming-frontend/src/services/AdminVideoService.ts

import axios from './axiosConfig';
import { Video, VideoFormData } from '../types/Video';
import { API_ENDPOINTS } from './api.config';

/**
 * Servicio para gestionar videos en el panel administrativo
 */
export const AdminVideoService = {
    /**
     * Obtiene todos los videos
     */
    async fetchVideos(): Promise<Video[]> {
        try {
            const { data } = await axios.get(API_ENDPOINTS.VIDEOS);
            return Array.isArray(data) ? data.reverse() : [];
        } catch (error) {
            throw new Error('Error al cargar los videos.');
        }
    },

    /**
     * Crea un nuevo video
     */
    async createVideo(payload: VideoFormData): Promise<Video> {
        try {
            const { data } = await axios.post(API_ENDPOINTS.VIDEOS, payload);
            return data;
        } catch (error: any) {
            throw error;
        }
    },

    /**
     * Actualiza un video existente
     */
    async updateVideo(videoId: string, payload: VideoFormData): Promise<Video> {
        try {
            const { data } = await axios.put(`${API_ENDPOINTS.VIDEOS}/${videoId}`, payload);
            return data;
        } catch (error: any) {
            throw error;
        }
    },

    /**
     * Elimina un video
     */
    async deleteVideo(videoId: string): Promise<void> {
        try {
            await axios.delete(`${API_ENDPOINTS.VIDEOS}/${videoId}`);
        } catch (error) {
            throw new Error('Fallo al eliminar el video.');
        }
    },

    /**
     * Toggle del estado destacado (featured) de un video
     */
    async toggleVideoFeaturedStatus(videoId: string, isFeatured: boolean): Promise<Video> {
        try {
            const { data } = await axios.put(`${API_ENDPOINTS.VIDEOS}/${videoId}`, { isFeatured });
            return data;
        } catch (error) {
            throw new Error('Fallo al actualizar el estado destacado del video.');
        }
    },
};

export default AdminVideoService;
