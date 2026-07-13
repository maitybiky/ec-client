import { Link } from 'react-router-dom';
import { useHomepage } from '@/entities/homepage';
import { useProducts } from '@/entities/product';
import { useCategories } from '@/entities/category';

function PromoCard({ card, tall = false }) {
  if (!card) return null;
  return (
    <Link
      to="/shop"
      className={`card group relative block overflow-hidden shadow-soft transition-shadow hover:shadow-lift ${
        tall ? 'row-span-2' : ''
      }`}
    >
      {card.image && (
        <img
          src={card.image}
          alt={card.title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
      <div className="relative flex h-full flex-col justify-end p-5">
        <p className="text-base font-semibold text-white">{card.title}</p>
        {card.subtitle && (
          <p className="text-sm text-white/75">{card.subtitle}</p>
        )}
      </div>
      <span className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-sm text-black opacity-0 transition-opacity group-hover:opacity-100">
        ↗
      </span>
    </Link>
  );
}

export function Hero() {
  const { data: hp } = useHomepage();
  const { data: productsData } = useProducts({ limit: 3, sort: 'newest' });
  const { data: categories } = useCategories();

  if (!hp) return <div className="h-[60vh]" />;

  const thumbs = productsData?.products ?? [];
  const totalProducts = productsData?.pagination?.total ?? 0;

  return (
    <section className="mx-auto max-w-6xl px-3 py-4 sm:px-4">
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        {/* Main hero card */}
        <div className="card relative overflow-hidden p-6 shadow-soft sm:p-10">
          <div className="relative z-10 max-w-xl">
            {hp.badge && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 py-1.5 text-xs font-medium text-muted">
                ✨ {hp.badge}
              </span>
            )}
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
              {hp.titleLine1}
              <br />
              {hp.titleLine2}
            </h1>

            <div className="mt-6 flex items-start gap-4">
              <span className="hidden select-none text-5xl font-extrabold text-ink/10 sm:block">
                01
              </span>
              <div className="max-w-xs border-l border-line pl-4">
                <p className="text-sm font-semibold">{hp.subtitle}</p>
                <p className="mt-1 text-sm text-muted">{hp.description}</p>
              </div>
            </div>

            <Link
              to="/shop"
              className="mt-8 inline-flex items-center gap-3 rounded-full bg-accent py-2 pl-6 pr-2 text-sm font-semibold text-accent-ink transition-transform hover:scale-[1.02]"
            >
              {hp.ctaText}
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-surface">
                ↗
              </span>
            </Link>
          </div>

          {hp.heroImage && (
            <>
              <img
                src={hp.heroImage}
                alt=""
                className="pointer-events-none absolute -right-8 top-1/2 hidden w-[46%] max-w-lg -translate-y-1/2 rounded-3xl object-cover opacity-95 lg:block"
              />
              <img
                src={hp.heroImage}
                alt=""
                className="mt-8 block w-full rounded-3xl object-cover lg:hidden"
              />
            </>
          )}
        </div>

        {/* Side bento column */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-1 lg:grid-rows-[auto_1fr]">
          {/* Categories chips card */}
          <div className="card col-span-2 p-5 shadow-soft lg:col-span-1">
            <p className="mb-3 text-sm font-semibold">Shop by category</p>
            <div className="flex flex-wrap gap-2">
              {(categories ?? []).slice(0, 6).map((c) => (
                <Link
                  key={c._id}
                  to={`/shop?category=${c._id}`}
                  className="rounded-full bg-surface-2 px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-accent hover:text-accent-ink"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="min-h-44">
            <PromoCard card={hp.cards?.[0]} tall={false} />
          </div>
          <div className="min-h-44">
            <PromoCard card={hp.cards?.[1]} tall={false} />
          </div>
        </div>
      </div>

      {/* Bottom strip */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Link
          to="/shop"
          className="card group flex items-center justify-between p-5 shadow-soft transition-shadow hover:shadow-lift"
        >
          <div>
            <p className="font-semibold">More products</p>
            <p className="text-sm text-muted">{totalProducts}+ items in store</p>
          </div>
          <div className="flex -space-x-3">
            {thumbs.map((p) =>
              p.images?.[0]?.url ? (
                <img
                  key={p._id}
                  src={p.images[0].url}
                  alt={p.name}
                  className="h-12 w-12 rounded-2xl border-2 border-surface object-cover"
                />
              ) : null,
            )}
          </div>
        </Link>

        <div className="card flex items-center justify-between p-5 shadow-soft">
          <div>
            <p className="font-semibold">Dynamic discounts</p>
            <p className="text-sm text-muted">
              Bigger carts unlock bigger savings — up to the configured cap.
            </p>
          </div>
          <span className="rounded-full bg-accent px-3 py-1 text-sm font-bold text-accent-ink">
            %
          </span>
        </div>
      </div>
    </section>
  );
}
