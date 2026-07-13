import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useUserStore, selectIsAdmin } from '@/entities/user';
import { useCart } from '@/entities/cart';
import { LogoutButton } from '@/features/logout';
import { SearchBar } from '@/features/product-search';
import { useTheme } from '@/shared/lib/theme.js';

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-2 text-sm transition-transform hover:scale-105"
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}

export function Header() {
  const user = useUserStore((s) => s.user);
  const isAdmin = useUserStore(selectIsAdmin);
  const { data: cart } = useCart({ enabled: Boolean(user) });
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  const closeSearch = () => setSearchOpen(false);

  const itemCount = cart?.items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

  const navLinkClass = ({ isActive }) =>
    `rounded-full px-3.5 py-1.5 text-sm transition-colors ${
      isActive
        ? 'bg-ink text-surface font-medium'
        : 'text-muted hover:text-ink'
    }`;

  const links = (
    <>
      <NavLink to="/" className={navLinkClass} end onClick={() => setMenuOpen(false)}>
        Home
      </NavLink>
      <NavLink to="/shop" className={navLinkClass} onClick={() => setMenuOpen(false)}>
        Shop
      </NavLink>
      {user && (
        <>
          <NavLink to="/orders" className={navLinkClass} onClick={() => setMenuOpen(false)}>
            Orders
          </NavLink>
        </>
      )}
      {isAdmin && (
        <NavLink to="/admin" className={navLinkClass} onClick={() => setMenuOpen(false)}>
          Admin
        </NavLink>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-20 px-3 pt-3 sm:px-4">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-full border border-line bg-surface/80 px-4 py-2.5 shadow-soft backdrop-blur-md">
        {/* Regular pill content — fades out while the mobile search is expanded */}
        <div
          className={`flex min-w-0 flex-1 items-center justify-between gap-3 transition-opacity duration-200 ${
            searchOpen ? 'pointer-events-none opacity-0' : 'opacity-100'
          }`}
        >
          <Link to="/" className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-base text-accent-ink">
              e
            </span>
            <span className="hidden sm:inline">ecom.</span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">{links}</nav>

          <SearchBar className="hidden w-56 md:block xl:w-72" />

          <div className="flex items-center gap-2">
            <button
              className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-2 text-muted transition-transform hover:scale-105 md:hidden"
              onClick={() => {
                setMenuOpen(false);
                setSearchOpen(true);
              }}
              aria-label="Search"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </button>

            <ThemeToggle />

            {user && (
              <Link
                to="/cart"
                aria-label="Cart"
                className="relative flex h-9 w-9 items-center justify-center rounded-full bg-surface-2 text-sm transition-transform hover:scale-105"
              >
                🛒
                {itemCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-ink">
                    {itemCount}
                  </span>
                )}
              </Link>
            )}

            {user ? (
              <div className="hidden items-center gap-1 md:flex">
                <span className="max-w-28 truncate rounded-full bg-surface-2 px-3 py-1.5 text-sm text-muted">
                  {user.name}
                </span>
                <LogoutButton />
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden rounded-full bg-ink px-4 py-1.5 text-sm font-medium text-surface hover:opacity-85 md:inline-block"
              >
                Log in
              </Link>
            )}

            <button
              className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-2 lg:hidden"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menu"
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile search — expands over the pill from the search icon */}
        <div
          className={`absolute inset-y-0 left-3 right-3 z-10 flex origin-right items-center gap-2 transition-all duration-300 ease-out md:hidden ${
            searchOpen
              ? 'scale-x-100 opacity-100'
              : 'pointer-events-none scale-x-90 opacity-0'
          }`}
          onKeyDown={(e) => e.key === 'Escape' && closeSearch()}
        >
          <SearchBar className="min-w-0 flex-1" inputRef={searchInputRef} onNavigate={closeSearch} />
          <button
            onClick={closeSearch}
            aria-label="Close search"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-2 text-sm text-muted"
          >
            ✕
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="mx-auto mt-2 max-w-6xl rounded-3xl border border-line bg-surface p-4 shadow-lift lg:hidden">
          <nav className="flex flex-col gap-1">{links}</nav>
          <div className="mt-3 border-t border-line pt-3">
            {user ? (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">{user.name}</span>
                <LogoutButton />
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="block rounded-full bg-ink px-4 py-2 text-center text-sm font-medium text-surface"
              >
                Log in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
