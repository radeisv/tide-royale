// Tide Royale — cover state. All copy is original, written for this entry.
// A "panel" is one photo cell: its image, role tag, location caption, and crop.
export const SIZES = {
  landscape: { w: 1920, h: 1080, label: 'Landscape 1920x1080' },
  portrait: { w: 1080, h: 1350, label: 'Portrait 1080x1350' },
  square: { w: 1080, h: 1080, label: 'Square 1080x1080' },
};

export const PRESETS = {
  royale: {
    label: 'Royale Gold',
    contrast: 1.18, sat: 1.35, warm: 0.10, lift: 0.0, posterize: 0,
  },
  neon: {
    label: 'Neon Nights',
    contrast: 1.15, sat: 1.50, warm: 0.0, lift: 0.0, posterize: 0, neon: true,
  },
  pastel: {
    label: 'Pastel Vice',
    contrast: 1.02, sat: 1.08, warm: 0.04, lift: 0.06, posterize: 0,
  },
  noir: {
    label: 'Noir Gold',
    contrast: 1.35, sat: 1.12, warm: 0.06, lift: -0.02, posterize: 0,
  },
};

export function defaultPanels() {
  // Default crops are face-centred at zoom 1.0. The old zooms (1.15-1.45)
  // shrank the visible window so far that faces were chin-cropped in
  // landscape; at zoom 1.0 every face fits whole in every size (measured
  // face spans: hero 0.03-0.83 of her square photo, Admiral 0.07-0.62,
  // Spotlight 0.17-0.60, Outsider 0.10-0.44, Flame 0.09-0.40 of their
  // 2:3 photos). The Ride's focal x is 0.62 so the car's nose (to 0.95 of
  // its frame) stays inside the crop.
  return [
    {
      id: 0, src: 'samples/01-hero.jpg', role: 'THE HEADLINER',
      location: 'SUNSET BEACH · 6:47 PM', zoom: 1.0, fx: 0.55, fy: 0.43, flip: false,
    },
    {
      id: 1, src: 'samples/02-admiral.jpg', role: 'THE ADMIRAL',
      location: 'MARINA BAY · 7:05 PM', zoom: 1.0, fx: 0.46, fy: 0.37, flip: false,
    },
    {
      id: 2, src: 'samples/04-spotlight.jpg', role: 'THE SPOTLIGHT',
      location: 'NEON ROW · 11:15 PM', zoom: 1.0, fx: 0.52, fy: 0.39, flip: false,
    },
    {
      id: 3, src: 'samples/03-outsider.jpg', role: 'THE OUTSIDER',
      location: 'COAST ROAD · DUSK', zoom: 1.0, fx: 0.47, fy: 0.27, flip: false,
    },
    {
      id: 4, src: 'samples/05-flame.jpg', role: 'THE FLAME',
      location: 'ROOFTOP · MAGIC HOUR', zoom: 1.0, fx: 0.48, fy: 0.4, flip: false,
    },
    {
      id: 5, src: 'samples/06-ride.jpg', role: 'THE RIDE',
      location: 'GOLDEN PIER · SUNSET', zoom: 1.0, fx: 0.62, fy: 0.55, flip: false,
    },
  ];
}

export function defaultState() {
  return {
    title: 'TIDE ROYALE',
    script: 'salt in the air, gold in the sky',
    quote: 'SUNSET, SCANDAL, AND SALT AIR',
    paper: 'THE PIER PRESS',
    vol: 'VOL. 02',
    ribbon: 'SIX STORIES · ONE SUNSET · NO APOLOGIES',
    billing1: 'A CROWN TIDE PICTURE · STARRING YOU',
    billing2: 'SHOT ON YOUR OWN CAMERA · GRADED BY HAND',
    nowShowing: 'NOW SHOWING',
    seal: ['CERTIFIED', 'COVER', 'ART'],
    preset: 'royale',
    treatment: 0.55,
    ink: 0,
    size: 'landscape',
    selected: 0,
    panels: defaultPanels(),
  };
}
