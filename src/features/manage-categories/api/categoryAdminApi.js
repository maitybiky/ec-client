import { useMutation, useQueryClient } from '@tanstack/react-query';
import { http } from '@/shared/api';
import { categoryKeys } from '@/entities/category';

function useInvalidateCategories() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: categoryKeys.all });
}

export function useCreateCategory() {
  const invalidate = useInvalidateCategories();
  return useMutation({
    mutationFn: async ({ name }) => {
      const res = await http.post('/categories', { name });
      return res.data.data.category;
    },
    onSuccess: invalidate,
  });
}

export function useUpdateCategory() {
  const invalidate = useInvalidateCategories();
  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const res = await http.patch(`/categories/${id}`, updates);
      return res.data.data.category;
    },
    onSuccess: invalidate,
  });
}
