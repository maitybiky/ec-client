import { useMutation } from '@tanstack/react-query';
import { http, tokenStore } from '@/shared/api';
import { useUserStore } from '@/entities/user';

export function useRegister() {
  const setUser = useUserStore((s) => s.setUser);

  return useMutation({
    mutationFn: async ({ name, email, password }) => {
      const res = await http.post('/auth/register', { name, email, password });
      return res.data.data;
    },
    onSuccess: ({ user, accessToken }) => {
      tokenStore.set(accessToken);
      setUser(user);
    },
  });
}
