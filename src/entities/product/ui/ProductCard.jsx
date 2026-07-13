import { Link } from 'react-router-dom';
import { formatMoney } from '@/shared/lib/money.js';
import { Badge } from '@/shared/ui';

export function ProductCard({ product, actions }) {
  const image = product.images?.[0]?.url;
  const id = product._id ?? product.id;

  return (
    <div className="card group flex flex-col overflow-hidden shadow-soft transition-shadow hover:shadow-lift">
      <Link to={`/products/${id}`} className="relative block overflow-hidden">
        <div className="flex h-40 items-center justify-center bg-surface-2 sm:h-48">
          {image ? (
            <img
              src={image}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <span className="text-4xl opacity-30">🛍️</span>
          )}
        </div>
        {product.category?.name && (
          <span className="absolute left-3 top-3">
            <Badge>{product.category.name}</Badge>
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-3.5 sm:p-4">
        <Link
          to={`/products/${id}`}
          className="line-clamp-1 text-sm font-semibold hover:underline sm:text-base"
        >
          {product.name}
        </Link>
        <div className="flex items-baseline justify-between">
          <p className="text-base font-bold sm:text-lg">
            {formatMoney(product.price)}
          </p>
          <p className="text-xs text-muted">
            {product.stock > 0 ? `${product.stock} left` : 'Out of stock'}
          </p>
        </div>
        {actions && <div className="mt-2">{actions}</div>}
      </div>
    </div>
  );
}
