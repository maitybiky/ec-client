import { useMutation, useQueryClient } from '@tanstack/react-query';
import { http } from '@/shared/api';
import { productKeys } from '@/entities/product';

function toFormData({ images, ...fields }) {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined && value !== null && value !== '') {
      fd.append(key, value);
    }
  }
  for (const file of images ?? []) fd.append('images', file);
  return fd;
}

function useInvalidateProducts() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: productKeys.all });
}

export function useCreateProduct() {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: async (values) => {
      const res = await http.post('/products', toFormData(values));
      return res.data.data.product;
    },
    onSuccess: invalidate,
  });
}

export function useUpdateProduct() {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: async ({ id, ...values }) => {
      const res = await http.patch(`/products/${id}`, toFormData(values));
      return res.data.data.product;
    },
    onSuccess: invalidate,
  });
}

export function useDeleteProduct() {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: async ({ id }) => {
      await http.delete(`/products/${id}`);
    },
    onSuccess: invalidate,
  });
}
