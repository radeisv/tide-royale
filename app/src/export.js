// Tide Royale — PNG export. Renders the cover at the exact target size
// with the same renderer the editor preview uses, then downloads it.
import { SIZES } from './state.js';
import { renderCoverCanvas } from './renderer.js';

export function downloadCover(state, images, sizeKey) {
  const size = SIZES[sizeKey];
  const canvas = renderCoverCanvas(size.w, size.h, state, images);
  canvas.toBlob((blob) => {
    if (!blob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `tide-royale-${sizeKey}-${size.w}x${size.h}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }, 'image/png');
}
