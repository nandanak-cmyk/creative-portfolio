import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { WORK, projectPath, type Project } from '../content';
import { rememberHomeScroll } from '../nav-state';

/** Different picture shapes, so the grid has a natural, editorial rhythm. */
const ASPECTS = ['4 / 5', '1 / 1', '4 / 5', '5 / 4', '1 / 1', '4 / 5'] as const;

interface LoupeTileProps {
  project: Project;
  index: number;
  aspect: string;
}

/**
 * One picture, shown as a small slideshow of its project (cover, then its detail pictures), with the name and details
 * under it. Tapping or clicking opens the project.
 */
function LoupeTile({ project: p, index, aspect }: LoupeTileProps) {
  const tileRef = useRef<HTMLDivElement>(null);
  // Each picture is a small live slideshow of the project: the cover, then its two detail pictures.
  const pics = useMemo(() => [{ image: p.image, alt: p.alt }, ...p.gallery], [p]);
  const [idx, setIdx] = useState(0);
  const hovering = useRef(false);
  const visible = useRef(false);
  useEffect(() => {
    const tile = tileRef.current;
    if (!tile || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const io = new IntersectionObserver(([e]) => {
      visible.current = e.isIntersecting;
    });
    io.observe(tile);
    // Tiles change one after another, not all at once; phones change a little more slowly.
    const period = window.matchMedia('(pointer: coarse)').matches ? 5200 : 4200;
    let interval = 0;
    const start = window.setTimeout(() => {
      interval = window.setInterval(() => {
        if (!document.hidden && visible.current && !hovering.current) setIdx((i) => (i + 1) % pics.length);
      }, period);
    }, 900 + index * 700);
    return () => {
      io.disconnect();
      window.clearTimeout(start);
      window.clearInterval(interval);
    };
  }, [index, pics.length]);

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
          className="relative"
          onPointerEnter={(ev) => {
            if (ev.pointerType === 'mouse') hovering.current = true; // the slideshow rests while the picture is looked at
          }}
          onPointerLeave={() => {
            hovering.current = false;
          }}
        >
          <div
            className="relative overflow-hidden rounded-2xl border border-white/15 shadow-[0_30px_80px_-34px_rgba(255,0,60,0.5)] transition-[box-shadow,border-color] duration-500 group-hover:border-white/35 group-hover:shadow-[0_34px_90px_-30px_rgba(255,60,90,0.7)]"
            style={{ aspectRatio: aspect }}
          >
            {pics.map((pic, k) => (
              <img
                key={pic.image}
                src={pic.image}
                alt={k === idx ? pic.alt : ''}
                loading="lazy"
                decoding="async"
                draggable={false}
                className={`works-kb absolute inset-0 h-full w-full object-cover transition-opacity duration-[1100ms] ease-in-out ${
                  k === idx ? 'opacity-100' : 'opacity-0'
                }`}
              />
            ))}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-bg/55 via-transparent to-transparent" />
            {/* Progress dots: which picture of the project is showing */}
            <span aria-hidden="true" className="absolute right-3 top-4 flex items-center gap-1.5 md:right-4">
              {pics.map((pic, k) => (
                <span
                  key={pic.image}
                  className={`h-1 rounded-full bg-white transition-all duration-500 ${k === idx ? 'w-5 opacity-100' : 'w-1.5 opacity-40'}`}
                />
              ))}
            </span>
            <span className="absolute left-3 top-3 whitespace-nowrap rounded-full border border-white/25 bg-brand-bg/70 px-2.5 py-1 text-[9px] uppercase tracking-[0.14em] text-brand-cyan md:left-4 md:top-4 md:px-3 md:text-[10px] md:tracking-[0.18em]">
              No. {String(index + 1).padStart(2, '0')} · {p.subtitle}
            </span>
          </div>

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

/** Photo grid of the projects, each a small slideshow. Laid out in columns so the different shapes interlock. */
export default function WorksLoupeGrid({ projects }: WorksLoupeGridProps) {
  return (
    <div className="mt-12 columns-2 gap-4 md:mt-14 md:columns-3 md:gap-7">
      {projects.map((p, i) => (
        <LoupeTile key={p.slug} project={p} index={i} aspect={ASPECTS[i % ASPECTS.length]} />
      ))}
    </div>
  );
}
