import { forwardRef } from 'react';

export const Input = forwardRef(function Input(
  { label, error, className = '', ...props },
  ref,
) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1 block text-sm font-medium text-ink">
          {label}
        </span>
      )}
      <input
        ref={ref}
        className={`field ${error ? 'border-red-400' : ''} ${className}`}
        {...props}
      />
      {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
    </label>
  );
});
