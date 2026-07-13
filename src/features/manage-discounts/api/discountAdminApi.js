import { useMutation, useQueryClient } from '@tanstack/react-query';
import { http } from '@/shared/api';
import { discountRuleKeys } from '@/entities/discount-rule';

export function useUpdateDiscountRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const res = await http.patch(`/discounts/${id}`, updates);
      return res.data.data.rule;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: discountRuleKeys.all }),
  });
}
