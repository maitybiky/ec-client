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

const round2 = (n) => Math.round(n * 100) / 100;

/**
 * Client-side approximation of the server cart view so the UI updates
 * instantly. Keeps the current discount percent; the server response
 * reconciles rule changes when it lands.
 */
function optimisticCart(cart, { productId, quantity, product }) {
  const existing = cart.items.find((i) => i.product.id === productId);
  let items;
  if (quantity <= 0) {
    items = cart.items.filter((i) => i.product.id !== productId);
  } else if (existing) {
    items = cart.items.map((i) =>
      i.product.id === productId
        ? { ...i, quantity, lineTotal: round2(i.product.price * quantity) }
        : i,
    );
  } else if (product) {
    items = [...cart.items, { product, quantity, lineTotal: round2(product.price * quantity) }];
  } else {
    return cart; // adding an unknown product — let the server response fill it in
  }

  const subtotal = round2(items.reduce((s, i) => s + i.lineTotal, 0));
  const appliedPercent = cart.appliedPercent ?? 0;
  const discountAmount = round2(subtotal * (appliedPercent / 100));
  const payable = round2(subtotal - discountAmount);
  return { ...cart, items, subtotal, discountAmount, payable };
}

function useCartMutation(mutationFn, toQuantity) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: cartKeys.all,
    mutationFn,
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: cartKeys.all });
      const previous = queryClient.getQueryData(cartKeys.all);
      if (previous) {
        queryClient.setQueryData(
          cartKeys.all,
          optimisticCart(previous, { ...vars, quantity: toQuantity(vars, previous) }),
        );
      }
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(cartKeys.all, ctx.previous);
      // Rollback can be stale under concurrent taps — fetch the truth.
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
    onSuccess: (cart) => {
      // Only the last in-flight cart mutation may write the server state,
      // otherwise an earlier response would clobber newer optimistic taps.
      if (queryClient.isMutating({ mutationKey: cartKeys.all }) <= 1) {
        queryClient.setQueryData(cartKeys.all, cart);
      }
    },
  });
}

export function useAddToCart() {
  return useCartMutation(
    async ({ productId, quantity = 1 }) => {
      const res = await http.post('/cart/items', { productId, quantity });
      return res.data.data.cart;
    },
    ({ productId, quantity = 1 }, cart) =>
      (cart.items.find((i) => i.product.id === productId)?.quantity ?? 0) + quantity,
  );
}

export function useUpdateCartItem() {
  return useCartMutation(
    async ({ productId, quantity }) => {
      const res = await http.patch(`/cart/items/${productId}`, { quantity });
      return res.data.data.cart;
    },
    ({ quantity }) => quantity,
  );
}

export function useRemoveCartItem() {
  return useCartMutation(
    async ({ productId }) => {
      const res = await http.delete(`/cart/items/${productId}`);
      return res.data.data.cart;
    },
    () => 0,
  );
}
