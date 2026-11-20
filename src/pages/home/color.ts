/** Fallback mood colour (brand neon red) as "r,g,b". */
export const DEFAULT_MOOD = '255,0,60';

/**
 * Turns an image's dominant colour (often a murky dark tone) into a vivid
 * version suitable for a glowing background wash. Returns "r,g,b".
 */
export function vividColor([r, g, b]: readonly number[]): string {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;

  let h = 0;
  if (d > 0) {
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));

  // Lift saturation and keep lightness in a range that glows on a dark page.
  const s2 = Math.max(0.65, Math.min(1, s * 1.25));
  const l2 = Math.max(0.42, Math.min(0.58, l + 0.12));

  const c = (1 - Math.abs(2 * l2 - 1)) * s2;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l2 - c / 2;
  const [r1, g1, b1] =
    h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];

  return [r1, g1, b1].map((v) => Math.round((v + m) * 255)).join(',');
}
