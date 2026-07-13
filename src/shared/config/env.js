// Single place where import.meta.env is read.
export const env = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api',
};
