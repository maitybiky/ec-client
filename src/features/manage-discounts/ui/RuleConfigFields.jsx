import { Input } from '@/shared/ui';

/** Per-type config editors. Values are kept as strings while editing. */
const FIELDS_BY_TYPE = {
  base_cart: [{ key: 'percent', label: 'Discount %' }],
  quantity_threshold: [
    { key: 'threshold', label: 'Every N items' },
    { key: 'percentPerThreshold', label: 'Bonus % per threshold' },
  ],
  multi_category: [
    { key: 'minCategories', label: 'Minimum categories' },
    { key: 'percent', label: 'Bonus %' },
  ],
  max_cap: [{ key: 'maxPercent', label: 'Maximum total discount %' }],
};

export function RuleConfigFields({ type, draft, onChange }) {
  const fields = FIELDS_BY_TYPE[type] ?? [];
  return (
    <div className="grid grid-cols-2 gap-3">
      {fields.map(({ key, label }) => (
        <Input
          key={key}
          label={label}
          type="number"
          step="0.5"
          min="0"
          value={draft[key] ?? ''}
          onChange={(e) => onChange({ ...draft, [key]: e.target.value })}
        />
      ))}
    </div>
  );
}

export function parseConfig(type, draft) {
  const fields = FIELDS_BY_TYPE[type] ?? [];
  const config = {};
  for (const { key } of fields) {
    config[key] = Number(draft[key]);
    if (Number.isNaN(config[key])) return null;
  }
  // Integer fields
  if (type === 'quantity_threshold') config.threshold = Math.round(config.threshold);
  if (type === 'multi_category') config.minCategories = Math.round(config.minCategories);
  return config;
}
