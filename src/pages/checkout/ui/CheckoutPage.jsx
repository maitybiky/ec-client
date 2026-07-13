import { Link, Navigate } from 'react-router-dom';
import { useCart, DiscountBreakdown } from '@/entities/cart';
import { CheckoutForm } from '@/features/checkout';
import { Spinner } from '@/shared/ui';

export function CheckoutPage() {
  const { data: cart, isLoading } = useCart();

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link to="/cart" className="text-sm text-gray-500 hover:underline">
        ← Back to cart
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-bold">Checkout</h1>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="mb-4 font-semibold">Shipping details</h2>
          <CheckoutForm payable={cart.payable} />
        </div>

        <div className="h-fit rounded-xl border border-gray-200 p-5">
          <h2 className="mb-4 font-semibold">Order summary</h2>
          <ul className="mb-4 space-y-1 text-sm text-gray-600">
            {cart.items.map((item) => (
              <li key={item.product.id} className="flex justify-between">
                <span>
                  {item.product.name} × {item.quantity}
                </span>
              </li>
            ))}
          </ul>
          <DiscountBreakdown cart={cart} />
        </div>
      </div>
    </div>
  );
}
