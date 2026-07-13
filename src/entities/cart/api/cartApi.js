import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { http } from '@/shared/api';

export const cartKeys = { all: ['cart'] };

export function useCart({ enabled = true } = {}) {
  return useQuery({
    queryKey: cartKeys.all,
    queryFn: async () => {
      const res = await http.get('/cart');
      return res.data.data.cart;
    },
    enabled,
  });
}

function useCartMutation(mutationFn) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (cart) => {
      queryClient.setQueryData(cartKeys.all, cart);
    },
  });
}

export function useAddToCart() {
  return useCartMutation(async ({ productId, quantity = 1 }) => {
    const res = await http.post('/cart/items', { productId, quantity });
    return res.data.data.cart;
  });
}

export function useUpdateCartItem() {
  return useCartMutation(async ({ productId, quantity }) => {
    const res = await http.patch(`/cart/items/${productId}`, { quantity });
    return res.data.data.cart;
  });
}

export function useRemoveCartItem() {
  return useCartMutation(async ({ productId }) => {
    const res = await http.delete(`/cart/items/${productId}`);
    return res.data.data.cart;
  });
}
