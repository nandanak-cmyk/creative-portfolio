export interface ArcOptions {
  spacing: number;
  curve: number;
  visible: number;
  fade: number;
  shrink: number;
  blur: number;
  horizontal: boolean;
  /** Which side the preview image sits on; the arc bows away from it. */
  side: 'left' | 'right' | 'none';
}

export interface ArcPlacement {
  x: number;
  y: number;
  scale: number;
  opacity: number;
  blur: number;
}

const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v));

/**
 * Places a title that is `d` slots away from the active one on a circular arc.
 * The active slot (d = 0) sits closest to the preview; neighbours swing away from it.
 * `curve` controls how tight the circle is (higher = tighter turn).
 */
export function placeOnArc(d: number, o: ArcOptions): ArcPlacement {
  const radius = (o.spacing * 1.5) / Math.max(o.curve, 0.05);
  const theta = clamp((d * o.spacing) / radius, -1.35, 1.35);
  const along = radius * Math.sin(theta);
  const across = radius * (1 - Math.cos(theta)) * (o.side === 'right' ? -1 : 1);
  const dist = Math.abs(d);

  return {
    x: o.horizontal ? along : across,
    y: o.horizontal ? Math.abs(across) : along,
    scale: Math.max(0.2, 1 - o.shrink * dist),
    opacity: clamp(1 - dist * o.fade, 0, 1) * clamp(o.visible + 0.5 - dist, 0, 1),
    blur: o.blur * Math.min(dist, 2),
  };
}
