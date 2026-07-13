import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts, ProductCard } from '@/entities/product';
import { useCategories } from '@/entities/category';
import { AddToCartButton } from '@/features/add-to-cart';
import { Button, Input, Select, Spinner } from '@/shared/ui';

export function ProductCatalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchDraft, setSearchDraft] = useState(searchParams.get('search') ?? '');

  const filters = {
    category: searchParams.get('category') ?? '',
    search: searchParams.get('search') ?? '',
    sort: searchParams.get('sort') ?? 'newest',
    page: Number(searchParams.get('page') ?? 1),
  };

  const set = (patch) => {
    const next = { ...filters, ...patch, page: patch.page ?? 1 };
    const params = {};
    if (next.category) params.category = next.category;
    if (next.search) params.search = next.search;
    if (next.sort !== 'newest') params.sort = next.sort;
    if (next.page > 1) params.page = String(next.page);
    setSearchParams(params, { replace: true });
  };

  const { data: categories } = useCategories();
  const { data, isLoading, isError } = useProducts({
    ...(filters.category && { category: filters.category }),
    ...(filters.search && { search: filters.search }),
    sort: filters.sort,
    page: filters.page,
    limit: 12,
  });

  return (
    <div className="space-y-6">
      <div className="card flex flex-wrap items-end gap-3 p-4 shadow-soft">
        <form
          className="flex min-w-full flex-1 items-end gap-2 sm:min-w-64"
          onSubmit={(e) => {
            e.preventDefault();
            set({ search: searchDraft });
          }}
        >
          <div className="flex-1">
            <Input
              label="Search"
              placeholder="Search products…"
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
            />
          </div>
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>

        <div className="w-[calc(50%-0.375rem)] sm:w-44">
          <Select
            label="Category"
            value={filters.category}
            onChange={(e) => set({ category: e.target.value })}
          >
            <option value="">All categories</option>
            {categories?.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="w-[calc(50%-0.375rem)] sm:w-44">
          <Select
            label="Sort by"
            value={filters.sort}
            onChange={(e) => set({ sort: e.target.value })}
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: low → high</option>
            <option value="price_desc">Price: high → low</option>
          </Select>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      )}
      {isError && (
        <p className="py-10 text-center text-red-500">
          Failed to load products. Is the API running?
        </p>
      )}

      {data && data.products.length === 0 && (
        <p className="py-10 text-center text-muted">No products found.</p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
        {data?.products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            actions={<AddToCartButton product={product} />}
          />
        ))}
      </div>

      {data && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="secondary"
            disabled={filters.page <= 1}
            onClick={() => set({ page: filters.page - 1 })}
          >
            ← Prev
          </Button>
          <span className="text-sm text-muted">
            Page {data.pagination.page} of {data.pagination.totalPages}
          </span>
          <Button
            variant="secondary"
            disabled={filters.page >= data.pagination.totalPages}
            onClick={() => set({ page: filters.page + 1 })}
          >
            Next →
          </Button>
        </div>
      )}
    </div>
  );
}
