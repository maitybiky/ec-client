import { useQuery } from '@tanstack/react-query';
import { http } from '@/shared/api';

export const productKeys = {
  all: ['products'],
  list: (params) => ['products', 'list', params],
  detail: (id) => ['products', 'detail', id],
};

export function useProducts(params = {}) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: async () => {
      const res = await http.get('/products', { params });
      return res.data.data; // { products, pagination }
    },
    keepPreviousData: true,
  });
}

export function useProduct(id) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: async () => {
      const res = await http.get(`/products/${id}`);
      return res.data.data.product;
    },
    enabled: Boolean(id),
  });
}
