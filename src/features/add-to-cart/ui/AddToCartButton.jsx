import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useCart,
  useAddToCart,
  useUpdateCartItem,
  useRemoveCartItem,
} from '@/entities/cart';
import { useUserStore } from '@/entities/user';
import { apiErrorMessage } from '@/shared/api';

const FLUSH_MS = 600;

/**
 * Not in cart → accent "Add to cart" pill.
 * In cart → − qty + stepper. Rapid taps update the number instantly and
 * are synced to the server as ONE call after a short pause.
 */
export function AddToCartButton({ product, className = '' }) {
  const user = useUserStore((s) => s.user);
  const navigate = useNavigate();
  const addToCart = useAddToCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const { data: cart } = useCart({ enabled: Boolean(user) });

  const productId = product._id ?? product.id;
  const serverQty =
    cart?.items?.find((i) => i.product.id === productId)?.quantity ?? 0;

  const [delta, setDelta] = useState(0); // unsynced local change
  const deltaRef = useRef(0);
  const timerRef = useRef(null);
  useEffect(() => () => clearTimeout(timerRef.current), []);

  const shownQty = Math.max(serverQty + delta, 0);
  const outOfStock = product.stock < 1;
  const error = addToCart.error ?? updateItem.error ?? removeItem.error;

  const flush = () => {
    const target = Math.max(serverQty + deltaRef.current, 0);
    deltaRef.current = 0;
    setDelta(0);
    if (target === serverQty) return;
    if (serverQty === 0) {
      // Normalized to the cart view shape so the optimistic insert renders
      // identically to what the server returns.
      const cartProduct = {
        id: productId,
        name: product.name,
        price: product.price,
        images: product.images,
        stock: product.stock,
        category: product.category,
      };
      addToCart.mutate({ productId, quantity: target, product: cartProduct });
    } else if (target === 0) removeItem.mutate({ productId });
    else updateItem.mutate({ productId, quantity: target });
  };

  const bump = (step) => {
    if (!user) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
    const next = Math.min(
      Math.max(serverQty + deltaRef.current + step, 0),
      product.stock,
    );
    deltaRef.current = next - serverQty;
    setDelta(deltaRef.current);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(flush, FLUSH_MS);
  };

  if (outOfStock) {
    return (
      <div className={className}>
        <span className="flex h-10 w-full items-center justify-center rounded-full bg-surface-2 text-sm font-medium text-muted">
          Out of stock
        </span>
      </div>
    );
  }

  return (
    <div className={className}>
      {shownQty === 0 ? (
        <button
          onClick={() => bump(1)}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-full bg-accent text-sm font-semibold text-accent-ink transition-all hover:brightness-95 active:scale-[0.98]"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          Add to cart
        </button>
      ) : (
        <div className="flex h-10 w-full items-stretch overflow-hidden rounded-full bg-accent text-accent-ink">
          <button
            onClick={() => bump(-1)}
            aria-label="Decrease quantity"
            className="w-11 text-lg font-bold transition-colors hover:bg-black/10 active:bg-black/20"
          >
            −
          </button>
          <span className="flex flex-1 items-center justify-center text-sm font-bold tabular-nums">
            {shownQty}
            <span className="ml-1 hidden font-medium opacity-60 sm:inline">
              in cart
            </span>
          </span>
          <button
            onClick={() => bump(1)}
            disabled={shownQty >= product.stock}
            aria-label="Increase quantity"
            className="w-11 text-lg font-bold transition-colors hover:bg-black/10 active:bg-black/20 disabled:opacity-30"
          >
            +
          </button>
        </div>
      )}
      {error && (
        <p className="mt-1 text-xs text-red-500">{apiErrorMessage(error)}</p>
      )}
    </div>
  );
}
