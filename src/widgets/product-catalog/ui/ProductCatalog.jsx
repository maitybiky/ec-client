import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useInfiniteProducts, ProductCard } from '@/entities/product';
import { useCategories } from '@/entities/category';
import { AddToCartButton } from '@/features/add-to-cart';
import { useDebounce } from '@/shared/lib/useDebounce.js';
import { Spinner } from '@/shared/ui';

export function ProductCatalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchDraft, setSearchDraft] = useState(searchParams.get('search') ?? '');
  const debouncedSearch = useDebounce(searchDraft, 350);

  const category = searchParams.get('category') ?? '';
  const sort = searchParams.get('sort') ?? 'newest';

  // Keep the URL shareable as filters change.
  useEffect(() => {
    const params = {};
    if (category) params.category = category;
    if (debouncedSearch) params.search = debouncedSearch;
    if (sort !== 'newest') params.sort = sort;
    setSearchParams(params, { replace: true });
  }, [category, debouncedSearch, sort, setSearchParams]);

  const set = (patch) => {
    const params = {};
    const next = { category, search: debouncedSearch, sort, ...patch };
    if (next.category) params.category = next.category;
    if (next.search) params.search = next.search;
    if (next.sort !== 'newest') params.sort = next.sort;
    setSearchParams(params, { replace: true });
  };

  const { data: categories } = useCategories();
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteProducts({
    ...(category && { category }),
    ...(debouncedSearch && { search: debouncedSearch }),
    sort,
    limit: 12,
  });

  // Infinite scroll — IntersectionObserver, with a scroll-position fallback
  // for webviews where observer callbacks are throttled or broken.
  const sentinelRef = useRef(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasNextPage) return undefined;

    const loadMore = () => {
      if (hasNextPage && !isFetchingNextPage) fetchNextPage();
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: '600px' },
    );
    observer.observe(el);

    const onScroll = () => {
      if (window.innerHeight + window.scrollY >= el.offsetTop - 600) loadMore();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // short first page — load more immediately if sentinel is near

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const products = data?.pages.flatMap((p) => p.products) ?? [];
  const total = data?.pages[0]?.pagination.total ?? 0;

  const chip = (active) =>
    `whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
      active
        ? 'bg-ink text-surface'
        : 'bg-surface text-muted border border-line hover:text-ink'
    }`;

  return (
    <div className="space-y-5">
      {/* Search — debounced, no button needed */}
      <div className="relative max-w-xl">
        <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-muted">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        </span>
        <input
          value={searchDraft}
          onChange={(e) => setSearchDraft(e.target.value)}
          placeholder="Search products… "
          aria-label="Search products"
          className="w-full rounded-full border border-line bg-surface py-2.5 pl-11 pr-4 text-sm outline-none transition-shadow placeholder:text-muted focus:ring-2 focus:ring-accent"
        />
      </div>

      {/* Category chips — scrollable on mobile */}
      <div className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 [scrollbar-width:none]">
        <button className={chip(!category)} onClick={() => set({ category: '' })}>
          All
        </button>
        {categories?.map((c) => (
          <button
            key={c._id}
            className={chip(category === c._id)}
            onClick={() => set({ category: c._id })}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Sort + count row */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {total} product{total !== 1 && 's'}
        </p>
        <select
          value={sort}
          onChange={(e) => set({ sort: e.target.value })}
          aria-label="Sort products"
          className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="newest">Newest first</option>
          <option value="price_asc">Price: low → high</option>
          <option value="price_desc">Price: high → low</option>
        </select>
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
      {!isLoading && products.length === 0 && (
        <p className="py-16 text-center text-muted">
          No products found{debouncedSearch && ` for “${debouncedSearch}”`}.
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            actions={<AddToCartButton product={product} />}
          />
        ))}
      </div>

      {/* Infinite-scroll sentinel */}
      <div ref={sentinelRef} className="flex justify-center py-6">
        {isFetchingNextPage && <Spinner />}
        {!hasNextPage && products.length > 0 && (
          <p className="text-sm text-muted">You've seen everything 🎉</p>
        )}
      </div>
    </div>
  );
}
