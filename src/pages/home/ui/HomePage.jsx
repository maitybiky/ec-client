import { Link } from 'react-router-dom';
import { Hero } from '@/widgets/hero';
import { useProducts, ProductCard } from '@/entities/product';
import { AddToCartButton } from '@/features/add-to-cart';

export function HomePage() {
  const { data } = useProducts({ limit: 8, sort: 'newest' });

  return (
    <div>
      <Hero />

      <section className="mx-auto max-w-6xl px-3 pb-14 pt-6 sm:px-4">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Fresh arrivals</h2>
            <p className="text-sm text-muted">The latest drops in the store</p>
          </div>
          <Link
            to="/shop"
            className="rounded-full border border-line px-4 py-1.5 text-sm font-medium hover:bg-surface-2"
          >
            See all →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {data?.products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              actions={<AddToCartButton product={product} />}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
