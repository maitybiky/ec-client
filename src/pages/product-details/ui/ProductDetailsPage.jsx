import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProduct } from '@/entities/product';
import { AddToCartButton } from '@/features/add-to-cart';
import { Badge, Spinner, Input } from '@/shared/ui';
import { formatMoney } from '@/shared/lib/money.js';

export function ProductDetailsPage() {
  const { id } = useParams();
  const { data: product, isLoading, isError } = useProduct(id);
  const [quantity, setQuantity] = useState(1);

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }
  if (isError || !product) {
    return (
      <div className="py-24 text-center">
        <p className="text-muted">Product not found.</p>
        <Link to="/" className="text-sm underline">
          Back to shop
        </Link>
      </div>
    );
  }

  const image = product.images?.[0]?.url;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link to="/" className="text-sm text-muted hover:underline">
        ← Back to shop
      </Link>
      <div className="mt-4 grid gap-8 md:grid-cols-2">
        <div className="flex h-80 items-center justify-center overflow-hidden rounded-xl bg-surface-2">
          {image ? (
            <img
              src={image}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-6xl text-muted/40">🛍️</span>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{product.name}</h1>
            {product.category?.name && <Badge>{product.category.name}</Badge>}
          </div>
          <p className="text-2xl font-semibold">{formatMoney(product.price)}</p>
          <p className="text-sm text-muted">{product.description}</p>
          <p className="text-sm text-muted">
            {product.stock > 0
              ? `${product.stock} in stock`
              : 'Currently out of stock'}
          </p>

          {product.stock > 0 && (
            <div className="flex items-end gap-3">
              <div className="w-24">
                <Input
                  label="Qty"
                  type="number"
                  min={1}
                  max={product.stock}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(
                      Math.max(1, Math.min(product.stock, Number(e.target.value) || 1)),
                    )
                  }
                />
              </div>
              <AddToCartButton
                product={product}
                quantity={quantity}
                className="flex-1"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
