import { useState } from 'react';
import { uploadImage } from '../api/homepageAdminApi.js';
import { Input, Spinner } from '@/shared/ui';

/** URL input + file-upload button + live preview. */
export function ImageField({ label, value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadImage(file);
      onChange(url);
    } catch {
      setError('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Input
            label={label}
            placeholder="https://…"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
        <label className="flex h-9 cursor-pointer items-center rounded-full border border-line bg-surface px-3 text-sm font-medium hover:bg-surface-2">
          {uploading ? <Spinner className="h-4 w-4" /> : '⬆ Upload'}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleFile}
          />
        </label>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {value && (
        <img
          src={value}
          alt="preview"
          className="h-24 w-40 rounded-xl border border-line object-cover"
        />
      )}
    </div>
  );
}
