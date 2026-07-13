import { useMutation, useQueryClient } from '@tanstack/react-query';
import { http } from '@/shared/api';
import { cartKeys } from '@/entities/cart';

export function usePlaceOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shippingAddress) => {
      const res = await http.post('/orders', { shippingAddress });
      return res.data.data.order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
