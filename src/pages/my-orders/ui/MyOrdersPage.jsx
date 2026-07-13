import { Link } from 'react-router-dom';
import { useMyOrders, ORDER_STATUS_COLORS } from '@/entities/order';
import { useProducts } from '@/entities/product';
import { Badge, Button, Spinner } from '@/shared/ui';
import { formatMoney } from '@/shared/lib/money.js';

const STATUS_LABEL = {
  placed: 'Placed',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

function OrderCard({ order }) {
  const date = new Date(order.createdAt);
  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);
  // Item snapshots don't carry images — resolve a few from the product ids.
  const ids = order.items.slice(0, 4).map((i) => i.product);
  const { data } = useProducts({ limit: 4, ids: ids.join(',') });

  return (
    <Link
      to={`/orders/${order._id}`}
      className="card group block overflow-hidden shadow-soft transition-shadow hover:shadow-lift"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-surface-2/50 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm font-semibold">
            {order.orderNumber}
          </span>
          <Badge color={ORDER_STATUS_COLORS[order.status]}>
            {STATUS_LABEL[order.status] ?? order.status}
          </Badge>
        </div>
        <span className="text-xs text-muted">
          {date.toLocaleDateString(undefined, {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}{' '}
          ·{' '}
          {date.toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>

      <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-5">
        <div className="min-w-0">
          <p className="truncate text-sm text-muted">
            {order.items
              .slice(0, 2)
              .map((i) => i.name)
              .join(', ')}
            {order.items.length > 2 && ` +${order.items.length - 2} more`}
          </p>
          <p className="mt-1 text-xs text-muted">
            {itemCount} item{itemCount !== 1 && 's'}
            {order.discount.appliedPercent > 0 && (
              <span className="ml-2 rounded-full bg-accent/20 px-2 py-0.5 font-medium text-ink">
                {order.discount.appliedPercent}% off
              </span>
            )}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden -space-x-2.5 sm:flex">
            {(data?.products ?? []).slice(0, 3).map((p) =>
              p.images?.[0]?.url ? (
                <img
                  key={p._id}
                  src={p.images[0].url}
                  alt=""
                  className="h-10 w-10 rounded-xl border-2 border-surface object-cover"
                />
              ) : null,
            )}
          </div>
          <div className="text-right">
            <p className="text-base font-bold">
              {formatMoney(order.discount.payable)}
            </p>
            {order.discount.discountAmount > 0 && (
              <p className="text-xs text-muted line-through">
                {formatMoney(order.discount.subtotal)}
              </p>
            )}
          </div>
          <span className="text-muted transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </div>
      </div>
    </Link>
  );
}

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
    <div className="mx-auto max-w-4xl px-3 py-8 sm:px-4">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">My orders</h1>

      {orders.length === 0 ? (
        <div className="card px-6 py-16 text-center shadow-soft">
          <p className="mb-1 text-4xl">📦</p>
          <p className="mb-5 text-muted">
            Nothing here yet — your orders will show up after checkout.
          </p>
          <Link to="/shop">
            <Button variant="accent">Start shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
