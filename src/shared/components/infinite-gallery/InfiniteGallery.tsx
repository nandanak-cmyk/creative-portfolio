import gsap from 'gsap';
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';

export interface InfiniteGalleryItem {
  image: string;
  alt: string;
  title?: string;
  caption?: string;
  /** Opens when the picture is clicked. */
  onOpen?: () => void;
}

export interface InfiniteGalleryProps {
  items: InfiniteGalleryItem[];
  /** How many pictures are alive in the field at once. Items repeat to fill it. */
  count?: number;
  /** Length of the tunnel along the viewing axis, in px. */
  depth?: number;
  /** Idle drift, in px per second. */
  speed?: number;
  /** How much scrolling pushes you through the field. */
  scrollBoost?: number;
  /** Picture width in px (height follows each picture's own shape). */
  planeWidth?: number;
  className?: string;
}

const PERSPECTIVE = 1000;
const Z_NEAR = 640;
const SHAPES = [1.25, 1, 0.8, 1.12] as const; // height / width, varied so the field is not a grid

const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));
const smooth = (a: number, b: number, x: number): number => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const mod = (a: number, n: number): number => ((a % n) + n) % n;

/** Small deterministic generator so the layout is the same on every load. */
function rng(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * An endless field of pictures you drift through in 3D. Every picture sits at a fixed spot off the
 * viewing axis and slides toward you; as it passes the camera it fades and re-appears far away, so
 * the field never ends. Idle drift, scrolling and the pointer all move you through it.
 */
export default function InfiniteGallery({
  items,
  count = 16,
  depth = 2600,
  speed = 70,
  scrollBoost = 1.5,
  planeWidth = 380,
  className = '',
}: InfiniteGalleryProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const planeRefs = useRef<Array<HTMLDivElement | null>>([]);

  // Fixed layout: two lanes, one either side of the viewing axis, alternating. Pictures stay close to the
  // horizontal middle (only a slight height variation), so they spread LEFT and RIGHT and never up or down.
  // Seen through perspective, each one starts as a tiny speck at the centre and spreads outward.
  const planes = useMemo(() => {
    const r = rng(7);
    return Array.from({ length: count }, (_, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      return {
        side,
        item: items[i % items.length],
        x: side * (200 + r() * 620),
        y: (r() - 0.5) * 210,
        w: planeWidth * (0.8 + r() * 0.5),
        shape: SHAPES[Math.floor(r() * SHAPES.length)],
        tilt: (r() - 0.5) * 4,
      };
    });
  }, [items, count, planeWidth]);

  const zFar = Z_NEAR - depth;

  useLayoutEffect(() => {
    const stage = stageRef.current;
    const world = worldRef.current;
    if (!stage || !world) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let travel = depth * 0.35; // what is drawn; it glides toward `target` so motion never jerks
    let target = travel;
    let inView = false;
    let lastScroll = window.scrollY;

    const place = (): void => {
      planes.forEach((p, i) => {
        const el = planeRefs.current[i];
        if (!el) return;
        const z = zFar + mod((i * depth) / planes.length + travel, depth);
        const u = (z - zFar) / depth; // 0 far .. 1 near
        const opacity = smooth(zFar, zFar + depth * 0.28, z) * (1 - smooth(Z_NEAR - 420, Z_NEAR, z));
        // Travel is eased: at the centre point while far away, sweeping outward as it nears, so each picture
        // follows a curve instead of a straight line. Each also turns to face the middle.
        const spread = 0.04 + 0.96 * Math.pow(u, 1.7); // ~0 far away -> 1 near: all start at the centre point
        const x = p.x * spread;
        const y = p.y * spread;
        const yaw = -p.side * (24 - 10 * u);
        el.style.opacity = opacity.toFixed(3);
        el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,${z.toFixed(1)}px) translate(-50%,-50%) rotateY(${yaw.toFixed(1)}deg) rotate(${p.tilt}deg)`;
        el.style.pointerEvents = opacity > 0.35 ? 'auto' : 'none';
        el.style.zIndex = String(Math.round(z + 2000));
      });
    };

    const tick = (_t: number, deltaMs: number): void => {
      if (!inView) return;
      const dt = Math.min(deltaMs / 1000, 0.05) || 0.016;
      const sy = window.scrollY;
      const ds = sy - lastScroll;
      lastScroll = sy;
      // Idle drift plus scroll push the target; the drawn position glides after it (scrolling up flies backwards).
      target += speed * dt + ds * scrollBoost;
      travel += (target - travel) * (1 - Math.exp(-7 * dt));
      place();
    };

    place();
    if (reduced) return undefined; // a still, composed frame

    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      lastScroll = window.scrollY; // do not count the scroll that happened while away
    });
    io.observe(stage);
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      io.disconnect();
    };
  }, [planes, depth, speed, scrollBoost, zFar]);

  // Re-measure nothing on resize (the layout is in px), but keep refs tidy if the list shrinks.
  useEffect(() => {
    planeRefs.current.length = planes.length;
  }, [planes.length]);

  return (
    <div
      ref={stageRef}
      className={`relative h-full w-full overflow-hidden ${className}`}
      style={{ perspective: `${PERSPECTIVE}px`, perspectiveOrigin: '50% 50%' }}
    >
      <div
        ref={worldRef}
        className="absolute left-1/2 top-1/2 h-0 w-0 will-change-transform [transform-style:preserve-3d]"
      >
        {planes.map((p, i) => (
          <div
            key={i}
            ref={(el) => {
              planeRefs.current[i] = el;
            }}
            className="absolute left-0 top-0 will-change-transform"
            style={{ width: p.w }}
          >
            <button
              type="button"
              onClick={p.item.onOpen}
              aria-label={p.item.onOpen ? `Open project: ${p.item.title ?? p.item.alt}` : p.item.alt}
              className="group relative block w-full overflow-hidden rounded-2xl border border-white/15 bg-brand-bg text-left shadow-[0_30px_90px_-30px_rgba(255,0,60,0.55)] transition-[border-color,box-shadow] duration-500 hover:border-white/55 hover:shadow-[0_30px_110px_-20px_rgba(255,60,90,0.8)]"
              style={{ aspectRatio: `1 / ${p.shape}` }}
            >
              <img
                src={p.item.image}
                alt={p.item.alt}
                draggable={false}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-bg/80 via-transparent to-transparent" />
              {p.item.title ? (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-brand-cyan">{p.item.caption}</p>
                  <p className="mt-0.5 font-display text-base font-semibold leading-tight">{p.item.title}</p>
                </div>
              ) : null}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
