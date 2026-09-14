/**
 * Re-encodes the photography in `source/photos` for the web.
 *
 * The originals are print-weight JPEGs — ~600 KB each, 3.7 MB for the set, which is most of
 * what the page has to download. They are also several times larger than they are ever
 * displayed. Here they are resized to twice their layout size (enough for a 2x screen) and
 * re-encoded with mozjpeg.
 *
 * The case-study screenshots additionally get pulled back toward the site's palette: the
 * source renders are saturated neon, which fights the ivory-and-ink everything else uses.
 * They are desaturated and warmed rather than fully duotoned, so they still read as real
 * product screens.
 *
 * Run with: node scripts/build-photos.mjs
 */
import sharp from 'sharp';
import { readdir, stat } from 'node:fs/promises';

const SRC = 'scripts/source/photos';
const OUT = 'public/assets';

const files = (await readdir(SRC)).filter((f) => f.endsWith('.jpg'));
let before = 0;
let after = 0;

for (const file of files) {
  const isCase = file.startsWith('case-');
  before += (await stat(`${SRC}/${file}`)).size;

  let img = sharp(`${SRC}/${file}`).resize({
    width: isCase ? 1100 : 820,
    withoutEnlargement: true,
  });

  if (isCase) {
    img = img.modulate({ saturation: 0.34, brightness: 1.02 }).linear(1.06, -8).tint('#F3F0E8');
  }

  const buf = await img.jpeg({ quality: 72, mozjpeg: true, chromaSubsampling: '4:2:0' }).toBuffer();
  await sharp(buf).toFile(`${OUT}/${file}`);
  after += buf.length;
  console.log(`${file.padEnd(18)} ${(buf.length / 1024).toFixed(0)} KB`);
}

// Avatars. The testimonial marquee draws the founder portraits into 44px circles, and
// handing a 820px photo to a 44px box is ~30 KB spent on pixels the browser throws away.
// These also ship without `loading="lazy"`: the marquee track is `width: max-content`, so
// most copies sit far outside the viewport at layout time and a lazy avatar in there is
// never fetched at all — it just stays an empty circle.
for (const file of files.filter((f) => f.startsWith('founder-'))) {
  const out = `${OUT}/${file.replace(/\.jpg$/, '-avatar.jpg')}`;
  const buf = await sharp(`${SRC}/${file}`)
    .resize(96, 96, { fit: 'cover', position: 'top' })
    .jpeg({ quality: 78, mozjpeg: true })
    .toBuffer();
  await sharp(buf).toFile(out);
  console.log(`${out.split('/').pop().padEnd(18)} ${(buf.length / 1024).toFixed(1)} KB`);
}

console.log(`\ntotal ${(before / 1024 / 1024).toFixed(2)} MB -> ${(after / 1024 / 1024).toFixed(2)} MB`);
