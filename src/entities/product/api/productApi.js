import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { http } from '@/shared/api';

export const productKeys = {
  all: ['products'],
  list: (params) => ['products', 'list', params],
  infinite: (params) => ['products', 'infinite', params],
  search: (term) => ['products', 'search', term],
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

/** Endless product feed for infinite scroll. */
export function useInfiniteProducts(params = {}) {
  return useInfiniteQuery({
    queryKey: productKeys.infinite(params),
    queryFn: async ({ pageParam = 1 }) => {
      const res = await http.get('/products', {
        params: { ...params, page: pageParam },
      });
      return res.data.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
  });
}

/** Lightweight typeahead search (debounce the term before passing it in). */
export function useProductSearch(term) {
  return useQuery({
    queryKey: productKeys.search(term),
    queryFn: async () => {
      const res = await http.get('/products', {
        params: { search: term, limit: 6 },
      });
      return res.data.data.products;
    },
    enabled: term.trim().length >= 2,
    staleTime: 30_000,
    placeholderData: (prev) => prev,
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
