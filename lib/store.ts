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

// Hook pour attendre l'hydration du store
import { useEffect, useState } from 'react';
export function useHasHydrated() {
  const [hasHydrated, setHasHydrated] = useState(false);
  useEffect(() => { setHasHydrated(true); }, []);
  return hasHydrated;
}

// ── Auto-logout après 1h d'inactivité ──
let inactivityTimer: ReturnType<typeof setTimeout> | null = null;
const INACTIVITY_DELAY = 60 * 60 * 1000; // 1 heure

function resetInactivityTimer() {
  if (typeof window === 'undefined') return;
  if (inactivityTimer) clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    const store = useAuthStore.getState();
    if (store.isAuthenticated) {
      store.logout();
      window.location.href = '/auth/login?reason=inactivity';
    }
  }, INACTIVITY_DELAY);
}

if (typeof window !== 'undefined') {
  ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'].forEach(event => {
    window.addEventListener(event, resetInactivityTimer, { passive: true });
  });
  resetInactivityTimer();
}
