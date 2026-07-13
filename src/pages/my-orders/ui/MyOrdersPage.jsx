import { Link } from 'react-router-dom';
import { useMyOrders, ORDER_STATUS_COLORS } from '@/entities/order';
import { Badge, Spinner } from '@/shared/ui';
import { formatMoney } from '@/shared/lib/money.js';

export function MyOrdersPage() {
  const { data, isLoading } = useMyOrders();

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  const orders = data?.orders ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">My orders</h1>

      {orders.length === 0 ? (
        <p className="py-16 text-center text-gray-500">No orders yet.</p>
      ) : (
        <div className="divide-y divide-gray-100 rounded-xl border border-gray-200">
          {orders.map((order) => (
            <Link
              key={order._id}
              to={`/orders/${order._id}`}
              className="flex items-center justify-between gap-4 p-4 hover:bg-gray-50"
            >
              <div>
                <p className="font-medium">{order.orderNumber}</p>
                <p className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleString()} ·{' '}
                  {order.items.length} item(s)
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-semibold">
                  {formatMoney(order.discount.payable)}
                </span>
                <Badge color={ORDER_STATUS_COLORS[order.status]}>
                  {order.status}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
