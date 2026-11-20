// Tide Royale — photo loading and the pixel pipeline.
// The pipeline is: cover-crop (zoom / focal / flip) -> contrast + saturation
// -> warm split-tone (or neon split-tone) -> gentle posterize at high
// treatment -> soft Sobel "Poster Ink" -> deterministic grain.
// `treatment` (0..1) scales how hard the preset bites; at 0 the photo is
// nearly untouched, at 1 it is fully graded.
import { mulberry32 } from './layouts.js';

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('cannot load ' + src));
    img.src = src;
  });
}

function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

// Draw `img` into `ctx` covering rect (x, y, w, h) with a cover crop.
export function drawCropped(ctx, img, x, y, w, h, crop) {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const z = crop.zoom || 1;
  const s = Math.max(w / iw, h / ih) * z;
  const sw = w / s;
  const sh = h / s;
  let sx = clamp((crop.fx ?? 0.5) * iw - sw / 2, 0, Math.max(0, iw - sw));
  let sy = clamp((crop.fy ?? 0.5) * ih - sh / 2, 0, Math.max(0, ih - sh));
  ctx.save();
  if (crop.flip) {
    ctx.translate(x + w, y);
    ctx.scale(-1, 1);
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
  } else {
    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  }
  ctx.restore();
}

// Grade the pixels of `off` (an offscreen canvas holding one panel).
export function gradePanel(off, preset, treatment, ink, seed) {
  const ctx = off.getContext('2d');
  const w = off.width;
  const h = off.height;
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  const t = treatment;
  const contrast = 1 + (preset.contrast - 1) * t;
  const sat = 1 + (preset.sat - 1) * t;
  const warm = (preset.warm || 0) * t;
  const lift = (preset.lift || 0) * t;
  const poster = Math.max(0, (t - 0.7) / 0.3) * 0.8;
  const levels = 6;

  // Pass 1: contrast, saturation, split-tone, lift, posterize.
  for (let i = 0; i < d.length; i += 4) {
    let r = d[i];
    let g = d[i + 1];
    let b = d[i + 2];
    // Contrast around mid-grey.
    r = ((r / 255 - 0.5) * contrast + 0.5) * 255;
    g = ((g / 255 - 0.5) * contrast + 0.5) * 255;
    b = ((b / 255 - 0.5) * contrast + 0.5) * 255;
    // Saturation around luminance.
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    r = lum + (r - lum) * sat;
    g = lum + (g - lum) * sat;
    b = lum + (b - lum) * sat;
    // Split-tone: warm highlights, cool shadows; neon preset goes
    // magenta in the shadows and teal in the highlights instead.
    const hl = clamp(lum / 255, 0, 1);
    if (preset.neon) {
      r += (1 - hl) * 22 * t;
      b += (1 - hl) * 14 * t;
      g += hl * 16 * t;
      b += hl * 10 * t;
    } else {
      r += hl * warm * 46;
      b -= hl * warm * 26;
      b += (1 - hl) * warm * 14;
    }
    // Lift (or crush) the blacks.
    if (lift > 0) {
      r += lift * (255 - r) * 0.25;
      g += lift * (255 - g) * 0.25;
      b += lift * (255 - b) * 0.25;
    } else if (lift < 0) {
      r *= 1 + lift;
      g *= 1 + lift;
      b *= 1 + lift;
    }
    // Gentle posterize at high treatment.
    if (poster > 0) {
      const q = (v) => {
        const stepped = Math.round((v / 255) * (levels - 1)) / (levels - 1) * 255;
        return v + (stepped - v) * poster;
      };
      r = q(r); g = q(g); b = q(b);
    }
    d[i] = clamp(r, 0, 255);
    d[i + 1] = clamp(g, 0, 255);
    d[i + 2] = clamp(b, 0, 255);
  }

  // Pass 2: soft Sobel "Poster Ink" — darken strong edges a little.
  if (ink > 0) {
    const lum = new Float32Array(w * h);
    for (let p = 0, i = 0; i < d.length; i += 4, p++) {
      lum[p] = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    }
    const at = (x, y) => lum[clamp(y, 0, h - 1) * w + clamp(x, 0, w - 1)];
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const gx = at(x + 1, y - 1) + 2 * at(x + 1, y) + at(x + 1, y + 1)
          - at(x - 1, y - 1) - 2 * at(x - 1, y) - at(x - 1, y + 1);
        const gy = at(x - 1, y + 1) + 2 * at(x, y + 1) + at(x + 1, y + 1)
          - at(x - 1, y - 1) - 2 * at(x, y - 1) - at(x + 1, y - 1);
        const edge = Math.min(1, Math.sqrt(gx * gx + gy * gy) / 360);
        if (edge > 0.22) {
          const k = 1 - ink * (edge - 0.22) * 0.9;
          const i = (y * w + x) * 4;
          d[i] *= k; d[i + 1] *= k; d[i + 2] *= k;
        }
      }
    }
  }

  // Pass 3: deterministic grain, seeded per panel so every render matches.
  const rand = mulberry32(seed);
  for (let i = 0; i < d.length; i += 4) {
    const n = (rand() - 0.5) * 9;
    d[i] = clamp(d[i] + n, 0, 255);
    d[i + 1] = clamp(d[i + 1] + n, 0, 255);
    d[i + 2] = clamp(d[i + 2] + n, 0, 255);
  }
  ctx.putImageData(img, 0, 0);
}

// Render one panel's photo (cropped + graded) into an offscreen canvas
// at the panel's on-cover size, then return it for the renderer to paste.
export function renderPanelImage(img, rect, panel, preset, treatment, ink) {
  const pw = Math.max(2, Math.round(rect.w));
  const ph = Math.max(2, Math.round(rect.h));
  const off = document.createElement('canvas');
  off.width = pw;
  off.height = ph;
  const ctx = off.getContext('2d');
  drawCropped(ctx, img, 0, 0, pw, ph, panel);
  gradePanel(off, preset, treatment, ink, 1000 + panel.id * 77);
  return off;
}
