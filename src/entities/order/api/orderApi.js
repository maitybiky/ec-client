import { useQuery } from '@tanstack/react-query';
import { http } from '@/shared/api';

export const orderKeys = {
  my: (params) => ['orders', 'my', params],
  myDetail: (id) => ['orders', 'my', 'detail', id],
  admin: (params) => ['orders', 'admin', params],
};

export function useMyOrders(params = {}) {
  return useQuery({
    queryKey: orderKeys.my(params),
    queryFn: async () => {
      const res = await http.get('/orders/my', { params });
      return res.data.data;
    },
  });
}

export function useMyOrder(id) {
  return useQuery({
    queryKey: orderKeys.myDetail(id),
    queryFn: async () => {
      const res = await http.get(`/orders/my/${id}`);
      return res.data.data.order;
    },
    enabled: Boolean(id),
  });
}

export function useAdminOrders(params = {}) {
  return useQuery({
    queryKey: orderKeys.admin(params),
    queryFn: async () => {
      const res = await http.get('/orders', { params });
      return res.data.data;
    },
    keepPreviousData: true,
  });
}

export const ORDER_STATUS_COLORS = {
  placed: 'blue',
  completed: 'green',
  cancelled: 'red',
};
