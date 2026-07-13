import { useEffect, useState } from 'react';
import { useHomepage } from '@/entities/homepage';
import { useUpdateHomepage } from '../api/homepageAdminApi.js';
import { ImageField } from './ImageField.jsx';
import { Button, Input, Spinner } from '@/shared/ui';
import { apiErrorMessage } from '@/shared/api';

export function HomepageEditor() {
  const { data: homepage, isLoading } = useHomepage();
  const update = useUpdateHomepage();
  const [draft, setDraft] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (homepage && !draft) setDraft(structuredClone(homepage));
  }, [homepage, draft]);

  if (isLoading || !draft) return <Spinner />;

  const set = (key, value) => {
    setSaved(false);
    setDraft((d) => ({ ...d, [key]: value }));
  };
  const setCard = (index, key, value) => {
    setSaved(false);
    setDraft((d) => {
      const cards = [...(d.cards ?? [])];
      cards[index] = { ...cards[index], [key]: value };
      return { ...d, cards };
    });
  };

  const save = () =>
    update.mutate(draft, { onSuccess: () => setSaved(true) });

  return (
    <div className="max-w-2xl space-y-6">
      <div className="card space-y-4 p-5">
        <h3 className="font-semibold">Hero section</h3>
        <Input
          label="Badge text"
          value={draft.badge}
          onChange={(e) => set('badge', e.target.value)}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Title line 1"
            value={draft.titleLine1}
            onChange={(e) => set('titleLine1', e.target.value)}
          />
          <Input
            label="Title line 2"
            value={draft.titleLine2}
            onChange={(e) => set('titleLine2', e.target.value)}
          />
        </div>
        <Input
          label="Subtitle"
          value={draft.subtitle}
          onChange={(e) => set('subtitle', e.target.value)}
        />
        <Input
          label="Description"
          value={draft.description}
          onChange={(e) => set('description', e.target.value)}
        />
        <Input
          label="Button text"
          value={draft.ctaText}
          onChange={(e) => set('ctaText', e.target.value)}
        />
        <ImageField
          label="Hero image"
          value={draft.heroImage}
          onChange={(v) => set('heroImage', v)}
        />
      </div>

      {[0, 1].map((i) => (
        <div key={i} className="card space-y-4 p-5">
          <h3 className="font-semibold">Promo card {i + 1}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Title"
              value={draft.cards?.[i]?.title ?? ''}
              onChange={(e) => setCard(i, 'title', e.target.value)}
            />
            <Input
              label="Subtitle"
              value={draft.cards?.[i]?.subtitle ?? ''}
              onChange={(e) => setCard(i, 'subtitle', e.target.value)}
            />
          </div>
          <ImageField
            label="Card image"
            value={draft.cards?.[i]?.image ?? ''}
            onChange={(v) => setCard(i, 'image', v)}
          />
        </div>
      ))}

      {update.isError && (
        <p className="text-sm text-red-500">{apiErrorMessage(update.error)}</p>
      )}

      {/* Sticky so "Save" stays reachable from any scroll position */}
      <div className="sticky bottom-0 z-10 -mx-2 flex items-center gap-3 border-t border-line bg-surface/90 px-2 py-3 backdrop-blur">
        <Button variant="accent" onClick={save} disabled={update.isPending}>
          {update.isPending ? <Spinner className="h-4 w-4" /> : 'Save homepage'}
        </Button>
        {saved && <span className="text-sm text-green-600">✓ Saved — refresh the homepage to see it</span>}
      </div>
    </div>
  );
}
