import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from './api';

interface User {
  id: string;
  email: string;
  role: 'USER' | 'PREMIUM' | 'ADMIN';
  profile: {
    id: string;
    displayName: string;
    city: string;
    age: number;
    photos: { url: string; isMain: boolean }[];
    status: string;
  } | null;
  subscription?: { plan: string; status: string; currentPeriodEnd: string };
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const res = await api.post('/auth/login', { identifier: email, password });
        set({
          user: res.data.user,
          accessToken: res.data.accessToken,
          refreshToken: res.data.refreshToken,
          isAuthenticated: true,
        });
      },

      register: async (data) => {
        const res = await api.post('/auth/register', data);
        set({
          user: res.data.user,
          accessToken: res.data.accessToken,
          refreshToken: res.data.refreshToken,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },

      refreshAuth: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return;
        try {
          const res = await api.post('/auth/refresh', { refreshToken });
          set({ accessToken: res.data.accessToken, refreshToken: res.data.refreshToken });
        } catch {
          get().logout();
        }
      },

      updateUser: (data) => {
        set((state) => ({ user: state.user ? { ...state.user, ...data } : null }));
      },
    }),
    { name: 'annuaire-auth', partialize: (s) => ({ accessToken: s.accessToken, refreshToken: s.refreshToken, user: s.user, isAuthenticated: s.isAuthenticated }) }
  )
);

export default useAuthStore;
