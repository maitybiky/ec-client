import { Link } from 'react-router-dom';
import {
  useCart,
  useUpdateCartItem,
  useRemoveCartItem,
  DiscountBreakdown,
} from '@/entities/cart';
import { Button, Spinner } from '@/shared/ui';
import { formatMoney } from '@/shared/lib/money.js';

function CartItemRow({ item }) {
  const update = useUpdateCartItem();
  const remove = useRemoveCartItem();
  const { product, quantity } = item;

  return (
    <div className="flex items-center gap-4 border-b border-line py-4">
      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg bg-surface-2">
        {product.images?.[0]?.url ? (
          <img
            src={product.images[0].url}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-2xl text-muted/40">🛍️</span>
        )}
      </div>

      <div className="flex-1">
        <p className="font-medium">{product.name}</p>
        <p className="text-sm text-muted">{formatMoney(product.price)} each</p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          className="h-8 w-8 !p-0"
          disabled={quantity <= 1 || update.isPending}
          onClick={() =>
            update.mutate({ productId: product.id, quantity: quantity - 1 })
          }
        >
          −
        </Button>
        <span className="w-8 text-center text-sm font-medium">{quantity}</span>
        <Button
          variant="secondary"
          className="h-8 w-8 !p-0"
          disabled={quantity >= product.stock || update.isPending}
          onClick={() =>
            update.mutate({ productId: product.id, quantity: quantity + 1 })
          }
        >
          +
        </Button>
      </div>

      <p className="w-24 text-right font-medium">{formatMoney(item.lineTotal)}</p>

      <Button
        variant="ghost"
        className="text-red-600"
        disabled={remove.isPending}
        onClick={() => remove.mutate({ productId: product.id })}
      >
        Remove
      </Button>
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

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Your cart</h1>

      {isEmpty ? (
        <div className="py-16 text-center">
          <p className="mb-4 text-muted">Your cart is empty.</p>
          <Link to="/">
            <Button>Browse products</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            {cart.items.map((item) => (
              <CartItemRow key={item.product.id} item={item} />
            ))}
          </div>

          <div className="h-fit rounded-xl border border-line p-5">
            <h2 className="mb-4 font-semibold">Summary</h2>
            <DiscountBreakdown cart={cart} />
            <Link to="/checkout" className="mt-4 block">
              <Button className="w-full">Proceed to checkout</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
