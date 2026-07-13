import { useState } from 'react';
import { useCategories } from '@/entities/category';
import { useCreateCategory, useUpdateCategory } from '../api/categoryAdminApi.js';
import { Button, Input, Badge, Spinner } from '@/shared/ui';
import { apiErrorMessage } from '@/shared/api';

export function CategoryManager() {
  const { data: categories, isLoading } = useCategories({ includeInactive: true });
  const create = useCreateCategory();
  const update = useUpdateCategory();
  const [name, setName] = useState('');

  const handleCreate = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    create.mutate({ name: name.trim() }, { onSuccess: () => setName('') });
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="max-w-2xl space-y-6">
      <form onSubmit={handleCreate} className="flex items-end gap-3">
        <div className="flex-1">
          <Input
            label="New category"
            placeholder="e.g. Books"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={create.isPending}>
          Add
        </Button>
      </form>
      {create.isError && (
        <p className="text-sm text-red-600">{apiErrorMessage(create.error)}</p>
      )}

      <div className="divide-y divide-gray-100 rounded-xl border border-gray-200">
        {categories?.map((cat) => (
          <div key={cat._id} className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <span className="font-medium">{cat.name}</span>
              <Badge color={cat.isActive ? 'green' : 'gray'}>
                {cat.isActive ? 'active' : 'disabled'}
              </Badge>
            </div>
            <Button
              variant="secondary"
              disabled={update.isPending}
              onClick={() =>
                update.mutate({ id: cat._id, isActive: !cat.isActive })
              }
            >
              {cat.isActive ? 'Disable' : 'Enable'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
