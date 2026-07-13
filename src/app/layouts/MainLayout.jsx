import { Outlet } from 'react-router-dom';
import { Header } from '@/widgets/header';

export function MainLayout() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
