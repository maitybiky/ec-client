import { forwardRef, useState } from 'react';

export const PasswordInput = forwardRef(function PasswordInput(
  { label, error, className = '', ...props },
  ref,
) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="block">
      {label && (
        <span className="mb-1 block text-sm font-medium text-ink">
          {label}
        </span>
      )}
      <div className="relative">
        <input
          ref={ref}
          type={visible ? 'text' : 'password'}
          className={`field pr-10 ${error ? 'border-red-400' : ''} ${className}`}
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label={visible ? 'Hide password' : 'Show password'}
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted hover:text-ink"
        >
          {visible ? '🙈' : '👁️'}
        </button>
      </div>
      {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
    </label>
  );
});
