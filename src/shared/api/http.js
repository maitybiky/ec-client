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

// Notified with the user on every successful refresh, and with null when the
// session is unrecoverable (refresh token expired/revoked). Registered by the
// app layer so shared/ never imports upward into entities/.
let onSessionChange = null;
export function setSessionListener(fn) {
  onSessionChange = fn;
}

let refreshPromise = null;

async function refreshAccessToken() {
  refreshPromise ??= axios
    .post(`${env.API_BASE_URL}/auth/refresh`, null, { withCredentials: true })
    .then((res) => {
      const { accessToken, user } = res.data.data;
      tokenStore.set(accessToken);
      onSessionChange?.(user);
      return { accessToken, user };
    })
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

// Refresh shortly BEFORE the access token expires so requests never even see
// a 401 in the common case. The reactive interceptor below stays as fallback.
let refreshTimer = null;
tokenStore.subscribe((token) => {
  clearTimeout(refreshTimer);
  if (!token) return;
  try {
    const payload = JSON.parse(
      atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')),
    );
    const delay = payload.exp * 1000 - Date.now() - 60_000;
    if (delay > 0) {
      refreshTimer = setTimeout(() => {
        // Transient failures are ignored; the 401 interceptor will retry.
        refreshAccessToken().catch(() => {});
      }, delay);
    }
  } catch {
    // Malformed token — fall back to reactive refresh only.
  }
});

// Endpoints whose 401s are genuine (bad credentials / dead refresh token),
// not a sign of an expired access token.
const NO_REFRESH = ['/auth/login', '/auth/register', '/auth/refresh'];

http.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    if (
      status === 401 &&
      original &&
      !original._retried &&
      !NO_REFRESH.some((path) => original.url?.includes(path))
    ) {
      original._retried = true;
      try {
        await refreshAccessToken();
        return http(original);
      } catch {
        tokenStore.clear();
        onSessionChange?.(null); // session is gone — log the UI out
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
