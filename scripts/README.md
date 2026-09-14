# scripts

## build-mountain.mjs

Regenerates `public/mountain.png` — the footer engraving — from the scanned original in
`source/mountain-engraving.jpg`.

The scan is a photograph of a sheet of paper. Its off-white is darker and cooler than the
site's `#F7F6F1`, so dropping the JPEG into the footer reads as a grey rectangle pasted over
the card. The script throws the paper away: luminance becomes an alpha channel over a flat
warm charcoal, the paper margins are cropped off, and the outer columns are faded, so only
the linework ships and the card background shows through the sky.

```bash
node scripts/build-mountain.mjs
```

Only re-run this after changing the source scan or the tuning constants at the top of the
file. The generated PNG is committed, so a normal build does not need it.
