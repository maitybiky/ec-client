import { NavLink, Routes, Route, Navigate } from 'react-router-dom';
import { ProductManager } from '@/features/manage-products';
import { CategoryManager } from '@/features/manage-categories';
import { DiscountRulesManager } from '@/features/manage-discounts';
import { OrdersManager } from '@/features/manage-orders';
import { HomepageEditor } from '@/features/manage-homepage';

const TABS = [
  { to: 'products', label: 'Products' },
  { to: 'categories', label: 'Categories' },
  { to: 'discounts', label: 'Discounts' },
  { to: 'orders', label: 'Orders' },
  { to: 'homepage', label: 'Homepage' },
];

export function AdminPage() {
  return (
    <div className="mx-auto max-w-6xl px-3 py-8 sm:px-4">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Admin panel</h1>

      <nav className="mb-6 flex flex-wrap gap-1.5">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-ink text-surface'
                  : 'bg-surface text-muted hover:text-ink border border-line'
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>

      <Routes>
        <Route index element={<Navigate to="products" replace />} />
        <Route path="products" element={<ProductManager />} />
        <Route path="categories" element={<CategoryManager />} />
        <Route path="discounts" element={<DiscountRulesManager />} />
        <Route path="orders" element={<OrdersManager />} />
        <Route path="homepage" element={<HomepageEditor />} />
      </Routes>
    </div>
  );
}
