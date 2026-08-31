/**
 * Derives the shipped logo assets in public/pyronaut-assets/ from the pristine
 * upstream artwork mirrored in resources/ (micronaut-projects/pyronaut media/).
 *
 * The outputs are committed, so this is a one-off asset pipeline rather than a
 * build step — it is deliberately NOT wired into `npm run build` and sharp is
 * not a project dependency. To re-run it:
 *
 *   npm i --no-save sharp && node scripts/build-logos.mjs
 *
 * What it does beyond copying:
 *  - Tightens each viewBox to the artwork's real ink bounds. Upstream wraps the
 *    art in a loose canvas (the narrow header sits at y 33..352 of a 445 box),
 *    which would otherwise render small and vertically off-centre in an <img>.
 *  - Crops a mascot-only variant, using the clean gutter above the wordmark.
 *  - Swaps the Micronaut dot-burst on the narrow header's nozzle for the blue
 *    and yellow Python mark, matching the flamethrower on the mascot.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const sharp = createRequire(import.meta.url)('sharp');

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const res = join(root, 'resources');
const out = join(root, 'public/pyronaut-assets');

/** Alpha bounding box of a rendered SVG, optionally limited to a band of rows. */
async function inkBounds(svg, yFrom = 0, yTo = Infinity) {
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  let minX = width, maxX = -1, minY = height, maxY = -1;
  for (let y = Math.max(0, yFrom); y <= Math.min(height - 1, yTo); y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * channels + 3] > 16) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

/** Rewrite the outer <svg> tag so the viewBox frames exactly the given box. */
function reframe(svg, b) {
  const open = svg.match(/<svg\b[^>]*>/);
  const tag = open[0]
    .replace(/\swidth="[^"]*"/, ` width="${b.w}"`)
    .replace(/\sheight="[^"]*"/, ` height="${b.h}"`)
    .replace(/\sviewBox="[^"]*"/, ` viewBox="${b.x} ${b.y} ${b.w} ${b.h}"`);
  return svg.replace(open[0], tag);
}

/**
 * Re-encode every embedded raster as a 256-colour palette PNG. The upstream art
 * is flat cartoon shading, so this is visually indistinguishable while cutting
 * roughly three quarters of the bytes — these SVGs are raster wrappers, not
 * vector, and ship unoptimised at ~5 MB across the page otherwise.
 */
