import { useQuery } from '@tanstack/react-query';
import { http } from '@/shared/api';

export const discountRuleKeys = { all: ['discount-rules'] };

export function useDiscountRules() {
  return useQuery({
    queryKey: discountRuleKeys.all,
    queryFn: async () => {
      const res = await http.get('/discounts');
      return res.data.data.rules;
    },
  });
}

/** Human labels for the built-in rule types (admin UI). */
export const RULE_TYPE_LABELS = {
  base_cart: 'Base Cart Discount',
  quantity_threshold: 'Quantity Threshold Bonus',
  multi_category: 'Multi-Category Bonus',
  max_cap: 'Maximum Discount Cap',
};
