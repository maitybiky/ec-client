export function Spinner({ className = '' }) {
  return (
    <span
      className={`inline-block h-5 w-5 animate-spin rounded-full border-2 border-line border-t-ink ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}
