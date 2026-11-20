/**
 * The light that streams around the logo, used behind every content section so the page has one
 * consistent look. Each section places it differently (side, size, flip), so no two repeat, and
 * keeps it on the side opposite the copy so text stays clear.
 *
 * `glow` adds soft red / blue washes that fill the section so it never reads as blank, even where
 * the ribbons themselves do not reach.
 */
interface Variant {
  /** CSS background-size of the ribbon artwork. */
  size: string;
  /** CSS background-position of the ribbon artwork. */
  pos: string;
  flip: boolean;
  opacity: number;
  /** Scroll drift in px (see `data-float` in `useReveal`). */
  drift: number;
  glow: ReadonlyArray<{ x: number; y: number; w: number; h: number; rgb: string; a: number }>;
}

const RED = '255,40,72';
const BLUE = '60,110,255';

const VARIANTS = {
  about: {
    size: '125%',
    pos: '50% 18%',
    flip: true,
    opacity: 1,
    drift: 80,
    glow: [
      { x: 82, y: 22, w: 62, h: 70, rgb: RED, a: 0.48 },
      { x: 10, y: 88, w: 55, h: 55, rgb: BLUE, a: 0.32 },
    ],
  },
  gallery: {
    size: '125%',
    pos: '50% 36%',
    flip: false,
    opacity: 1,
    drift: 70,
    glow: [
      { x: 14, y: 66, w: 64, h: 62, rgb: RED, a: 0.5 },
      { x: 88, y: 80, w: 64, h: 62, rgb: BLUE, a: 0.42 },
      { x: 50, y: 92, w: 80, h: 36, rgb: RED, a: 0.3 },
    ],
  },
  projects: {
    size: '120%',
    pos: '50% 8%',
    flip: false,
    opacity: 0.95,
    drift: 100,
    glow: [
      { x: 8, y: 20, w: 58, h: 50, rgb: RED, a: 0.42 },
      { x: 92, y: 60, w: 58, h: 50, rgb: BLUE, a: 0.35 },
    ],
  },
  services: {
    size: '125%',
    pos: '50% 30%',
    flip: false,
    opacity: 1,
    drift: 80,
    glow: [
      { x: 6, y: 50, w: 60, h: 70, rgb: RED, a: 0.48 },
      { x: 88, y: 12, w: 50, h: 50, rgb: BLUE, a: 0.32 },
    ],
  },
  process: {
    size: '125%',
    pos: '50% 22%',
    flip: true,
    opacity: 1,
    drift: 90,
    glow: [
      { x: 90, y: 40, w: 60, h: 66, rgb: RED, a: 0.45 },
      { x: 12, y: 92, w: 52, h: 50, rgb: BLUE, a: 0.32 },
    ],
  },
  expertise: {
    size: '130%',
    pos: '50% 36%',
    flip: false,
    opacity: 0.95,
    drift: 70,
    glow: [
      { x: 14, y: 30, w: 56, h: 56, rgb: RED, a: 0.42 },
      { x: 86, y: 70, w: 56, h: 56, rgb: BLUE, a: 0.38 },
    ],
  },
  testimonials: {
    size: '130%',
    pos: '50% 20%',
    flip: true,
    opacity: 0.95,
    drift: 90,
    glow: [
      { x: 88, y: 28, w: 56, h: 56, rgb: RED, a: 0.42 },
      { x: 12, y: 74, w: 56, h: 56, rgb: BLUE, a: 0.35 },
    ],
  },
  contact: {
    size: '135%',
    pos: '50% 30%',
    flip: false,
    opacity: 1,
    drift: 60,
    glow: [
      { x: 10, y: 28, w: 62, h: 66, rgb: RED, a: 0.48 },
      { x: 90, y: 62, w: 62, h: 66, rgb: BLUE, a: 0.38 },
    ],
  },
} as const satisfies Record<string, Variant>;

export type BackdropVariant = keyof typeof VARIANTS;

export default function SectionBackdrop({ variant }: { variant: BackdropVariant }) {
  const v: Variant = VARIANTS[variant];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Soft colour fill: broad red and blue washes so the section is never blank */}
      {v.glow.map((g, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${g.x}%`,
            top: `${g.y}%`,
            width: `${g.w}vw`,
            height: `${g.h}%`,
            transform: 'translate(-50%,-50%)',
            background: `radial-gradient(closest-side, rgba(${g.rgb},${g.a}), rgba(${g.rgb},${g.a * 0.35}) 55%, transparent 100%)`,
          }}
        />
      ))}

      {/* The ribbons. Flip is on the outer layer so the scroll drift (GSAP transform) cannot undo it. */}
      <div className="absolute inset-0" style={{ transform: v.flip ? 'scaleX(-1)' : undefined }}>
        <div data-float={v.drift} className="absolute inset-x-0 -inset-y-[12%]">
          <div
            className="light-drift h-full w-full"
            style={{
              backgroundImage: 'url(/light-ribbons.png)',
              backgroundRepeat: 'no-repeat',
              backgroundSize: v.size,
              backgroundPosition: v.pos,
              opacity: v.opacity,
            }}
          />
        </div>
      </div>

      {/* A second, mirrored pass lower down, so the whole section carries light */}
      <div className="absolute inset-0" style={{ transform: v.flip ? undefined : 'scaleX(-1)' }}>
        <div data-float={-v.drift} className="absolute inset-x-0 -inset-y-[12%]">
          <div
            className="light-drift h-full w-full"
            style={{
              backgroundImage: 'url(/light-ribbons.png)',
              backgroundRepeat: 'no-repeat',
              backgroundSize: v.size,
              backgroundPosition: '50% 92%',
              opacity: v.opacity * 0.85,
              animationDelay: '-11s',
            }}
          />
        </div>
      </div>

      {/* Fades the top and bottom edges into the neighbouring sections */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-bg via-transparent to-brand-bg" />
    </div>
  );
}
