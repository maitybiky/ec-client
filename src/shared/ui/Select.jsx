import { forwardRef } from 'react';

export const Select = forwardRef(function Select(
  { label, error, children, className = '', ...props },
  ref,
) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1 block text-sm font-medium text-ink">
          {label}
        </span>
      )}
      <select
        ref={ref}
        className={`field appearance-none bg-surface ${error ? 'border-red-400' : ''} ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
    </label>
  );
});
