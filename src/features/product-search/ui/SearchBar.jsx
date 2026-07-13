import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductSearch } from '@/entities/product';
import { useDebounce } from '@/shared/lib/useDebounce.js';
import { formatMoney } from '@/shared/lib/money.js';
import { Spinner } from '@/shared/ui';

/**
 * Debounced typeahead — results appear as you type, no search button.
 * Keyboard: ↑/↓ to move, Enter to open, Esc to close.
 */
export function SearchBar({ className = '', onNavigate, inputRef }) {
  const navigate = useNavigate();
  const [term, setTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const boxRef = useRef(null);

  const debounced = useDebounce(term, 300);
  const { data: results = [], isFetching } = useProductSearch(debounced);

  // Close when clicking outside.
  useEffect(() => {
    const onClick = (e) => {
      if (!boxRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const go = (product) => {
    setOpen(false);
    setTerm('');
    onNavigate?.();
    navigate(`/products/${product._id}`);
  };

  const goToShop = () => {
    setOpen(false);
    onNavigate?.();
    navigate(`/shop?search=${encodeURIComponent(term.trim())}`);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Escape') return setOpen(false);
    if (!results.length && e.key === 'Enter' && term.trim()) return goToShop();
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (active >= 0 && results[active]) go(results[active]);
      else if (term.trim()) goToShop();
    }
  };

  const showDropdown = open && debounced.trim().length >= 2;

  return (
    <div ref={boxRef} className={`relative ${className}`}>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-muted">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        </span>
        <input
          ref={inputRef}
          value={term}
          onChange={(e) => {
            setTerm(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search products…"
          aria-label="Search products"
          className="w-full rounded-full border border-line bg-surface-2/60 py-2 pl-9 pr-9 text-sm text-ink outline-none transition-all placeholder:text-muted focus:border-transparent focus:bg-surface focus:ring-2 focus:ring-accent"
        />
        {isFetching && (
          <span className="absolute inset-y-0 right-3 flex items-center">
            <Spinner className="h-3.5 w-3.5 border" />
          </span>
        )}
      </div>

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-line bg-surface shadow-lift">
          {results.length === 0 && !isFetching ? (
            <p className="px-4 py-6 text-center text-sm text-muted">
              No products match “{debounced}”
            </p>
          ) : (
            <ul>
              {results.map((p, i) => (
                <li key={p._id}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(p)}
                    className={`flex w-full items-center gap-3 px-3 py-2.5 text-left ${
                      active === i ? 'bg-surface-2' : ''
                    }`}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-2">
                      {p.images?.[0]?.url ? (
                        <img
                          src={p.images[0].url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        '🛍️'
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {p.name}
                      </span>
                      <span className="block text-xs text-muted">
                        {p.category?.name}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-semibold">
                      {formatMoney(p.price)}
                    </span>
                  </button>
                </li>
              ))}
              {term.trim() && (
                <li className="border-t border-line">
                  <button
                    type="button"
                    onClick={goToShop}
                    className="w-full px-4 py-2.5 text-center text-sm font-medium text-muted hover:bg-surface-2 hover:text-ink"
                  >
                    See all results for “{term.trim()}” →
                  </button>
                </li>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
