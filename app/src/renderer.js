// Tide Royale — the cover renderer. Draws the whole poster to any canvas at
// any of the three sizes. The title lives in its own band BELOW the photo
// grid, so it can never touch a face; every panel carries a role tag and a
// location caption; the seal is large enough to read at 300px wide.
import { layoutFor, fitFont, starburst } from './layouts.js';
import { renderPanelImage } from './imaging.js';
import { PRESETS } from './state.js';

const PURPLE = '#1c0b33';
const PURPLE_DEEP = '#12061f';
const GOLD = '#f2c14e';
const GOLD_DARK = '#8a6d1f';
const CREAM = '#f7ead0';
const PINK = '#ff7ad9';
const INK = '#2a0a4a';

function drawStar(ctx, cx, cy, r) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 === 0 ? r : r * 0.45;
    const a = (Math.PI * i) / 5 - Math.PI / 2;
    const x = cx + Math.cos(a) * rr;
    const y = cy + Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function titleGradient(ctx, x, y, w, h) {
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0.0, '#ffe45c');
  g.addColorStop(0.22, '#ffd23f');
  g.addColorStop(0.23, '#ff9f1c');
  g.addColorStop(0.44, '#ff8a3d');
  g.addColorStop(0.45, '#ff5e78');
  g.addColorStop(0.64, '#ff4d8d');
  g.addColorStop(0.65, '#c65bf5');
  g.addColorStop(0.84, '#a855f7');
  g.addColorStop(0.85, '#7c3aed');
  g.addColorStop(1.0, '#7c3aed');
  return g;
}

function ribbonGradient(ctx, x, y, w, h) {
  const g = ctx.createLinearGradient(x, y, x + w, y);
  g.addColorStop(0, '#ff4d8d');
  g.addColorStop(0.5, '#ff8a3d');
  g.addColorStop(1, '#ffd23f');
  return g;
}

