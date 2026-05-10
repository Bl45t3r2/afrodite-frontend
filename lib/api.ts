import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL + '/api',
  withCredentials: true,
});

// Inject access token on each request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('annuaire-auth');
    if (stored) {
      const { state } = JSON.parse(stored);
      if (state?.accessToken) {
        config.headers.Authorization = `Bearer ${state.accessToken}`;
      }
    }
  }
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const stored = localStorage.getItem('annuaire-auth');
        if (stored) {
          const { state } = JSON.parse(stored);
          const res = await axios.post(
            process.env.NEXT_PUBLIC_API_URL + '/api/auth/refresh',
            { refreshToken: state.refreshToken }
          );
          const { accessToken } = res.data;
          // Update store
          const parsed = JSON.parse(stored);
          parsed.state.accessToken = accessToken;
          localStorage.setItem('annuaire-auth', JSON.stringify(parsed));
          original.headers.Authorization = `Bearer ${accessToken}`;
          return api(original);
        }
      } catch {
        localStorage.removeItem('annuaire-auth');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
