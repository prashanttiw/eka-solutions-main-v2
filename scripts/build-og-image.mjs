/**
 * Builds the social share card (Open Graph / Twitter) at 1200x630 from the same brand
 * tokens as the live site — cream canvas, ink text, the one blue accent — so a shared
 * link looks like it belongs to the site rather than a generic template.
 *
 * Run with: node scripts/build-og-image.mjs
 */
import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';

const WIDTH = 1200;
const HEIGHT = 630;
const PAPER = '#F7F6F1';
const INK = '#1B2252';
const INK_SOFT = '#4A5478';
const BLUE = '#2F42B0';

const wordmarkSrc = await readFile('public/brand/eka-wordmark.webp');
const wordmarkMeta = await sharp(wordmarkSrc).metadata();
const wordmarkW = 300;
const wordmarkH = Math.round(wordmarkMeta.height * (wordmarkW / wordmarkMeta.width));
// librsvg's embedded-image decoder doesn't reliably handle WebP; re-encode to PNG so the
// <image> tag below rasterizes instead of silently dropping.
const wordmarkPng = await sharp(wordmarkSrc).resize(wordmarkW, wordmarkH).png().toBuffer();
const wordmarkB64 = wordmarkPng.toString('base64');

const svg = `
<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${PAPER}" />
  <rect x="0" y="0" width="${WIDTH}" height="6" fill="${BLUE}" />
  <circle cx="1080" cy="120" r="220" fill="${BLUE}" opacity="0.05" />
  <circle cx="1150" cy="520" r="140" fill="${BLUE}" opacity="0.06" />

  <image x="90" y="88" width="${wordmarkW}" height="${wordmarkH}" href="data:image/png;base64,${wordmarkB64}" />

  <text x="92" y="300" font-family="Georgia, 'Times New Roman', serif" font-weight="700" font-size="66" fill="${INK}">Built for you.</text>
  <text x="92" y="378" font-family="Georgia, 'Times New Roman', serif" font-weight="700" font-size="66" fill="${INK}" opacity="0.55">Built to last.</text>

  <text x="92" y="440" font-family="Arial, Helvetica, sans-serif" font-size="26" fill="${INK_SOFT}">Software engineering studio &#8212; websites, applications,</text>
  <text x="92" y="474" font-family="Arial, Helvetica, sans-serif" font-size="26" fill="${INK_SOFT}">AI systems, and the products we build for ourselves.</text>

  <rect x="92" y="524" width="52" height="3" fill="${BLUE}" />
  <text x="92" y="562" font-family="'Courier New', monospace" font-size="20" letter-spacing="2" fill="${INK_SOFT}">EKASOLUTION.COM</text>
</svg>
`;

const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
await writeFile('public/og-image.png', png);
console.log(`og-image.png written (${(png.length / 1024).toFixed(0)} KB)`);
