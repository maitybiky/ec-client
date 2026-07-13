import { ProductCatalog } from '@/widgets/product-catalog';

export function ShopPage() {
  return (
    <div className="mx-auto max-w-6xl px-3 py-8 sm:px-4">
      <h1 className="mb-1 text-3xl font-bold tracking-tight">Shop</h1>
      <p className="mb-6 text-sm text-muted">
        Bigger carts unlock bigger discounts 
      </p>
      <ProductCatalog />
    </div>
  );
}
