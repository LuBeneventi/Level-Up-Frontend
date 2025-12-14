// level-up-gaming-frontend/src/services/AdminEventService.ts

import axios from './axiosConfig';
import { Event, EventFormData } from '../types/Event';
import { API_ENDPOINTS } from './api.config';

/**
 * Servicio para gestionar eventos en el panel administrativo
 */
export const AdminEventService = {
    /**
     * Obtiene todos los eventos
     */
    async fetchEvents(): Promise<Event[]> {
        try {
            const { data } = await axios.get(API_ENDPOINTS.EVENTS);
            return Array.isArray(data) ? data.reverse() : [];
        } catch (error) {
            throw new Error('Error al cargar los eventos.');
        }
    },

    /**
     * Crea un nuevo evento
     */
    async createEvent(payload: EventFormData): Promise<Event> {
        try {
            const { data } = await axios.post(`${API_ENDPOINTS.EVENTS}/admin`, payload);
            return data;
        } catch (error: any) {
            throw error;
        }
    },

    /**
     * Actualiza un evento existente
     */
    async updateEvent(eventId: string, payload: EventFormData): Promise<Event> {
        try {
            const { data } = await axios.put(`${API_ENDPOINTS.EVENTS}/${eventId}/admin`, payload);
            return data;
        } catch (error: any) {
            throw error;
        }
    },

    /**
     * Elimina un evento
     */
    async deleteEvent(eventId: string): Promise<void> {
        try {
            await axios.delete(`${API_ENDPOINTS.EVENTS}/${eventId}/admin`);
        } catch (error) {
            throw new Error('Fallo al eliminar el evento.');
        }
    },
};

export default AdminEventService;
