import axios from 'axios';
import { env } from '../config/env.js';
import { tokenStore } from './token.js';

export const http = axios.create({
  baseURL: env.API_BASE_URL,
  withCredentials: true,
});

http.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshPromise = null;

async function refreshAccessToken() {
  refreshPromise ??= axios
    .post(`${env.API_BASE_URL}/auth/refresh`, null, { withCredentials: true })
    .then((res) => {
      const { accessToken, user } = res.data.data;
      tokenStore.set(accessToken);
      return { accessToken, user };
    })
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

http.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    if (status === 401 && !original._retried && !original.url.includes('/auth/')) {
      original._retried = true;
      try {
        await refreshAccessToken();
        return http(original);
      } catch {
        tokenStore.clear();
      }
    }
    return Promise.reject(error);
  },
);

/** Bootstrap session from the refresh cookie on app start. */
export async function restoreSession() {
  try {
    return await refreshAccessToken();
  } catch {
    return null;
  }
}

/** Normalized API error message for UI display. */
export function apiErrorMessage(error) {
  return (
    error.response?.data?.message ??
    error.message ??
    'Something went wrong'
  );
}
