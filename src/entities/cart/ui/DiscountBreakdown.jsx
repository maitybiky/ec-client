import { formatMoney } from '@/shared/lib/money.js';

/** Renders subtotal → applied discount rules → cap → payable. */
export function DiscountBreakdown({ cart }) {
  if (!cart) return null;
  const capped = cart.capPercent !== null && cart.totalPercent > cart.capPercent;

  return (
    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-600">Subtotal</span>
        <span className="font-medium">{formatMoney(cart.subtotal)}</span>
      </div>

      {cart.appliedRules.map((rule) => (
        <div key={rule.type + rule.name} className="flex justify-between text-green-700">
          <span>{rule.name}</span>
          <span>−{rule.percent}%</span>
        </div>
      ))}

      {capped && (
        <div className="flex justify-between text-amber-700">
          <span>Discount capped at {cart.capPercent}%</span>
          <span>({cart.totalPercent}% → {cart.appliedPercent}%)</span>
        </div>
      )}

      {cart.appliedPercent > 0 && (
        <div className="flex justify-between border-t border-gray-200 pt-2 text-green-700">
          <span>Total discount ({cart.appliedPercent}%)</span>
          <span>−{formatMoney(cart.discountAmount)}</span>
        </div>
      )}

      <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-semibold">
        <span>Payable</span>
        <span>{formatMoney(cart.payable)}</span>
      </div>
    </div>
  );
}
