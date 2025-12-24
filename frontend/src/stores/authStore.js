import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      access_token: null,
      refresh_token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.login(credentials);
          const { access, refresh, user } = response.data;
          
          localStorage.setItem('access_token', access);
          localStorage.setItem('refresh_token', refresh);
          
          set({
            user,
            access_token: access,
            refresh_token: refresh,
            isAuthenticated: true,
            isLoading: false
          });
          
          toast.success(`Vitaj, ${user.full_name || user.username}!`);
          return true;
        } catch (error) {
          set({ isLoading: false });
          return false;
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.register(data);
          set({ isLoading: false });
          toast.success('Registrácia úspešná! Čakaj na schválenie admina.');
          return true;
        } catch (error) {
          set({ isLoading: false });
          return false;
        }
      },

      logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        set({
          user: null,
          access_token: null,
          refresh_token: null,
          isAuthenticated: false
        });
        toast.success('Odhlásený');
      },

      refreshUser: async () => {
        try {
          const response = await authAPI.getProfile();
          set({ user: response.data });
        } catch (error) {
          console.error('Failed to refresh user:', error);
        }
      },

      updateProfile: async (data) => {
        try {
          const response = await authAPI.updateProfile(data);
          set({ user: response.data });
          toast.success('Profil aktualizovaný');
          return true;
        } catch (error) {
          return false;
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        access_token: state.access_token,
        refresh_token: state.refresh_token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);
