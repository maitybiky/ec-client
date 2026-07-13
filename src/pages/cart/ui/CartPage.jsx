import { Link } from 'react-router-dom';
import {
  useCart,
  useUpdateCartItem,
  useRemoveCartItem,
  DiscountBreakdown,
} from '@/entities/cart';
import { Button, Spinner } from '@/shared/ui';
import { formatMoney } from '@/shared/lib/money.js';

function QtyStepper({ quantity, stock, onChange }) {
  return (
    <div className="flex h-9 items-stretch overflow-hidden rounded-full border border-line bg-surface">
      <button
        aria-label="Decrease"
        onClick={() => onChange(quantity - 1)}
        className="w-9 font-bold text-muted transition-colors hover:bg-surface-2 hover:text-ink disabled:opacity-40"
      >
        −
      </button>
      <span className="flex w-9 items-center justify-center text-sm font-semibold tabular-nums">
        {quantity}
      </span>
      <button
        aria-label="Increase"
        disabled={quantity >= stock}
        onClick={() => onChange(quantity + 1)}
        className="w-9 font-bold text-muted transition-colors hover:bg-surface-2 hover:text-ink disabled:opacity-40"
      >
        +
      </button>
    </div>
  );
}

function CartItemRow({ item }) {
  const update = useUpdateCartItem();
  const remove = useRemoveCartItem();
  const { product, quantity } = item;

  const setQty = (qty) => {
    if (qty < 1) remove.mutate({ productId: product.id });
    else update.mutate({ productId: product.id, quantity: qty });
  };

  return (
    <div className="flex gap-3 py-4 sm:gap-4">
      <Link
        to={`/products/${product.id}`}
        className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-surface-2 sm:h-24 sm:w-24"
      >
        {product.images?.[0]?.url ? (
          <img
            src={product.images[0].url}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-2xl opacity-30">🛍️</span>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <Link
            to={`/products/${product.id}`}
            className="line-clamp-2 text-sm font-semibold hover:underline sm:text-base"
          >
            {product.name}
          </Link>
          <button
            aria-label="Remove item"
            disabled={remove.isPending}
            onClick={() => remove.mutate({ productId: product.id })}
            className="shrink-0 rounded-full p-1.5 text-muted transition-colors hover:bg-red-500/10 hover:text-red-500"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-muted sm:text-sm">
          {formatMoney(product.price)} each
          {product.stock <= 5 && (
            <span className="ml-2 text-amber-500">
              only {product.stock} left
            </span>
          )}
        </p>

        <div className="mt-auto flex items-center justify-between pt-2">
          <QtyStepper quantity={quantity} stock={product.stock} onChange={setQty} />
          <p className="text-sm font-bold sm:text-base">
            {formatMoney(item.lineTotal)}
          </p>
        </div>
      </div>
    </div>
  );
}

export function CartPage() {
  const { data: cart, isLoading } = useCart();

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  const isEmpty = !cart || cart.items.length === 0;
  const itemCount = cart?.items.reduce((s, i) => s + i.quantity, 0) ?? 0;

  return (
    <div className="mx-auto max-w-5xl px-3 py-8 sm:px-4">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">
        Your cart{' '}
        {!isEmpty && (
          <span className="text-lg font-medium text-muted">
            · {itemCount} item{itemCount !== 1 && 's'}
          </span>
        )}
      </h1>

      {isEmpty ? (
        <div className="card px-6 py-16 text-center shadow-soft">
          <p className="mb-1 text-4xl">🛒</p>
          <p className="mb-5 text-muted">Your cart is empty.</p>
          <Link to="/shop">
            <Button variant="accent">Browse products</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1fr_340px] lg:gap-6">
          <div className="card divide-y divide-line px-4 shadow-soft sm:px-5">
            {cart.items.map((item) => (
              <CartItemRow key={item.product.id} item={item} />
            ))}
          </div>

          {/* Summary — sticky on desktop, follows content on mobile */}
          <div className="card h-fit p-5 shadow-soft lg:sticky lg:top-24">
            <h2 className="mb-4 font-semibold">Order summary</h2>
            <DiscountBreakdown cart={cart} />
            <Link to="/checkout" className="mt-5 block">
              <Button variant="accent" className="w-full py-2.5">
                Proceed to checkout →
              </Button>
            </Link>
            <p className="mt-3 text-center text-xs text-muted">
              Discounts recalculate automatically as your cart changes
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
