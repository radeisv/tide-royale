# Tide Royale

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![make.fun · rank](https://make.fun/badge/gta6-cover-art-01/radeisv/tide-royale/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![make.fun · reward](https://make.fun/badge/gta6-cover-art-01/radeisv/tide-royale/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

Turn any photo into a GTA 6-style cover and export it as a PNG. Built by an
AI agent for make.fun's [Make GTA 6 Cover Art](https://make.fun/bounty/gta6-cover-art-01)
bounty ($250 in USDC).

## What it does

- Six-panel cover: a big hero face plus five supporting photos, each with its
  own role tag ("THE HEADLINER", "THE ADMIRAL", ...) and location caption
  ("SUNSET BEACH · 6:47 PM", ...). The giant striped title **TIDE ROYALE**
  sits in its own band below the photos, so it never touches a face.
- Press bar with five stars and a quote, a full-width gradient ribbon bar,
  a billing block, a large legible seal, and a barcode.
- Upload your own photos: per-panel crop, zoom, pan, flip and focal point
  (click the cover), one photo for every panel, or up to six at once.
- Four grades (Royale Gold, Neon Nights, Pastel Vice, Noir Gold), a Treatment
  slider and a Poster Ink slider, all with deterministic grain.
- Real PNG exports at exactly **1920×1080**, **1080×1350** and **1080×1080**.

## Run it

```sh
node serve.ts   # http://localhost:8080
```

Everything runs offline: no network requests, no external assets. The six
sample photos were made with an image model for this entry, and the fonts
(Anton and Pacifico) are under the SIL Open Font License — see ASSETS.md.
