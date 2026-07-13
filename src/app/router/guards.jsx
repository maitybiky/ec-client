import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useUserStore, selectIsAdmin } from '@/entities/user';

export function RequireAuth() {
  const user = useUserStore((s) => s.user);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return <Outlet />;
}

export function RequireAdmin() {
  const isAdmin = useUserStore(selectIsAdmin);
  if (!isAdmin) return <Navigate to="/" replace />;
  return <Outlet />;
}

export function RedirectIfAuthed() {
  const user = useUserStore((s) => s.user);
  if (user) return <Navigate to="/" replace />;
  return <Outlet />;
}
