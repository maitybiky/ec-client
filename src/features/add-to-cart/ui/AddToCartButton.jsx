import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart, useAddToCart } from '@/entities/cart';
import { useUserStore } from '@/entities/user';
import { Button, Spinner } from '@/shared/ui';
import { apiErrorMessage } from '@/shared/api';

const DEBOUNCE_MS = 700;

/**
 * Rapid clicks accumulate locally and are flushed as ONE cart API call
 * after a short pause. Once the item is in the cart the label switches
 * to "Add more (n in cart)".
 */
export function AddToCartButton({ product, quantity = 1, className = '' }) {
  const user = useUserStore((s) => s.user);
  const navigate = useNavigate();
  const addToCart = useAddToCart();
  const { data: cart } = useCart({ enabled: Boolean(user) });

  const [pendingQty, setPendingQty] = useState(0);
  const pendingRef = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const productId = product._id ?? product.id;
  const inCartQty =
    cart?.items?.find((i) => i.product.id === productId)?.quantity ?? 0;
  const outOfStock = product.stock < 1;
  const maxReached = inCartQty + pendingRef.current >= product.stock;

  const flush = () => {
    const qty = pendingRef.current;
    if (qty <= 0) return;
    pendingRef.current = 0;
    setPendingQty(0);
    addToCart.mutate({ productId, quantity: qty });
  };

  const handleClick = () => {
    if (!user) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
    pendingRef.current = Math.min(
      pendingRef.current + quantity,
      Math.max(product.stock - inCartQty, 0),
    );
    setPendingQty(pendingRef.current);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(flush, DEBOUNCE_MS);
  };

  let label = 'Add to cart';
  if (outOfStock) label = 'Out of stock';
  else if (pendingQty > 0) label = `Adding +${pendingQty}…`;
  else if (inCartQty > 0) label = `Add more (${inCartQty} in cart)`;

  return (
    <div className={className}>
      <Button
        onClick={handleClick}
        disabled={outOfStock || (maxReached && pendingQty === 0)}
        className="w-full"
      >
        {addToCart.isPending && pendingQty === 0 ? (
          <Spinner className="h-4 w-4" />
        ) : (
          label
        )}
      </Button>
      {addToCart.isError && (
        <p className="mt-1 text-xs text-red-600">
          {apiErrorMessage(addToCart.error)}
        </p>
      )}
    </div>
  );
}
