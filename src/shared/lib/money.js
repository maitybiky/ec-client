export const formatMoney = (n) =>
  `₹${Number(n ?? 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
