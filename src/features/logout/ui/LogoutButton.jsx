import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { http } from '@/shared/api';
import { useUserStore } from '@/entities/user';
import { Button } from '@/shared/ui';

export function LogoutButton() {
  const clear = useUserStore((s) => s.clear);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await http.post('/auth/logout');
    } catch {
      // token may already be expired — clear locally regardless
    }
    clear();
    queryClient.clear();
    navigate('/login');
  };

  return (
    <Button variant="ghost" onClick={handleLogout}>
      Log out
    </Button>
  );
}
