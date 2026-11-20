// Tide Royale — the editor. Wires the DOM to the renderer: size and preset
// switching, per-panel crop (click the cover to set the focal point),
// uploads, editable copy, and PNG export at the three exact sizes.
import { defaultState, PRESETS, SIZES } from './state.js';
import { layoutFor } from './layouts.js';
import { loadImage } from './imaging.js';
import { drawCover } from './renderer.js';
import { downloadCover } from './export.js';

const state = defaultState();
const images = new Array(6).fill(null);
let renderTimer = 0;

const $ = (id) => document.getElementById(id);
const preview = $('preview');
const pctx = preview.getContext('2d');

function showError(msg) {
  const el = $('error');
  el.textContent = msg;
  el.hidden = !msg;
  if (msg) setTimeout(() => { el.hidden = true; }, 6000);
}

async function loadPanelImage(i) {
  const src = state.panels[i].src;
  try {
    images[i] = await loadImage(src);
  } catch {
    images[i] = null;
  }
}

function scheduleRender() {
  clearTimeout(renderTimer);
  renderTimer = setTimeout(render, 30);
}

function render() {
  const size = SIZES[state.size];
  if (preview.width !== size.w || preview.height !== size.h) {
    preview.width = size.w;
    preview.height = size.h;
  }
  drawCover(pctx, size.w, size.h, state, images);
  refreshPanelList();
}

function refreshPanelList() {
  const list = $('panel-list');
  list.innerHTML = '';
  state.panels.forEach((p, i) => {
    const row = document.createElement('div');
    row.className = 'panel-row' + (state.selected === i ? ' selected' : '');
    row.dataset.index = i;
    const thumb = document.createElement('span');
    thumb.className = 'panel-thumb';
    thumb.textContent = String(i + 1);
    const meta = document.createElement('span');
    meta.className = 'panel-meta';
    const role = document.createElement('input');
    role.value = p.role;
    role.setAttribute('aria-label', 'Role for panel ' + (i + 1));
    role.addEventListener('input', () => { p.role = role.value; scheduleRender(); });
    const loc = document.createElement('input');
    loc.value = p.location;
    loc.setAttribute('aria-label', 'Location for panel ' + (i + 1));
    loc.addEventListener('input', () => { p.location = loc.value; scheduleRender(); });
    meta.appendChild(role);
    meta.appendChild(loc);
    const up = document.createElement('label');
    up.className = 'mini-upload';
    up.textContent = 'Photo';
    const file = document.createElement('input');
    file.type = 'file';
    file.accept = 'image/*';
    file.hidden = true;
    file.addEventListener('change', () => replacePhoto(i, file));
    up.appendChild(file);
    row.appendChild(thumb);
    row.appendChild(meta);
    row.appendChild(up);
    row.addEventListener('click', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'LABEL') return;
      state.selected = i;
      syncSelectedControls();
      render();
    });
    list.appendChild(row);
  });
}

async function replacePhoto(i, fileInput) {
  const file = fileInput.files && fileInput.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    showError('That file is not a photo. Choose an image file.');
    fileInput.value = '';
    return;
  }
  const url = URL.createObjectURL(file);
  try {
    await loadImage(url);
  } catch {
    showError('That file could not be read as a photo. Try another file.');
    URL.revokeObjectURL(url);
    fileInput.value = '';
    return;
  }
  state.panels[i].src = url;
  await loadPanelImage(i);
  render();
  fileInput.value = '';
}

function syncSelectedControls() {
  const p = state.panels[state.selected];
  $('zoom').value = Math.round(p.zoom * 100);
  $('zoom-val').textContent = Math.round(p.zoom * 100) + '%';
  $('flip').textContent = p.flip ? 'Unflip photo' : 'Flip photo';
}

function bindText(id, get, set) {
  const el = $(id);
  el.value = get();
  el.addEventListener('input', () => { set(el.value); scheduleRender(); });
}

