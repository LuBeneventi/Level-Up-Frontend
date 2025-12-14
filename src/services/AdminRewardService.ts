
// level-up-gaming-frontend/src/services/AdminRewardService.ts

import axios from './axiosConfig';
import { Reward, RewardFormData } from '../types/Reward';
import { API_ENDPOINTS } from './api.config';
import { REWARD_TYPES, REWARD_SEASONS } from '../utils/constants';

export { REWARD_TYPES, REWARD_SEASONS };

export const AdminRewardService = {
  getAuthConfig() {
    try {
      const raw = localStorage.getItem('user');
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      const token = parsed?.token;
      if (!token) return {};
      // logging seguro: no mostramos todo el token
      console.debug('[AdminRewardService] usando token:', `${token.slice(0, 8)}...${token.slice(-8)}`);
      return { headers: { Authorization: `Bearer ${token}` } };
    } catch (e) {
      console.error('[AdminRewardService] error parseando localStorage user', e);
      return {};
    }
  },

  async fetchRewards(): Promise<Reward[]> {
    try {
      const { data } = await axios.get(
        `${API_ENDPOINTS.REWARDS}/admin`,
        AdminRewardService.getAuthConfig()
      );
      return Array.isArray(data) ? data.reverse() : [];
    } catch (error: any) {
      console.error('[AdminRewardService.fetchRewards] error', extractAxiosError(error));
      throw friendlyError(error, 'Error al cargar las recompensas.');
    }
  },

  async createReward(payload: RewardFormData): Promise<Reward> {
    try {
      const { data } = await axios.post(
        `${API_ENDPOINTS.REWARDS}/admin`,
        payload,
        AdminRewardService.getAuthConfig()
      );
      return data;
    } catch (error: any) {
      console.error('[AdminRewardService.createReward] error', extractAxiosError(error));
      throw friendlyError(error, 'Fallo al crear la recompensa.');
    }
  },

  async updateReward(rewardId: string, payload: RewardFormData): Promise<Reward> {
    try {
      const { data } = await axios.put(
        `${API_ENDPOINTS.REWARDS}/${rewardId}/admin`,
        payload,
        AdminRewardService.getAuthConfig()
      );
      return data;
    } catch (error: any) {
      console.error('[AdminRewardService.updateReward] error', extractAxiosError(error));
      throw friendlyError(error, 'Fallo al actualizar la recompensa.');
    }
  },

  async toggleRewardActive(rewardId: string, isActive: boolean): Promise<Reward> {
    try {
      const { data } = await axios.put(
        `${API_ENDPOINTS.REWARDS}/${rewardId}/admin`,
        { isActive },
        AdminRewardService.getAuthConfig()
      );
      return data;
    } catch (error: any) {
      console.error('[AdminRewardService.toggleRewardActive] error', extractAxiosError(error));
      throw friendlyError(error, 'Fallo al cambiar el estado de la recompensa.');
    }
  },

  async deleteReward(rewardId: string): Promise<void> {
    try {
      await axios.delete(
        `${API_ENDPOINTS.REWARDS}/${rewardId}/admin`,
        AdminRewardService.getAuthConfig()
      );
    } catch (error: any) {
      console.error('[AdminRewardService.deleteReward] error', extractAxiosError(error));
      throw friendlyError(error, 'Fallo al eliminar la recompensa.');
    }
  },
};

function extractAxiosError(err: any) {
  if (!err) return { message: 'Error desconocido' };
  if (err.response) {
    return {
      status: err.response.status,
      data: err.response.data,
      message: err.message
    };
  }
  return { message: err.message || String(err) };
}

function friendlyError(err: any, fallbackMsg: string) {
  const info = extractAxiosError(err);
  const status = info.status ?? 'N/A';
  const serverMsg = info.data?.message || info.data || null;
  const message = serverMsg ? `${fallbackMsg} - ${serverMsg}` : fallbackMsg;
  const e = new Error(message) as any;
  e.status = status;
  e.raw = info;
  return e;
}

export default AdminRewardService;
