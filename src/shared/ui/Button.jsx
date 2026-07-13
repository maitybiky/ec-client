const VARIANTS = {
  primary:
    'bg-ink text-surface hover:opacity-85 disabled:opacity-40',
  accent:
    'bg-accent text-accent-ink hover:brightness-95 disabled:opacity-40 font-semibold',
  secondary:
    'bg-surface text-ink border border-line hover:bg-surface-2 disabled:opacity-40',
  danger:
    'bg-red-600 text-white hover:bg-red-500 disabled:opacity-40',
  ghost:
    'text-ink hover:bg-surface-2 disabled:opacity-40',
};

export function Button({
  variant = 'primary',
  className = '',
  type = 'button',
  children,
  ...props
}) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:active:scale-100 ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