function initControls() {
  // Size switcher.
  for (const key of Object.keys(SIZES)) {
    const btn = $('size-' + key);
    btn.addEventListener('click', () => {
      state.size = key;
      for (const k of Object.keys(SIZES)) $('size-' + k).classList.toggle('active', k === key);
      render();
    });
  }
  // Presets.
  for (const key of Object.keys(PRESETS)) {
    const btn = $('preset-' + key);
    btn.addEventListener('click', () => {
      state.preset = key;
      for (const k of Object.keys(PRESETS)) $('preset-' + k).classList.toggle('active', k === key);
      render();
    });
  }
  bindText('title-input', () => state.title, (v) => { state.title = v; });
  bindText('script-input', () => state.script, (v) => { state.script = v; });
  bindText('quote-input', () => state.quote, (v) => { state.quote = v; });
  bindText('paper-input', () => state.paper, (v) => { state.paper = v; });
  bindText('ribbon-input', () => state.ribbon, (v) => { state.ribbon = v; });
  bindText('billing1-input', () => state.billing1, (v) => { state.billing1 = v; });
  bindText('billing2-input', () => state.billing2, (v) => { state.billing2 = v; });
  bindText('vol-input', () => state.vol, (v) => { state.vol = v; });

  $('treatment').addEventListener('input', (e) => {
    state.treatment = e.target.value / 100;
    $('treatment-val').textContent = e.target.value + '%';
    scheduleRender();
  });
  $('ink').addEventListener('input', (e) => {
    state.ink = e.target.value / 100;
    $('ink-val').textContent = e.target.value + '%';
    scheduleRender();
  });
  $('zoom').addEventListener('input', (e) => {
    state.panels[state.selected].zoom = e.target.value / 100;
    $('zoom-val').textContent = e.target.value + '%';
    scheduleRender();
  });
  $('flip').addEventListener('click', () => {
    const p = state.panels[state.selected];
    p.flip = !p.flip;
    syncSelectedControls();
    render();
  });
  $('upload-all').addEventListener('change', async (e) => {
    const files = [...e.target.files];
    for (let i = 0; i < Math.min(files.length, 6); i++) {
      const f = files[i];
      if (!f.type.startsWith('image/')) continue;
      const url = URL.createObjectURL(f);
      try {
        await loadImage(url);
        state.panels[i].src = url;
        await loadPanelImage(i);
      } catch {
        URL.revokeObjectURL(url);
      }
    }
    render();
    e.target.value = '';
  });
  $('upload-one').addEventListener('change', async (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      showError('That file is not a photo. Choose an image file.');
      e.target.value = '';
      return;
    }
    const url = URL.createObjectURL(f);
    try {
      await loadImage(url);
    } catch {
      showError('That file could not be read as a photo. Try another file.');
      URL.revokeObjectURL(url);
      e.target.value = '';
      return;
    }
    for (const p of state.panels) p.src = url;
    for (let i = 0; i < 6; i++) await loadPanelImage(i);
    render();
    e.target.value = '';
  });
  // Click the cover: select the panel and set its focal point.
  preview.addEventListener('click', (e) => {
    const rect = preview.getBoundingClientRect();
    const sx = preview.width / rect.width;
    const sy = preview.height / rect.height;
    const x = (e.clientX - rect.left) * sx;
    const y = (e.clientY - rect.top) * sy;
    const L = layoutFor(preview.width, preview.height);
    for (let i = 0; i < 6; i++) {
      const r = L.panels[i];
      if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) {
        const p = state.panels[i];
        p.fx = (x - r.x) / r.w;
        p.fy = (y - r.y) / r.h;
        state.selected = i;
        syncSelectedControls();
        render();
        return;
      }
    }
  });
  // Exports.
  for (const key of Object.keys(SIZES)) {
    $('export-' + key).addEventListener('click', () => {
      downloadCover(state, images, key);
    });
  }
  syncSelectedControls();
}

async function boot() {
  try {
    await Promise.all([
      document.fonts.load('16px Anton'),
      document.fonts.load('16px Pacifico'),
      document.fonts.ready,
    ]);
  } catch {
    // Fonts are local; if loading fails the canvas falls back and still draws.
  }
  initControls();
  for (let i = 0; i < 6; i++) await loadPanelImage(i);
  render();
}

boot();
