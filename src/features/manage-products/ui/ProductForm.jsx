import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCategories } from '@/entities/category';
import { useCreateProduct, useUpdateProduct } from '../api/productAdminApi.js';
import { Button, Input, Select, Spinner } from '@/shared/ui';
import { apiErrorMessage } from '@/shared/api';

const productSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be ≥ 0'),
  category: z.string().min(1, 'Pick a category'),
  stock: z.coerce.number().int().min(0, 'Stock must be ≥ 0'),
  status: z.enum(['active', 'inactive']),
});

export function ProductForm({ product, onDone }) {
  const isEdit = Boolean(product);
  const { data: categories } = useCategories();
  const create = useCreateProduct();
  const update = useUpdateProduct();
  const mutation = isEdit ? update : create;

  const [files, setFiles] = useState([]);

  // Live previews for newly selected files (revoked on change/unmount).
  const previews = useMemo(
    () => files.map((f) => ({ name: f.name, url: URL.createObjectURL(f) })),
    [files],
  );
  useEffect(
    () => () => previews.forEach((p) => URL.revokeObjectURL(p.url)),
    [previews],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: isEdit
      ? {
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category?._id ?? product.category,
          stock: product.stock,
          status: product.status,
        }
      : { status: 'active', stock: 0 },
  });

  const onSubmit = (values) => {
    const payload = { ...values, images: files };
    if (isEdit) payload.id = product._id;
    mutation.mutate(payload, { onSuccess: () => onDone?.() });
  };

  const removeNewFile = (index) =>
    setFiles((prev) => prev.filter((_, i) => i !== index));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Name" error={errors.name?.message} {...register('name')} />
      <Input
        label="Description"
        error={errors.description?.message}
        {...register('description')}
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Price (₹)"
          type="number"
          step="0.01"
          min="0"
          error={errors.price?.message}
          {...register('price')}
        />
        <Input
          label="Stock"
          type="number"
          min="0"
          error={errors.stock?.message}
          {...register('stock')}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Category"
          error={errors.category?.message}
          {...register('category')}
        >
          <option value="">Select…</option>
          {categories?.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select label="Status" {...register('status')}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </Select>
      </div>

      {isEdit && product.images?.length > 0 && (
        <div>
          <span className="mb-1 block text-sm font-medium text-gray-700">
            Current images
          </span>
          <div className="flex flex-wrap gap-2">
            {product.images.map((img) => (
              <img
                key={img.key}
                src={img.url}
                alt=""
                className="h-20 w-20 rounded-lg border border-gray-200 object-cover"
              />
            ))}
          </div>
        </div>
      )}

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-gray-700">
          {isEdit ? 'Add images' : 'Images'}
        </span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-900 file:px-3 file:py-2 file:text-sm file:text-white"
        />
      </label>

      {previews.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {previews.map((p, i) => (
            <div key={p.url} className="relative">
              <img
                src={p.url}
                alt={p.name}
                className="h-20 w-20 rounded-lg border border-gray-200 object-cover"
              />
              <button
                type="button"
                aria-label={`Remove ${p.name}`}
                onClick={() => removeNewFile(i)}
                className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-xs text-white"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {mutation.isError && (
        <p className="text-sm text-red-600">{apiErrorMessage(mutation.error)}</p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? (
            <Spinner className="h-4 w-4" />
          ) : isEdit ? (
            'Save changes'
          ) : (
            'Create product'
          )}
        </Button>
        {onDone && (
          <Button variant="secondary" onClick={() => onDone()}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
