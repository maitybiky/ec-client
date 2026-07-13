import { useQuery } from '@tanstack/react-query';
import { http } from '@/shared/api';

export const categoryKeys = {
  all: ['categories'],
  list: (params) => ['categories', params],
};

export function useCategories({ includeInactive = false } = {}) {
  return useQuery({
    queryKey: categoryKeys.list({ includeInactive }),
    queryFn: async () => {
      const res = await http.get('/categories', {
        params: includeInactive ? { includeInactive: 'true' } : {},
      });
      return res.data.data.categories;
    },
  });
}
