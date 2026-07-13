/**
 * FSD boundary checks — run via `npm run arch:check`.
 *
 * Layer order (imports flow downward only):
 *   app → pages → widgets → features → entities → shared
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = path.join(path.dirname(fileURLToPath(import.meta.url)), 'src');
const LAYERS = ['app', 'pages', 'widgets', 'features', 'entities', 'shared'];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return /\.(js|jsx)$/.test(entry.name) ? [full] : [];
  });
}

function importsOf(file) {
  const source = fs.readFileSync(file, 'utf8');
  const specs = [];
  for (const re of [
    /import\s+[^'"]*from\s+['"]([^'"]+)['"]/g,
    /import\s+['"]([^'"]+)['"]/g,
  ]) {
    for (const m of source.matchAll(re)) specs.push(m[1]);
  }
  return { source, specs };
}

const files = walk(SRC);
const rel = (f) => path.relative(SRC, f).replaceAll('\\', '/');
const layerOf = (p) => LAYERS.find((l) => p === l || p.startsWith(`${l}/`));

test('imports flow downward only (no upward layer imports)', () => {
  const violations = [];
  for (const file of files) {
    const fromLayer = layerOf(rel(file));
    if (!fromLayer) continue;
    const { specs } = importsOf(file);
    for (const spec of specs) {
      if (!spec.startsWith('@/')) continue;
      const toLayer = layerOf(spec.slice(2));
      if (!toLayer) continue;
      const from = LAYERS.indexOf(fromLayer);
      const to = LAYERS.indexOf(toLayer);
      const sameLayerCrossSlice =
        from === to && fromLayer !== 'shared' && fromLayer !== 'app';
      if (to < from || sameLayerCrossSlice) {
        violations.push(`${rel(file)} (${fromLayer}) → "${spec}" (${toLayer})`);
      }
    }
  }
  assert.deepEqual(violations, [], `Upward/cross imports:\n${violations.join('\n')}`);
});

test('no deep imports — slice imports go through the public API', () => {
  const violations = [];
  for (const file of files) {
    const fromRel = rel(file);
    const { specs } = importsOf(file);
    for (const spec of specs) {
      if (!spec.startsWith('@/')) continue;
      const target = spec.slice(2);
      const layer = layerOf(target);
      if (!layer || layer === 'shared' || layer === 'app') continue;
      const fromSlice = fromRel.split('/').slice(0, 2).join('/');
      const parts = target.split('/');
      const toSlice = parts.slice(0, 2).join('/');
      // Deep import = reaching past <layer>/<slice> from outside that slice.
      if (parts.length > 2 && toSlice !== fromSlice) {
        violations.push(`${fromRel} → "${spec}"`);
      }
    }
  }
  assert.deepEqual(violations, [], `Deep imports:\n${violations.join('\n')}`);
});

test('import.meta.env is only read in shared/config/env.js', () => {
  const violations = [];
  for (const file of files) {
    const r = rel(file);
    if (r === 'shared/config/env.js') continue;
    const { source } = importsOf(file);
    if (/import\.meta\.env/.test(source)) violations.push(r);
  }
  assert.deepEqual(violations, [], `import.meta.env misuse:\n${violations.join('\n')}`);
});

test('axios is only used in api segments or shared/api', () => {
  const violations = [];
  for (const file of files) {
    const r = rel(file);
    const allowed = r.startsWith('shared/api/') || /\/api\//.test(r);
    if (allowed) continue;
    const { specs } = importsOf(file);
    if (specs.includes('axios')) violations.push(r);
  }
  assert.deepEqual(violations, [], `axios outside api layers:\n${violations.join('\n')}`);
});