export function drawCover(ctx, W, H, state, images) {
  const L = layoutFor(W, H);
  const preset = PRESETS[state.preset] || PRESETS.royale;

  // --- Background: deep purple with a warm glow at the top. ---
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, PURPLE);
  bg.addColorStop(1, PURPLE_DEEP);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 0, W * 0.7);
  glow.addColorStop(0, 'rgba(255, 150, 60, 0.16)');
  glow.addColorStop(1, 'rgba(255, 150, 60, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // --- Press bar: 5 stars, quote, paper, VOL badge. ---
  const press = L.press;
  const starR = press.h * 0.30;
  ctx.fillStyle = GOLD;
  for (let i = 0; i < 5; i++) {
    drawStar(ctx, 0.028 * W + i * starR * 2.4, press.h * 0.5, starR);
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const quoteSize = Math.round(0.0175 * H);
  ctx.font = fitFont(ctx, `"${state.quote}"`, 0.58 * W, quoteSize, 'Anton');
  const quoteW = ctx.measureText(`"${state.quote}"`).width;
  ctx.fillStyle = CREAM;
  ctx.fillText(`"${state.quote}"`, W / 2, press.h * 0.52);
  ctx.fillStyle = GOLD;
  ctx.font = fitFont(ctx, ` — ${state.paper}`, 0.2 * W, quoteSize, 'Anton');
  ctx.textAlign = 'left';
  ctx.fillText(` — ${state.paper}`, W / 2 + quoteW / 2 + 4, press.h * 0.52);
  // VOL badge, gold pill at the right.
  const badgeW = 0.085 * W;
  const badgeH = press.h * 0.62;
  const badgeX = W - badgeW - 0.012 * W;
  const badgeY = (press.h - badgeH) / 2;
  ctx.fillStyle = GOLD;
  roundRect(ctx, badgeX, badgeY, badgeW, badgeH, badgeH / 2);
  ctx.fill();
  ctx.fillStyle = INK;
  ctx.textAlign = 'center';
  ctx.font = fitFont(ctx, state.vol, badgeW * 0.8, Math.round(badgeH * 0.55), 'Anton');
  ctx.fillText(state.vol, badgeX + badgeW / 2, badgeY + badgeH / 2 + 1);

  // --- Photo panels. ---
  for (let i = 0; i < 6; i++) {
    const p = state.panels[i];
    const r = L.panels[i];
    const img = images[i];
    if (img) {
      const off = renderPanelImage(img, r, p, preset, state.treatment, state.ink);
      ctx.drawImage(off, r.x, r.y, r.w, r.h);
    } else {
      ctx.fillStyle = '#3a1c5c';
      ctx.fillRect(r.x, r.y, r.w, r.h);
    }
    // Gold inner border.
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = Math.max(2, W * 0.0016);
    ctx.strokeRect(r.x, r.y, r.w, r.h);
    // Role tag: angled black tag, top-left.
    const tagH = Math.max(16, 0.021 * H);
    const tagPad = tagH * 0.55;
    ctx.save();
    ctx.font = `${Math.round(tagH * 0.72)}px Anton`;
    const tagW = ctx.measureText(p.role).width + tagPad * 2;
    ctx.translate(r.x + 6, r.y + 6);
    ctx.rotate(-0.045);
    ctx.fillStyle = 'rgba(8, 4, 16, 0.92)';
    ctx.fillRect(0, 0, tagW, tagH);
    ctx.fillStyle = GOLD;
    ctx.fillRect(0, 0, 3, tagH);
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(p.role, tagPad, tagH / 2 + 1);
    ctx.restore();
    // Location caption: small caps on a dark strip, bottom-left.
    const capH = Math.max(14, 0.018 * H);
    ctx.fillStyle = 'rgba(8, 4, 16, 0.62)';
    ctx.fillRect(r.x, r.y + r.h - capH, r.w, capH);
    ctx.fillStyle = CREAM;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = fitFont(ctx, p.location, r.w - 14, Math.round(capH * 0.68), 'Anton');
    ctx.fillText(p.location, r.x + 7, r.y + r.h - capH / 2 + 1);
  }

  // --- Title band: giant striped title, script underneath, all below the grid. ---
  // The title is tracked out and stretched horizontally so it spans nearly
  // the full width even in condensed Anton.
  const tb = L.titleBand;
  const SCALE_X = 1.18;
  let titlePx = L.titlePx;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.letterSpacing = '0.06em';
  ctx.font = `${titlePx}px Anton`;
  while (titlePx > 20 && ctx.measureText(state.title).width * SCALE_X > 0.97 * W) {
    titlePx -= 2;
    ctx.font = `${titlePx}px Anton`;
  }
  const titleY = tb.y + tb.h * 0.80;
  ctx.save();
  ctx.translate(W / 2, 0);
  ctx.scale(SCALE_X, 1);
  ctx.translate(-W / 2, 0);
  // Hard offset shadow.
  ctx.fillStyle = 'rgba(10, 4, 20, 0.85)';
  ctx.fillText(state.title, W / 2 + W * 0.008, titleY + H * 0.008);
  // Striped fill + thick dark outline.
  ctx.fillStyle = titleGradient(ctx, 0, titleY - titlePx * 0.72, W, titlePx * 0.78);
  ctx.strokeStyle = INK;
  ctx.lineWidth = Math.max(3, W * 0.0035);
  ctx.lineJoin = 'round';
  ctx.strokeText(state.title, W / 2, titleY);
  ctx.fillText(state.title, W / 2, titleY);
  ctx.restore();
  ctx.letterSpacing = '0px';
  // Script subtitle, neon pink, overlapping the title's lower edge.
  ctx.font = fitFont(ctx, state.script, 0.62 * W, Math.round(0.038 * H), 'Pacifico');
  ctx.fillStyle = PINK;
  ctx.shadowColor = 'rgba(255, 122, 217, 0.8)';
  ctx.shadowBlur = Math.round(0.012 * W);
  ctx.fillText(state.script, W / 2, tb.y + tb.h * 0.94);
  ctx.shadowBlur = 0;

  // --- Ribbon bar: full-width gradient with a bold line. ---
  const rb = L.ribbon;
  ctx.fillStyle = ribbonGradient(ctx, rb.x, rb.y, rb.w, rb.h);
  ctx.fillRect(rb.x, rb.y, rb.w, rb.h);
  ctx.fillStyle = INK;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = fitFont(ctx, state.ribbon, 0.82 * W, Math.round(rb.h * 0.52), 'Anton');
  ctx.fillText(state.ribbon, W / 2, rb.y + rb.h / 2 + 1);

  // --- Billing band. ---
  const bb = L.billing;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = PINK;
  ctx.font = fitFont(ctx, state.nowShowing, 0.16 * W, Math.round(0.020 * H), 'Anton');
  ctx.fillText(state.nowShowing, 0.02 * W, bb.y + bb.h * 0.68);
  // Two billing lines, centered in the clear zone (left of the barcode/seal).
  ctx.textAlign = 'center';
  ctx.fillStyle = CREAM;
  const bSize = Math.round(0.0165 * H);
  ctx.font = fitFont(ctx, state.billing1, 0.50 * W, bSize, 'Anton');
  ctx.fillText(state.billing1, 0.44 * W, bb.y + bb.h * 0.32);
  ctx.font = fitFont(ctx, state.billing2, 0.50 * W, bSize, 'Anton');
  ctx.fillText(state.billing2, 0.44 * W, bb.y + bb.h * 0.68);
  // Seal: big gold starburst, dark text, three short lines.
  const s = L.seal;
  ctx.fillStyle = GOLD;
  starburst(ctx, s.cx, s.cy, s.r);
  ctx.fill();
  ctx.strokeStyle = GOLD_DARK;
  ctx.lineWidth = Math.max(2, W * 0.0012);
  ctx.stroke();
  ctx.fillStyle = INK;
  ctx.textAlign = 'center';
  const sealSize = Math.round(s.r * 0.33);
  ctx.font = `${sealSize}px Anton`;
  const lineH = sealSize * 1.05;
  const cy0 = s.cy - lineH;
  ctx.fillText(state.seal[0], s.cx, cy0);
  ctx.fillText(state.seal[1], s.cx, cy0 + lineH);
  ctx.fillText(state.seal[2], s.cx, cy0 + lineH * 2);
  ctx.fillStyle = INK;
  drawStar(ctx, s.cx, s.cy + s.r * 0.62, s.r * 0.09);
  // Barcode: white box, seeded bars, digits.
  const bc = L.barcode;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(bc.x, bc.y, bc.w, bc.h);
  let bx = bc.x + bc.w * 0.06;
  let seed = 424242;
  const nextRand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  ctx.fillStyle = '#111111';
  while (bx < bc.x + bc.w * 0.94) {
    const bw = 1 + nextRand() * (bc.w * 0.02);
    if (nextRand() > 0.42) ctx.fillRect(bx, bc.y + bc.h * 0.08, bw, bc.h * 0.66);
    bx += bw + 1 + nextRand() * (bc.w * 0.012);
  }
  ctx.fillStyle = '#111111';
  ctx.textAlign = 'center';
  ctx.font = `${Math.max(9, Math.round(bc.h * 0.16))}px monospace`;
  ctx.fillText('0 42069 2026', bc.x + bc.w / 2, bc.y + bc.h * 0.90);

  // --- Vignette + outer frame. ---
  const vg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75);
  vg.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vg.addColorStop(1, 'rgba(0, 0, 0, 0.14)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = Math.max(3, W * 0.0022);
  ctx.strokeRect(L.frame.x, L.frame.y, L.frame.w, L.frame.h);
}

// Render the cover at W x H into a fresh canvas and return it.
export function renderCoverCanvas(W, H, state, images) {
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d');
  drawCover(ctx, W, H, state, images);
  return c;
}
