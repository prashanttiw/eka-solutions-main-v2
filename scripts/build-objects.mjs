/**
 * Re-encodes the chrome renders in `source/objects` for the web.
 *
 * The originals are 1024px square PNGs at ~1 MB each — several times the weight of every
 * other asset on the page, for something that is decoration. Two things fix that:
 *
 *   1. Trim. Each render sits inside a generous transparent margin, so a large share of
 *      every placement is empty pixels. Trimming means a 320px-wide object on the page is
 *      actually 320px of chrome rather than 320px of frame with the object in the middle.
 *   2. WebP. These are smooth specular gradients with no text and no hard edges, which is
 *      the case WebP is best at — the set drops from 1.9 MB to about 125 KB with no
 *      visible difference at the sizes they are drawn.
 *
 * Alpha is preserved: the objects are cut out, and the ivory page shows through around
 * them. That alpha is also what `.chrome-object` masks its blue tint against, so anything
 * that flattens it would put a rectangle of blue over the section.
 *
 * Run with: node scripts/build-objects.mjs
 */
import sharp from 'sharp';
import { readdir, stat } from 'node:fs/promises';

const SRC = 'scripts/source/objects';
const OUT = 'public/assets';

// Twice the largest size any of these is drawn at (~380px), which is enough for a 2x screen.
const MAX_EDGE = 760;

const files = (await readdir(SRC)).filter((f) => f.endsWith('.png'));
let before = 0;
let after = 0;

for (const file of files) {
  before += (await stat(`${SRC}/${file}`)).size;

  const out = `${OUT}/${file.replace(/\.png$/, '.webp')}`;
  await sharp(`${SRC}/${file}`)
    // threshold 1 rather than 0: the renders have a hairline of near-zero alpha at the
    // edge, and trimming on exact zero leaves most of the margin behind.
    .trim({ threshold: 1 })
    .resize(MAX_EDGE, MAX_EDGE, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 88, effort: 6 })
    .toFile(out);

  const size = (await stat(out)).size;
  after += size;
  const meta = await sharp(out).metadata();
  console.log(`${file} → ${out}  ${meta.width}×${meta.height}  ${(size / 1024).toFixed(0)} KB`);
}

console.log(
  `\n${files.length} objects: ${(before / 1024 / 1024).toFixed(2)} MB → ${(after / 1024).toFixed(0)} KB`,
);
