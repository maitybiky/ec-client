import { useState } from 'react';
import { useDiscountRules } from '@/entities/discount-rule';
import { useUpdateDiscountRule } from '../api/discountAdminApi.js';
import { RuleConfigFields, parseConfig } from './RuleConfigFields.jsx';
import { Button, Badge, Spinner } from '@/shared/ui';
import { apiErrorMessage } from '@/shared/api';

function RuleCard({ rule }) {
  const update = useUpdateDiscountRule();
  const [draft, setDraft] = useState(null); // null = not editing

  const startEdit = () =>
    setDraft(
      Object.fromEntries(
        Object.entries(rule.config).map(([k, v]) => [k, String(v)]),
      ),
    );

  const save = () => {
    const config = parseConfig(rule.type, draft);
    if (!config) return;
    update.mutate(
      { id: rule._id, config },
      { onSuccess: () => setDraft(null) },
    );
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold">{rule.name}</h3>
          <Badge color={rule.isActive ? 'green' : 'gray'}>
            {rule.isActive ? 'active' : 'off'}
          </Badge>
        </div>
        <Button
          variant="secondary"
          disabled={update.isPending}
          onClick={() =>
            update.mutate({ id: rule._id, isActive: !rule.isActive })
          }
        >
          {rule.isActive ? 'Turn off' : 'Turn on'}
        </Button>
      </div>
      <p className="mb-3 text-sm text-gray-500">{rule.description}</p>

      {draft ? (
        <div className="space-y-3">
          <RuleConfigFields type={rule.type} draft={draft} onChange={setDraft} />
          {update.isError && (
            <p className="text-sm text-red-600">{apiErrorMessage(update.error)}</p>
          )}
          <div className="flex gap-2">
            <Button onClick={save} disabled={update.isPending}>
              Save
            </Button>
            <Button variant="secondary" onClick={() => setDraft(null)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <code className="rounded bg-gray-100 px-2 py-1 text-xs">
            {JSON.stringify(rule.config)}
          </code>
          <Button variant="secondary" onClick={startEdit}>
            Edit config
          </Button>
        </div>
      )}
    </div>
  );
}

export function DiscountRulesManager() {
  const { data: rules, isLoading } = useDiscountRules();

  if (isLoading) return <Spinner />;

  return (
    <div className="max-w-2xl space-y-4">
      {rules?.map((rule) => (
        <RuleCard key={rule._id} rule={rule} />
      ))}
      {rules?.length === 0 && (
        <p className="text-gray-500">
          No rules yet — run <code>npm run seed:discounts</code> in the backend.
        </p>
      )}
    </div>
  );
}
