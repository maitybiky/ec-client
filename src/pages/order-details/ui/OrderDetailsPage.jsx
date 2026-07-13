import { useParams, useLocation, Link } from 'react-router-dom';
import { useMyOrder, ORDER_STATUS_COLORS } from '@/entities/order';
import { Badge, Spinner } from '@/shared/ui';
import { formatMoney } from '@/shared/lib/money.js';

export function OrderDetailsPage() {
  const { id } = useParams();
  const location = useLocation();
  const { data: order, isLoading } = useMyOrder(id);
  const justPlaced = location.state?.justPlaced;

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }
  if (!order) {
    return (
      <p className="py-24 text-center text-gray-500">Order not found.</p>
    );
  }

  const d = order.discount;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {justPlaced && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-green-800">
          🎉 Order placed successfully! A confirmation email is on its way.
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
          <p className="text-sm text-gray-500">
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <Badge color={ORDER_STATUS_COLORS[order.status]}>{order.status}</Badge>
      </div>

      <div className="mb-6 rounded-xl border border-gray-200">
        {order.items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between border-b border-gray-100 p-4 last:border-0"
          >
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-gray-500">
                {item.categoryName} · {formatMoney(item.price)} × {item.quantity}
              </p>
            </div>
            <span className="font-medium">{formatMoney(item.lineTotal)}</span>
          </div>
        ))}
      </div>

      <div className="mb-6 rounded-xl border border-gray-200 p-5">
        <h2 className="mb-3 font-semibold">Discount breakdown</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span>{formatMoney(d.subtotal)}</span>
          </div>
          {d.appliedRules.map((rule, idx) => (
            <div key={idx} className="flex justify-between text-green-700">
              <span>{rule.name}</span>
              <span>−{rule.percent}%</span>
            </div>
          ))}
          {d.capPercent !== null && d.totalPercent > d.capPercent && (
            <div className="flex justify-between text-amber-700">
              <span>Capped at {d.capPercent}%</span>
              <span>
                ({d.totalPercent}% → {d.appliedPercent}%)
              </span>
            </div>
          )}
          <div className="flex justify-between border-t border-gray-200 pt-2">
            <span className="text-gray-600">
              Discount ({d.appliedPercent}%)
            </span>
            <span className="text-green-700">−{formatMoney(d.discountAmount)}</span>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-semibold">
            <span>Paid</span>
            <span>{formatMoney(d.payable)}</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 p-5 text-sm">
        <h2 className="mb-2 font-semibold">Shipping to</h2>
        <p>{order.shippingAddress.fullName} · {order.shippingAddress.phone}</p>
        <p className="text-gray-600">
          {order.shippingAddress.line1}, {order.shippingAddress.city},{' '}
          {order.shippingAddress.state} {order.shippingAddress.postalCode}
        </p>
      </div>

      <Link to="/orders" className="mt-6 block text-sm underline">
        ← All orders
      </Link>
    </div>
  );
}
