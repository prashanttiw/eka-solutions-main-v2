// GPU input snapshots from the owner's unchanged globe on 2026-09-06. Expand the
// indexed edges before hashing so buffer reuse cannot hide any visual-data change.
// No browser, network, or additional dependencies: node scripts/test-hero-globe.mjs
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { test } from 'node:test';
import { buildGeometry, CONFIG } from '../src/components/heroGlobeGeometry.js';

const edgeSizes = { pos: 3, perp: 3, side: 1, centroid: 3, ang: 1, which: 1, seed: 1 };
export function geometryDigest(geometry) {
  const hash = createHash('sha256');
  const append = (values) => {
    for (const value of values) assert.ok(Number.isFinite(value), 'Finite GPU attributes');
    hash.update(Buffer.from(new Float32Array(values).buffer));
  };
  for (const key of ['position', 'weight', 'twinkle', 'spark']) append(geometry.specks[key]);
  for (const key of ['pos', 'centroid', 'ang', 'which', 'seed']) append(geometry.clusters.tri[key]);
  const edge = geometry.clusters.edge;
  for (const [key, size] of Object.entries(edgeSizes)) {
    append(edge.index
      ? edge.index.flatMap(i => edge[key].slice(i * size, (i + 1) * size))
      : edge[key]);
  }
  for (const ribbon of geometry.ribbons) {
    for (const key of ['pos', 'across', 'side', 'along', 'index']) append(ribbon[key]);
  }
  for (const key of ['position', 'size', 'phase']) append(geometry.motes[key]);
  return hash.digest('hex');
}

const original = {
  desktop: 'dec033f1edf316ca49db7b63c192948eed62e5388ae907353ed9128a46e3d416',
  tablet: '788c631b90f17d981d6f369a28b24fe4a06af213380a24e34d7105ce5f669fb6',
  mobile: '9c64f20f27fe49b30f5bce6d42aada9ae03fe591917f45c56f5a83a1d5791e1e',
};
for (const [breakpoint, digest] of Object.entries(original)) {
  test(`${breakpoint}: exactly the original particles, currents, triangles and stars`, () => {
    const geometry = buildGeometry(CONFIG.specks[breakpoint], CONFIG.motes[breakpoint]);
    const { edge } = geometry.clusters;
    assert.equal(geometryDigest(geometry), digest);
    assert.equal(edge.index.length % 6, 0, 'Two triangles per edge');
    assert.equal(edge.side.length, edge.index.length * 2 / 3, 'Four shared corners instead of six');
    for (const index of edge.index) {
      assert.ok(Number.isInteger(index) && index >= 0 && index < edge.side.length);
    }
    for (const [key, size] of Object.entries(edgeSizes)) {
      assert.equal(edge[key].length, edge.side.length * size);
    }
  });
}

test('returning across breakpoints preserves the seeded scene', () => {
  const first = geometryDigest(buildGeometry(CONFIG.specks.desktop, CONFIG.motes.desktop));
  buildGeometry(CONFIG.specks.mobile, CONFIG.motes.mobile);
  assert.equal(geometryDigest(buildGeometry(CONFIG.specks.desktop, CONFIG.motes.desktop)), first);
});
