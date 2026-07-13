// In-memory access-token holder. Kept in shared so the axios client can
// read it without importing upward into entities/features.
let accessToken = null;
const listeners = new Set();

export const tokenStore = {
  get: () => accessToken,
  set(token) {
    accessToken = token;
    listeners.forEach((fn) => fn(token));
  },
  clear() {
    tokenStore.set(null);
  },
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};
