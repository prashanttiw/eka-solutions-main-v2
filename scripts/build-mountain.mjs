/**
 * Turns the scanned pen-and-ink mountain engraving into a background-free asset.
 *
 * The source is a photographed sheet of paper: its off-white is darker and cooler than the
 * site's ivory, so pasting the JPEG straight into the footer reads as a grey box. Here we
 * throw the paper away entirely — luminance becomes an alpha channel over a flat charcoal,
 * so only the linework survives and the footer's own background shows through the "sky".
 *
 * Run with: node scripts/build-mountain.mjs
 */
import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';

const SRC = 'scripts/source/mountain-engraving.jpg';
const OUT = 'public/mountain.png';

const PAPER = 246;      // luminance of the bare sheet
const INK = 18;         // luminance of the densest strokes
const FLOOR = 0.055;    // ink coverage below this is paper grain, not drawing
const MAX_ALPHA = 0.93; // keeps the darkest strokes just shy of pure charcoal
const GAMMA = 1.04;     // very slight lift off the midtones so hatching stays airy
const INK_RGB = [0x24, 0x24, 0x21]; // warm charcoal, per the reference palette
const SKY_PAD = 60;     // transparent headroom above the summit, so a tight crop can't decapitate it
const EDGE_FEATHER = 0.05; // fraction of width faded out at each side

const { data, info } = await sharp(SRC).grayscale().raw().toBuffer({ resolveWithObject: true });
const { width: w, height: h } = info;

// --- find the drawing inside the paper margins -------------------------------------------
const darkRow = new Int32Array(h);
const darkCol = new Int32Array(w);
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    if (data[y * w + x] < 170) {
      darkRow[y]++;
      darkCol[x]++;
    }
  }
}
const firstOver = (arr, n) => { let i = 0; while (i < arr.length && arr[i] <= n) i++; return i; };
const lastOver = (arr, n) => { let i = arr.length - 1; while (i > 0 && arr[i] <= n) i--; return i; };
const x0 = firstOver(darkCol, 3);
const x1 = lastOver(darkCol, 3);
const y0 = firstOver(darkRow, 3);
const y1 = lastOver(darkRow, 3);

const cw = x1 - x0 + 1;
const ch = y1 - y0 + 1;
const outW = cw;
const outH = ch + SKY_PAD;

// --- paper -> alpha ----------------------------------------------------------------------
const rgba = Buffer.alloc(outW * outH * 4, 0);
const span = PAPER - INK;
const feather = Math.round(outW * EDGE_FEATHER);

for (let y = 0; y < ch; y++) {
  for (let x = 0; x < cw; x++) {
    const v = data[(y + y0) * w + (x + x0)];
    let a = (PAPER - v) / span;
    if (a <= FLOOR) continue;
    a = (a - FLOOR) / (1 - FLOOR);
    if (a > 1) a = 1;
    a = Math.pow(a, GAMMA) * MAX_ALPHA;

    // Fade the outermost columns so the range dissolves into the page instead of ending
    // on a ruler-straight edge — the single biggest "pasted-in rectangle" tell.
    if (x < feather) a *= x / feather;
    else if (x >= cw - feather) a *= (cw - 1 - x) / feather;
    if (a <= 0) continue;

    const i = ((y + SKY_PAD) * outW + x) * 4;
    rgba[i] = INK_RGB[0];
    rgba[i + 1] = INK_RGB[1];
    rgba[i + 2] = INK_RGB[2];
    rgba[i + 3] = Math.round(a * 255);
  }
}

const png = await sharp(rgba, { raw: { width: outW, height: outH, channels: 4 } })
  .png({ compressionLevel: 9, effort: 10 })
  .toBuffer();
await writeFile(OUT, png);

console.log(`crop x:${x0}..${x1} y:${y0}..${y1}  ->  ${outW}x${outH}  (${(png.length / 1024).toFixed(0)} KB)`);
