import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { WORK, projectPath, type Project } from '../content';
import { rememberHomeScroll } from '../nav-state';

/** Different picture shapes, so the grid has a natural, editorial rhythm. */
const ASPECTS = ['4 / 5', '1 / 1', '4 / 5', '5 / 4', '1 / 1', '4 / 5'] as const;

/** How much the loupe magnifies, and how wide it is (px). */
const ZOOM = 2.6;
const LOUPE = 168;

interface LoupeTileProps {
  project: Project;
  index: number;
  aspect: string;
}

/**
 * One picture with a magnifier. On a mouse, a round loupe follows the cursor (eased, so it glides) and shows
 * the same picture enlarged around that point. On touch screens there is no loupe: tapping just opens the project.
 */
function LoupeTile({ project: p, index, aspect }: LoupeTileProps) {
  const tileRef = useRef<HTMLDivElement>(null);
  const loupeRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<HTMLImageElement>(null);
  const [on, setOn] = useState(false);
  const fine = useMemo(() => window.matchMedia('(hover: hover) and (pointer: fine)').matches, []);
  const s = useRef({ w: 1, h: 1, tx: 0, ty: 0, x: 0, y: 0, raf: 0, first: true });

  const paint = (): void => {
    const st = s.current;
    const loupe = loupeRef.current;
    const zoom = zoomRef.current;
    if (!loupe || !zoom) return;
    loupe.style.transform = `translate3d(${(st.x - LOUPE / 2).toFixed(1)}px,${(st.y - LOUPE / 2).toFixed(1)}px,0)`;
    // The enlarged copy is positioned so the point under the cursor sits at the loupe's centre.
    zoom.style.transform = `translate3d(${(-(st.x * ZOOM - LOUPE / 2)).toFixed(1)}px,${(-(st.y * ZOOM - LOUPE / 2)).toFixed(1)}px,0)`;
  };

  const loop = (): void => {
    const st = s.current;
    st.x += (st.tx - st.x) * 0.22;
    st.y += (st.ty - st.y) * 0.22;
    paint();
    st.raf = requestAnimationFrame(loop);
  };

  useEffect(() => () => cancelAnimationFrame(s.current.raf), []);

  const move = (ev: React.PointerEvent): void => {
    const tile = tileRef.current;
    if (!tile || ev.pointerType !== 'mouse') return;
    const r = tile.getBoundingClientRect();
    const st = s.current;
    st.tx = ev.clientX - r.left;
    st.ty = ev.clientY - r.top;
    if (st.first) {
      st.x = st.tx;
      st.y = st.ty;
      st.first = false;
    }
  };

  const enter = (ev: React.PointerEvent): void => {
    if (!fine || ev.pointerType !== 'mouse') return;
    const tile = tileRef.current;
    const zoom = zoomRef.current;
    if (!tile || !zoom) return;
    const r = tile.getBoundingClientRect();
    const st = s.current;
    st.w = r.width;
    st.h = r.height;
    st.first = true;
    // Same crop as the tile picture (object-fit: cover), just ZOOM times larger.
    zoom.style.width = `${r.width * ZOOM}px`;
    zoom.style.height = `${r.height * ZOOM}px`;
    move(ev);
    cancelAnimationFrame(st.raf);
    st.raf = requestAnimationFrame(loop);
    setOn(true);
  };

  const leave = (): void => {
    cancelAnimationFrame(s.current.raf);
    setOn(false);
  };

  return (
    <div data-tile className="mb-5 break-inside-avoid md:mb-7">
      <Link
        to={projectPath(p.slug)}
        onClick={rememberHomeScroll}
        aria-label={`Open project: ${p.title}`}
        className="group block"
      >
        <div
          ref={tileRef}
          className={`relative ${fine ? 'cursor-none' : ''}`}
          onPointerEnter={enter}
          onPointerMove={move}
          onPointerLeave={leave}
        >
          <div
            className="relative overflow-hidden rounded-2xl border border-white/15 shadow-[0_30px_80px_-34px_rgba(255,0,60,0.5)] transition-[box-shadow,border-color] duration-500 group-hover:border-white/35 group-hover:shadow-[0_34px_90px_-30px_rgba(255,60,90,0.7)]"
            style={{ aspectRatio: aspect }}
          >
            <img
              src={p.image}
              alt={p.alt}
              loading="lazy"
              decoding="async"
              draggable={false}
              className="h-full w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-bg/55 via-transparent to-transparent" />
            <span className="absolute left-4 top-4 rounded-full border border-white/25 bg-brand-bg/55 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-brand-cyan backdrop-blur-md">
              No. {String(index + 1).padStart(2, '0')} · {p.subtitle}
            </span>
          </div>

          {/* The magnifier loupe (mouse only) */}
          {fine ? (
            <div
              ref={loupeRef}
              aria-hidden="true"
              className="pointer-events-none absolute left-0 top-0 z-10"
              style={{
                width: LOUPE,
                height: LOUPE,
                opacity: on ? 1 : 0,
                transition: 'opacity 220ms ease',
                willChange: 'transform',
              }}
            >
              <div
                className="h-full w-full overflow-hidden rounded-full border-2 border-white/80 bg-brand-bg shadow-[0_0_0_6px_rgba(255,255,255,0.08),0_20px_60px_-10px_rgba(0,0,0,0.9),0_0_50px_-6px_rgba(255,60,90,0.75)]"
                style={{ transform: on ? 'scale(1)' : 'scale(0.55)', transition: 'transform 260ms cubic-bezier(0.22,1,0.36,1)' }}
              >
                <img
                  ref={zoomRef}
                  src={p.image}
                  alt=""
                  draggable={false}
                  className="absolute left-0 top-0 max-w-none object-cover will-change-transform"
                />
                {/* Glass glare and a small zoom label */}
                <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.28),transparent_45%)]" />
                <span className="absolute inset-x-0 bottom-3 text-center text-[10px] font-semibold tracking-[0.2em] text-white/90 [text-shadow:0_1px_6px_rgba(0,0,0,0.9)]">
                  {ZOOM}×
                </span>
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex items-baseline justify-between gap-4">
          <h3 className="font-display text-xl font-semibold md:text-2xl">{p.title}</h3>
          <span className="font-display text-sm text-white/55">{p.year}</span>
        </div>
        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#ffb3c4]">{p.categories}</p>
        <p className="mt-3 flex items-center gap-2 text-sm font-medium text-brand-white">
          {WORK.viewProject}
          <span className="text-brand-red transition-transform duration-300 group-hover:translate-x-1.5">→</span>
        </p>
      </Link>
    </div>
  );
}

interface WorksLoupeGridProps {
  projects: readonly Project[];
}

/** Photo grid of the projects, each with a hover magnifier. Laid out in columns so the different shapes interlock. */
export default function WorksLoupeGrid({ projects }: WorksLoupeGridProps) {
  return (
    <div data-reveal className="mt-12 columns-2 gap-4 md:mt-14 md:columns-3 md:gap-7">
      {projects.map((p, i) => (
        <LoupeTile key={p.slug} project={p} index={i} aspect={ASPECTS[i % ASPECTS.length]} />
      ))}
    </div>
  );
}
