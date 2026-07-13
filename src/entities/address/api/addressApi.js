import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { http } from '@/shared/api';

export const addressKeys = { all: ['addresses'] };

export function useAddresses() {
  return useQuery({
    queryKey: addressKeys.all,
    queryFn: async () => {
      const res = await http.get('/addresses');
      return res.data.data.addresses;
    },
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }) => {
      await http.delete(`/addresses/${id}`);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: addressKeys.all }),
  });
}
