import { useMutation, useQueryClient } from '@tanstack/react-query';
import { http } from '@/shared/api';

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }) => {
      const res = await http.patch(`/orders/${id}/status`, { status });
      return res.data.data.order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export async function downloadOrdersCsv({ status } = {}) {
  const res = await http.get('/orders/export', {
    params: status ? { status } : {},
    responseType: 'blob',
  });
  const url = URL.createObjectURL(res.data);
  const a = document.createElement('a');
  a.href = url;
  a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
