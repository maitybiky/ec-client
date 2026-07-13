import { create } from 'zustand';
import { tokenStore } from '@/shared/api';

export const useUserStore = create((set) => ({
  user: null,
  isReady: false, // becomes true after session restore attempt
  setUser: (user) => set({ user }),
  setReady: () => set({ isReady: true }),
  clear: () => {
    tokenStore.clear();
    set({ user: null });
  },
}));

export const selectIsAdmin = (s) => s.user?.role === 'admin';
