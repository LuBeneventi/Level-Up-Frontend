// level-up-gaming-frontend/src/services/AdminUserService.ts

import axios from './axiosConfig';
import { User, UserCreatePayload, UserUpdatePayload } from '../types/User';
import { API_ENDPOINTS } from './api.config';

export const AdminUserService = {
    getAuthConfig() {
        try {
            const raw = localStorage.getItem('user');
            if (!raw) return {};
            const parsed = JSON.parse(raw);
            if (!parsed?.token) return {};
            return { headers: { Authorization: `Bearer ${parsed.token}` } };
        } catch (e) {
            return {};
        }
    },

    async fetchUsers(): Promise<User[]> {
        try {
            const { data } = await axios.get(API_ENDPOINTS.USERS, AdminUserService.getAuthConfig());
            return Array.isArray(data) ? data : [];
        } catch (error) {
            throw new Error('Error al cargar los usuarios.');
        }
    },

    async createUser(payload: UserCreatePayload): Promise<User> {
        try {
            const { data } = await axios.post(
                `${API_ENDPOINTS.USERS}/admin`,
                payload,
                AdminUserService.getAuthConfig()
            );
            return data;
        } catch (error: any) {
            throw error;
        }
    },

    async updateUser(userId: string, payload: UserUpdatePayload): Promise<User> {
        try {
            const { data } = await axios.put(
                `${API_ENDPOINTS.USERS}/${userId}/admin`,
                payload,
                AdminUserService.getAuthConfig()
            );
            return data;
        } catch (error: any) {
            throw error;
        }
    },

    async toggleUserStatus(userId: string, isActive: boolean): Promise<User> {
        try {
            const { data } = await axios.put(
                `${API_ENDPOINTS.USERS}/${userId}/status`,
                { active: isActive },
                AdminUserService.getAuthConfig()
            );
            return data;
        } catch (error) {
            throw new Error('Fallo al cambiar el estado del usuario.');
        }
    },

    async deleteUser(userId: string): Promise<void> {
        try {
            await axios.delete(
                `${API_ENDPOINTS.USERS}/${userId}/admin`,
                AdminUserService.getAuthConfig()
            );
        } catch (error) {
            throw new Error('Fallo al eliminar el usuario.');
        }
    },
};

export default AdminUserService;
