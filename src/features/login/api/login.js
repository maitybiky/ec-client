import { useMutation } from '@tanstack/react-query';
import { http, tokenStore } from '@/shared/api';
import { useUserStore } from '@/entities/user';

export function useLogin() {
  const setUser = useUserStore((s) => s.setUser);

  return useMutation({
    mutationFn: async (credentials) => {
      const res = await http.post('/auth/login', credentials);
      return res.data.data;
    },
    onSuccess: ({ user, accessToken }) => {
      tokenStore.set(accessToken);
      setUser(user);
    },
  });
}
