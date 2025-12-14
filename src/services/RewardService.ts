// level-up-gaming-frontend/src/services/RewardService.ts

import axios from 'axios';
import { Reward } from '../types/Reward';
import { API_ENDPOINTS } from './api.config';

/**
 * Servicio para obtener recompensas disponibles (públicas)
 */
export const RewardService = {
    /**
     * Obtiene todas las recompensas activas
     */
    async fetchAllRewards(): Promise<Reward[]> {
        try {
            const { data } = await axios.get(API_ENDPOINTS.REWARDS);
            return Array.isArray(data) ? data.filter(r => r.isActive) : [];
        } catch (error) {
            throw new Error('Error al cargar las recompensas.');
        }
    },

    /**
     * Obtiene una recompensa por ID
     */
    async fetchRewardById(rewardId: string): Promise<Reward> {
        try {
            const { data } = await axios.get(`${API_ENDPOINTS.REWARDS}/${rewardId}`);
            return data;
        } catch (error) {
            throw new Error('Recompensa no encontrada.');
        }
    },

    /**
     * Obtiene recompensas filtradas por tipo
     */
    async fetchByType(type: string): Promise<Reward[]> {
        try {
            const { data } = await axios.get(API_ENDPOINTS.REWARDS);
            return Array.isArray(data)
                ? data.filter(r => r.isActive && r.type === type)
                : [];
        } catch (error) {
            throw new Error('Error al cargar recompensas por tipo.');
        }
    },

    /**
     * Obtiene recompensas por temporada
     */
    async fetchBySeason(season: string): Promise<Reward[]> {
        try {
            const { data } = await axios.get(API_ENDPOINTS.REWARDS);
            return Array.isArray(data)
                ? data.filter(r => r.isActive && r.season === season)
                : [];
        } catch (error) {
            throw new Error('Error al cargar recompensas por temporada.');
        }
    },

    /**
     * Obtiene recompensas ordenadas por puntos requeridos
     */
    async fetchByPointsCost(ascending = true): Promise<Reward[]> {
        try {
            const { data } = await axios.get(API_ENDPOINTS.REWARDS);
            if (!Array.isArray(data)) return [];
            
            return data
                .filter(r => r.isActive)
                .sort((a, b) =>
                    ascending
                        ? a.pointsCost - b.pointsCost
                        : b.pointsCost - a.pointsCost
                );
        } catch (error) {
            throw new Error('Error al cargar recompensas ordenadas.');
        }
    },
};

export default RewardService;
