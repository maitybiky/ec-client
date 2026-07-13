import { useState } from 'react';
import { useProducts } from '@/entities/product';
import { useDeleteProduct } from '../api/productAdminApi.js';
import { ProductForm } from './ProductForm.jsx';
import { Button, Badge, Spinner } from '@/shared/ui';
import { formatMoney } from '@/shared/lib/money.js';

export function ProductManager() {
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null); // null | 'new' | product
  const { data, isLoading } = useProducts({
    page,
    limit: 10,
    includeInactive: 'true',
  });
  const deleteProduct = useDeleteProduct();

  if (isLoading) return <Spinner />;

  if (editing) {
    return (
      <div className="max-w-xl">
        <h2 className="mb-4 text-lg font-semibold">
          {editing === 'new' ? 'New product' : `Edit: ${editing.name}`}
        </h2>
        <ProductForm
          product={editing === 'new' ? null : editing}
          onDone={() => setEditing(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Button onClick={() => setEditing('new')}>+ New product</Button>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="p-3">Product</th>
              <th className="p-3">Category</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Status</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data?.products.map((p) => (
              <tr key={p._id}>
                <td className="p-3 font-medium">{p.name}</td>
                <td className="p-3">{p.category?.name}</td>
                <td className="p-3">{formatMoney(p.price)}</td>
                <td className="p-3">{p.stock}</td>
                <td className="p-3">
                  <Badge color={p.status === 'active' ? 'green' : 'gray'}>
                    {p.status}
                  </Badge>
                </td>
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => setEditing(p)}>
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      disabled={deleteProduct.isPending}
                      onClick={() => {
                        if (window.confirm(`Delete "${p.name}"?`)) {
                          deleteProduct.mutate({ id: p._id });
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data && data.pagination.totalPages > 1 && (
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
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
