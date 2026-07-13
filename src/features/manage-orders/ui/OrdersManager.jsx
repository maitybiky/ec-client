import { useState } from 'react';
import { useAdminOrders, ORDER_STATUS_COLORS } from '@/entities/order';
import { useUpdateOrderStatus, downloadOrdersCsv } from '../api/orderAdminApi.js';
import { Button, Badge, Select, Spinner } from '@/shared/ui';
import { formatMoney } from '@/shared/lib/money.js';

export function OrdersManager() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminOrders({
    ...(status && { status }),
    page,
    limit: 20,
  });
  const updateStatus = useUpdateOrderStatus();

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div className="w-48">
          <Select
            label="Filter by status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            <option value="placed">Placed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </div>
        <Button
          variant="secondary"
          onClick={() => downloadOrdersCsv({ status: status || undefined })}
        >
          ⬇ Export CSV
        </Button>
      </div>

      {isLoading ? (
        <Spinner />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full text-sm">
            <thead className="bg-surface-2 text-left text-muted">
              <tr>
                <th className="p-3">Order</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Items</th>
                <th className="p-3">Discount</th>
                <th className="p-3">Paid</th>
                <th className="p-3">Status</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data?.orders.map((order) => (
                <tr key={order._id}>
                  <td className="p-3">
                    <p className="font-medium">{order.orderNumber}</p>
                    <p className="text-xs text-muted">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </td>
                  <td className="p-3">
                    <p>{order.user?.name}</p>
                    <p className="text-xs text-muted">{order.user?.email}</p>
                  </td>
                  <td className="p-3 text-xs">
                    {order.items.map((i) => `${i.name} ×${i.quantity}`).join(', ')}
                  </td>
                  <td className="p-3">{order.discount.appliedPercent}%</td>
                  <td className="p-3 font-medium">
                    {formatMoney(order.discount.payable)}
                  </td>
                  <td className="p-3">
                    <Badge color={ORDER_STATUS_COLORS[order.status]}>
                      {order.status}
                    </Badge>
                  </td>
                  <td className="p-3">
                    {order.status === 'placed' && (
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="secondary"
                          disabled={updateStatus.isPending}
                          onClick={() =>
                            updateStatus.mutate({
                              id: order._id,
                              status: 'completed',
                            })
                          }
                        >
                          Complete
                        </Button>
                        <Button
                          variant="danger"
                          disabled={updateStatus.isPending}
                          onClick={() =>
                            updateStatus.mutate({
                              id: order._id,
                              status: 'cancelled',
                            })
                          }
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {data?.orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {data && data.pagination.totalPages > 1 && (
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted">
            Page {page} of {data.pagination.totalPages}
          </span>
          <Button
            variant="secondary"
            disabled={page >= data.pagination.totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
