import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL + '/api',
  withCredentials: true,
});

// Inject access token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('annuaire-auth');
      if (stored) {
        const { state } = JSON.parse(stored);
        if (state?.accessToken) {
          config.headers.Authorization = `Bearer ${state.accessToken}`;
        }
      }
    } catch {}
  }
  return config;
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        }).catch(err => Promise.reject(err));
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const stored = localStorage.getItem('annuaire-auth');
        if (!stored) throw new Error('No stored auth');
        
        const { state } = JSON.parse(stored);
        if (!state?.refreshToken) throw new Error('No refresh token');

        const res = await axios.post(
          process.env.NEXT_PUBLIC_API_URL + '/api/auth/refresh',
          { refreshToken: state.refreshToken }
        );
        
        const { accessToken, refreshToken } = res.data;
        
        // Update localStorage
        const parsed = JSON.parse(stored);
        parsed.state.accessToken = accessToken;
        if (refreshToken) parsed.state.refreshToken = refreshToken;
        localStorage.setItem('annuaire-auth', JSON.stringify(parsed));
        
        original.headers.Authorization = `Bearer ${accessToken}`;
        processQueue(null, accessToken);
        return api(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('annuaire-auth');
        if (typeof window !== 'undefined') window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
