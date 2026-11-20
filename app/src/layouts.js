// Tide Royale — cover geometry. Every band is a fraction of the cover size.
// Portrait and square keep the 3x2 grid. LANDSCAPE uses a different grid:
// the 3x2 grid's panels are 2.43:1 letterboxes there, and a cover crop of a
// 2:3 portrait photo can only show ~27% of its height in one — no focal
// point can fit a whole face (the Admiral's face alone spans 55% of his
// photo, the hero's 80% of hers). So in landscape the grid is 5 columns:
// the hero spans 2 columns x 2 rows in the centre (738x645 at 1920x1080,
// 1.14:1 — her whole face fits), the Flame spans 2 rows in a narrow column
// (a tall panel shows a portrait photo whole), and the other four panels
// are 359x317 (1.13:1, showing ~59% of a portrait photo's height — every
// face fits). The title band stays 0.19H tall with the same 0.21H title
// font, so the title stays giant; its baseline sits 12px below the grid.
export function layoutFor(w, h) {
  const landscape = w > h;
  if (landscape) {
    // 5 columns: [0.012,0.1992] [0.2092,0.3964] [0.4064,0.5936]
    //            [0.6036,0.7908] [0.8008,0.988]; rows [0.068,0.3565]
    //            [0.3665,0.655]. Panel order: 0 hero (centre, 2x2),
    // 1 top-left, 2 top-right, 3 bottom-left, 4 tall (col 1, 2 rows),
    // 5 bottom-right.
    const panels = [
      { x: 0.4064 * w, y: 0.068 * h, w: 0.3844 * w, h: 0.587 * h },
      { x: 0.012 * w, y: 0.068 * h, w: 0.1872 * w, h: 0.2885 * h },
      { x: 0.8008 * w, y: 0.068 * h, w: 0.1872 * w, h: 0.2885 * h },
      { x: 0.012 * w, y: 0.3665 * h, w: 0.1872 * w, h: 0.2885 * h },
      { x: 0.2092 * w, y: 0.068 * h, w: 0.1872 * w, h: 0.587 * h },
      { x: 0.8008 * w, y: 0.3665 * h, w: 0.1872 * w, h: 0.2885 * h },
    ];
    return {
      w, h,
      frame: { x: 0.006 * w, y: 0.006 * h, w: 0.988 * w, h: 0.988 * h },
      press: { x: 0, y: 0, w, h: 0.068 * h },
      panels,
      // The title font is 0.18H here (0.21H in portrait/square): Anton's
      // real cap height is ~0.87em (measured, not 0.72), so at 0.21H the
      // glyph tops would paint over the bottom-row location captions.
      // At 0.18H the baseline sits at 0.80 of the band and the glyph tops
      // land ~0.671H, ~17px below the grid bottom (0.655H).
      titlePx: Math.round(0.18 * h),
      titleBand: { x: 0, y: 0.675 * h, w, h: 0.19 * h },
      ribbon: { x: 0, y: 0.875 * h, w, h: 0.04 * h },
      billing: { x: 0, y: 0.92 * h, w, h: 0.07 * h },
      // Seal: large starburst at the right, spanning the ribbon and billing
      // bands. Its diameter is ~12% of the cover width so the text stays
      // legible even when the cover is shown 300px wide. It never overlaps
      // the title text (title spans at most 0.14-0.86W, the seal starts
      // at 0.872W) or any photo.
      seal: {
        cx: 0.93 * w, cy: 0.89 * h, r: 0.058 * w,
      },
      // Barcode: white box in the billing band, left of the seal.
      barcode: {
        x: 0.735 * w, y: 0.935 * h, w: 0.11 * w, h: 0.045 * h,
      },
    };
  }
  const col = [
    [0.012, 0.326],
    [0.337, 0.663],
    [0.674, 0.988],
  ];
  const row = [
    [0.065, 0.295],
    [0.305, 0.535],
  ];
  // Panel order: 0 hero (top-center), 1 top-left, 2 top-right,
  // 3 bottom-left, 4 bottom-center, 5 bottom-right.
  const cells = [
    [1, 0], [0, 0], [2, 0],
    [0, 1], [1, 1], [2, 1],
  ];
  const panels = cells.map(([c, r]) => ({
    x: col[c][0] * w,
    y: row[r][0] * h,
    w: (col[c][1] - col[c][0]) * w,
    h: (row[r][1] - row[r][0]) * h,
  }));
  return {
    w, h,
    frame: { x: 0.006 * w, y: 0.006 * h, w: 0.988 * w, h: 0.988 * h },
    press: { x: 0, y: 0, w, h: 0.068 * h },
    panels,
    // The title band starts a full 0.01H below the grid, and the title
    // baseline sits at 0.80 of the band: with Anton's real ~0.87em cap
    // height (measured) the glyph tops land at ~0.546H, 12px clear of the
    // grid bottom (0.535H) — the title can never paint over a caption.
    titlePx: Math.round(0.21 * h),
    titleBand: { x: 0, y: 0.545 * h, w, h: 0.23 * h },
    ribbon: { x: 0, y: 0.792 * h, w, h: 0.056 * h },
    billing: { x: 0, y: 0.855 * h, w, h: 0.13 * h },
    // Seal: large starburst at the right, spanning the ribbon and billing
    // bands. Its diameter is ~12% of the cover width so the text stays
    // legible even when the cover is shown 300px wide. It never overlaps
    // the title band or any photo.
    seal: {
      cx: 0.93 * w, cy: 0.89 * h, r: 0.058 * w,
    },
    // Barcode: white box in the billing band, left of the seal.
    barcode: {
      x: 0.735 * w, y: 0.935 * h, w: 0.11 * w, h: 0.045 * h,
    },
  };
}

// Shrink a font until `text` fits `maxW`. Returns the font string.
export function fitFont(ctx, text, maxW, startPx, family, weight = '') {
  let px = startPx;
  const face = `${weight} ${px}px ${family}`;
  ctx.font = face;
  while (px > 8 && ctx.measureText(text).width > maxW) {
    px -= 1;
    ctx.font = `${weight} ${px}px ${family}`;
  }
  return ctx.font;
}

// Draw a starburst (jagged seal) centred at (cx, cy).
export function starburst(ctx, cx, cy, r, points = 18) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const rr = i % 2 === 0 ? r : r * 0.86;
    const a = (Math.PI * i) / points - Math.PI / 2;
    const x = cx + Math.cos(a) * rr;
    const y = cy + Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

// A deterministic seeded PRNG (mulberry32) so the grain is identical on
// every render and every export.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
