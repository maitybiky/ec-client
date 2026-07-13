import { Outlet } from 'react-router-dom';
import { Header } from '@/widgets/header';

export function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="mt-10 border-t border-line py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-sm text-muted sm:flex-row">
          <p className="flex items-center gap-2 font-semibold text-ink">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs text-accent-ink">
              e
            </span>
            ecom.
          </p>
          <p>  Bigger carts, bigger savings</p>
          <p>© {new Date().getFullYear()} ecom store</p>
        </div>
      </footer>
    </div>
  );
}
