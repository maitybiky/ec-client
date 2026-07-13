const COLORS = {
  gray: 'bg-surface-2 text-muted',
  green: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400',
  red: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400',
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
  accent: 'bg-accent text-accent-ink',
};

export function Badge({ color = 'gray', children }) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${COLORS[color]}`}
    >
      {children}
    </span>
  );
}
