import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout.jsx';
import { RequireAuth, RequireAdmin, RedirectIfAuthed } from './guards.jsx';
import { HomePage } from '@/pages/home';
import { ShopPage } from '@/pages/shop';
import { ProductDetailsPage } from '@/pages/product-details';
import { LoginPage } from '@/pages/login';
import { RegisterPage } from '@/pages/register';
import { CartPage } from '@/pages/cart';
import { CheckoutPage } from '@/pages/checkout';
import { MyOrdersPage } from '@/pages/my-orders';
import { OrderDetailsPage } from '@/pages/order-details';
import { AdminPage } from '@/pages/admin';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/products/:id" element={<ProductDetailsPage />} />

          <Route element={<RedirectIfAuthed />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          <Route element={<RequireAuth />}>
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orders" element={<MyOrdersPage />} />
            <Route path="/orders/:id" element={<OrderDetailsPage />} />

            <Route element={<RequireAdmin />}>
              <Route path="/admin/*" element={<AdminPage />} />
            </Route>
          </Route>

          <Route
            path="*"
            element={
              <p className="py-24 text-center text-gray-500">Page not found.</p>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