async function optimizeRasters(svg) {
  const re = /data:image\/png;base64,\s*([^"]+)/g;
  let outStr = '';
  let cursor = 0;
  let m;
  while ((m = re.exec(svg))) {
    const original = Buffer.from(m[1].replace(/\s+/g, ''), 'base64');
    let encoded = original;
    try {
      const q = await sharp(original)
        .png({ palette: true, colors: 256, compressionLevel: 9, effort: 10 })
        .toBuffer();
      if (q.length < original.length) encoded = q;
    } catch {
      /* leave tiny or already-optimal payloads alone */
    }
    outStr += svg.slice(cursor, m.index) + 'data:image/png;base64,' + encoded.toString('base64');
    cursor = re.lastIndex;
  }
  return outStr + svg.slice(cursor);
}

async function emit(name, svg, bounds) {
  svg = await optimizeRasters(svg);
  const b = bounds ?? (await inkBounds(svg));
  const framed = reframe(svg, b);
  writeFileSync(join(out, name), framed);
  console.log(`${name.padEnd(21)} ${b.w}x${b.h}  ${(framed.length / 1024).toFixed(0)} KB`);
  return framed;
}

// ---------------------------------------------------------------------------
// 1. Lift the Python mark off the mascot's gun.
//    The nozzle panel in the narrow header is flat blue with the Micronaut
//    dot-burst laid over it; the mascot's gun carries the Python mark baked
//    into the base raster, so we cut it out by colour and re-use it.
// ---------------------------------------------------------------------------
const logoSvg = readFileSync(join(res, 'pyronaut_logo.svg'), 'utf8');
const baseLayer = logoSvg.match(/<image\b[^>]*?id="Image"[^>]*?href="data:image\/png;base64,\s*([^"]+)"/)[1];
const baseRaster = Buffer.from(baseLayer.replace(/\s+/g, ''), 'base64');

const SCALE = 8;
const REGION = { left: 415, top: 485, width: 90, height: 60 };
const { data: pd, info: pi } = await sharp(baseRaster)
  .extract(REGION)
  .resize({ width: REGION.width * SCALE, kernel: 'lanczos3' })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const isYellow = (r, g, b) => r > 170 && g > 140 && b < 130;
const isPyBlue = (r, g, b) => b > 195 && g > 105 && g < 205 && r < 130;

const rgba = Buffer.alloc(pi.width * pi.height * 4);
let mnX = pi.width, mxX = -1, mnY = pi.height, mxY = -1;
for (let y = 0; y < pi.height; y++) {
  for (let x = 0; x < pi.width; x++) {
    const i = (y * pi.width + x) * pi.channels;
    const r = pd[i], g = pd[i + 1], b = pd[i + 2];
    const on = isYellow(r, g, b) || isPyBlue(r, g, b);
    const o = (y * pi.width + x) * 4;
    rgba[o] = r; rgba[o + 1] = g; rgba[o + 2] = b; rgba[o + 3] = on ? 255 : 0;
    if (on) {
      if (x < mnX) mnX = x;
      if (x > mxX) mxX = x;
      if (y < mnY) mnY = y;
      if (y > mxY) mxY = y;
    }
  }
}
// The mark renders at roughly 8 CSS px in the header, so a 240px-wide,
// palette-quantised copy is far more resolution than it can ever show.
const pyMark = await sharp(rgba, { raw: { width: pi.width, height: pi.height, channels: 4 } })
  .extract({ left: mnX, top: mnY, width: mxX - mnX + 1, height: mxY - mnY + 1 })
  .resize({ width: 240, kernel: 'lanczos3' })
  .png({ palette: true, compressionLevel: 9 })
  .toBuffer();
const pyAspect = (mxX - mnX + 1) / (mxY - mnY + 1);
console.log(`python mark ${mxX - mnX + 1}x${mxY - mnY + 1} (aspect ${pyAspect.toFixed(2)})`);

// ---------------------------------------------------------------------------
// 2. Narrow header, light + dark. Replace the 69x69 dot-burst overlay with the
//    Python mark, keeping the designer's centre point and the mark's aspect.
// ---------------------------------------------------------------------------
const MARK_W = 66;
const MARK_H = MARK_W / pyAspect;

function swapNozzleMark(svg) {
  const burst = svg.match(/<image\b[^>]*\bwidth="69"[^>]*\bheight="69"[^>]*\/>/);
  if (!burst) throw new Error('nozzle dot-burst overlay (69x69) not found');
  const cx = parseFloat(burst[0].match(/\sx="([^"]+)"/)[1]) + 69 / 2;
  const cy = parseFloat(burst[0].match(/\sy="([^"]+)"/)[1]) + 69 / 2;
  const el =
    `<image id="pythonMark" x="${(cx - MARK_W / 2).toFixed(2)}" y="${(cy - MARK_H / 2).toFixed(2)}"` +
    ` width="${MARK_W}" height="${MARK_H.toFixed(2)}"` +
    ` xlink:href="data:image/png;base64,${pyMark.toString('base64')}"/>`;
  return svg.replace(burst[0], el);
}

const hdrLight = swapNozzleMark(readFileSync(join(res, 'pyronaut_narrow_header.svg'), 'utf8'));
const hdrDark = swapNozzleMark(readFileSync(join(res, 'pyronaut_narrow_header_white.svg'), 'utf8'));
const hdrBounds = await inkBounds(hdrLight);
await emit('logo-header.svg', hdrLight, hdrBounds);
await emit('logo-header-dark.svg', hdrDark, hdrBounds);

// ---------------------------------------------------------------------------
// 3. Full logo (mascot + wordmark) and the mascot-only crop.
// ---------------------------------------------------------------------------
const logoDarkSvg = readFileSync(join(res, 'pyronaut_logo_white_text.svg'), 'utf8');
const fullBounds = await inkBounds(logoSvg);
await emit('logo-full.svg', logoSvg, fullBounds);
await emit('logo-full-dark.svg', logoDarkSvg, fullBounds);

// Wordmark is separated from the mascot by a clean gutter; crop above it.
const WORDMARK_GUTTER_Y = 816;
await emit('mascot.svg', logoSvg, await inkBounds(logoSvg, 0, WORDMARK_GUTTER_Y));

// ---------------------------------------------------------------------------
// 4. Raster fallbacks: og:image (social cards will not render SVG) + favicon.
// ---------------------------------------------------------------------------
const mascotSvg = readFileSync(join(out, 'mascot.svg'));
await sharp(mascotSvg).resize({ width: 1200 }).png().toFile(join(out, 'mascot.png'));
await sharp(mascotSvg)
  .resize({ width: 512, height: 512, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile(join(out, 'favicon.png'));
console.log('mascot.png + favicon.png written');
