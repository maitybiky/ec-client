import { useQuery } from '@tanstack/react-query';
import { http } from '@/shared/api';

export const homepageKeys = { all: ['homepage'] };

export function useHomepage() {
  return useQuery({
    queryKey: homepageKeys.all,
    queryFn: async () => {
      const res = await http.get('/homepage');
      return res.data.data.homepage;
    },
    staleTime: 60_000,
  });
}
