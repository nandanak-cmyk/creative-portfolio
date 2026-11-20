import { useEffect, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';

import { WORK, projectPath, type Project } from '../content';
import { rememberHomeScroll } from '../nav-state';

import Tag from './Tag';

/** Each book is a different height, so the shelf has a natural skyline (desktop; scaled down on phones). */
const HEIGHTS = ['29rem', '32rem', '27.5rem', '31rem', '28rem', '33rem'] as const;
/** Spine picture is cropped differently per book so neighbours do not look alike. */
const SPINE_FOCUS = ['50% 30%', '20% 50%', '60% 40%', '35% 25%', '70% 60%', '45% 55%'] as const;

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const SPEED = '900ms';

interface WorksShelfProps {
  projects: readonly Project[];
}

/**
 * A bookshelf of the projects. Each book is a 3D box: the spine faces you; hovering pulls it forward, and
 * clicking turns it a quarter-turn so its cover faces you, with the project's details and a link. Only one
 * book is open at a time (the others dim), and Escape closes it.
 */
export default function WorksShelf({ projects }: WorksShelfProps) {
  const [open, setOpen] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);

  // A book that is filtered out of the shelf cannot stay open.
  useEffect(() => {
    if (open && !projects.some((p) => p.slug === open)) setOpen(null);
  }, [projects, open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (ev: KeyboardEvent): void => {
      if (ev.key === 'Escape') setOpen(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div data-reveal className="mt-12 md:mt-16">
      {/* The shelf: books stand on a plank. Scrolls sideways on narrow screens. */}
      <div className="-mx-5 overflow-x-auto px-5 pb-2 pt-10 md:mx-0 md:overflow-visible md:px-0">
        <div className="mx-auto flex w-max min-w-full items-end justify-center gap-2 [perspective:1700px] md:gap-3">
          {projects.map((p, i) => {
            const isOpen = open === p.slug;
            const isHover = hover === p.slug && !isOpen;
            const dimmed = open !== null && !isOpen;
            const index = String(i + 1).padStart(2, '0');

            const bookStyle: CSSProperties = {
              transform: isOpen
                ? 'translateZ(70px) rotateY(-90deg)'
                : isHover
                  ? 'translateZ(46px) translateY(-16px) rotateY(-9deg)'
                  : 'none',
              transition: `transform ${SPEED} ${EASE}`,
            };

            return (
              <div
                key={p.slug}
                data-book
                className="relative shrink-0 [--d:13.5rem] [--h:calc(var(--hb)*0.72)] [--w:3.4rem] md:[--d:21rem] md:[--h:var(--hb)] md:[--w:6.8rem]"
                style={
                  {
                    '--hb': HEIGHTS[i % HEIGHTS.length],
                    width: isOpen ? 'var(--d)' : 'var(--w)',
                    height: 'var(--h)',
                    opacity: dimmed ? 0.5 : 1,
                    transition: `width ${SPEED} ${EASE}, opacity 500ms ease`,
                  } as CSSProperties
                }
              >
                {/* Centres the book in its (changing) width, at the spine's width */}
                <div
                  className="absolute left-1/2 top-0 h-full"
                  style={{ width: 'var(--w)', marginLeft: 'calc(var(--w) / -2)' }}
                >
                  <div className="absolute inset-0 [transform-style:preserve-3d]" style={bookStyle}>
                    {/* Spine: faces you until the book is opened */}
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-label={`${p.title}, ${p.subtitle}. ${isOpen ? 'Close' : 'Open'} this book`}
                      onClick={() => setOpen(isOpen ? null : p.slug)}
                      onPointerEnter={(ev) => ev.pointerType === 'mouse' && setHover(p.slug)}
                      onPointerLeave={() => setHover(null)}
                      className="absolute inset-0 overflow-hidden rounded-[0.45rem] border border-white/20 text-left shadow-[0_30px_70px_-24px_rgba(255,0,60,0.55)] [backface-visibility:hidden]"
                      style={{ transform: 'translateZ(calc(var(--d) / 2))' }}
                    >
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 scale-[2.4] bg-cover"
                        style={{ backgroundImage: `url(${p.image})`, backgroundPosition: SPINE_FOCUS[i % SPINE_FOCUS.length] }}
                      />
                      <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/45 to-black/80" />
                      {/* Highlight along the left edge, like light catching a spine */}
                      <span aria-hidden="true" className="absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-white/30 to-transparent" />
                      <span className="absolute inset-x-0 top-4 text-center font-display text-xs text-brand-cyan">{index}</span>
                      <span className="absolute inset-0 flex items-center justify-center py-12">
                        <span className="neon-chrome inline-block font-display text-xl font-semibold leading-none tracking-tight [text-orientation:mixed] [transform:rotate(180deg)] [writing-mode:vertical-rl] md:text-3xl">
                          {p.title}
                        </span>
                      </span>
                      <span className="absolute inset-x-0 bottom-4 text-center text-[10px] uppercase tracking-[0.2em] text-white/70 [writing-mode:vertical-rl] [transform:rotate(180deg)]">
                        <span className="mx-auto inline-block">{p.year}</span>
                      </span>
                    </button>

                    {/* Cover: the book's right-hand face, which faces you once it has turned */}
                    <div
                      className="absolute top-0 h-full overflow-hidden rounded-r-xl border border-white/20 bg-brand-bg shadow-[0_40px_100px_-30px_rgba(255,0,60,0.6)] [backface-visibility:hidden]"
                      style={{
                        left: 'calc((var(--w) - var(--d)) / 2)',
                        width: 'var(--d)',
                        transform: 'rotateY(90deg) translateZ(calc(var(--w) / 2))',
                        pointerEvents: isOpen ? 'auto' : 'none',
                      }}
                      aria-hidden={!isOpen}
                    >
                      <img
                        src={p.image}
                        alt={isOpen ? p.alt : ''}
                        loading="lazy"
                        decoding="async"
                        draggable={false}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-brand-bg/85 to-brand-bg/10 [mask-image:none]" />
                      <button
                        type="button"
                        tabIndex={isOpen ? 0 : -1}
                        onClick={() => setOpen(null)}
                        aria-label="Close this book"
                        className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-brand-bg/60 text-lg leading-none backdrop-blur-md transition-colors hover:border-brand-red/70"
                      >
                        ×
                      </button>
                      <span className="absolute left-4 top-4 rounded-full border border-white/25 bg-brand-bg/55 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-brand-cyan backdrop-blur-md">
                        {p.subtitle}
                      </span>

                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-bg via-brand-bg/90 to-transparent p-5 pt-14 md:p-7 md:pt-16">
                        <div className="flex items-baseline justify-between gap-3">
                          <h3 className="font-display text-2xl font-semibold leading-tight md:text-3xl">{p.title}</h3>
                          <span className="font-display text-sm text-white/60">{p.year}</span>
                        </div>
                        <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-brand-red">{p.categories}</p>
                        <p className="mt-3 text-sm leading-relaxed text-brand-white/80">{p.description}</p>
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {p.tags.slice(0, 2).map((t) => (
                            <Tag key={t}>{t}</Tag>
                          ))}
                        </div>
                        <Link
                          to={projectPath(p.slug)}
                          onClick={rememberHomeScroll}
                          tabIndex={isOpen ? 0 : -1}
                          className="btn-premium mt-5 inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold"
                        >
                          {WORK.viewProject} <span aria-hidden="true">→</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* The plank the books stand on, with a soft glow beneath */}
      <div aria-hidden="true" className="relative mx-auto -mt-1 h-4 max-w-6xl rounded-md border border-white/15 bg-gradient-to-b from-white/20 via-white/[0.07] to-white/[0.02] shadow-[0_20px_60px_-10px_rgba(255,0,60,0.45)]">
        <div className="absolute inset-x-8 -bottom-8 h-8 rounded-[50%] bg-brand-red/20 blur-2xl" />
      </div>

      <p className="mt-8 text-center text-[11px] uppercase tracking-[0.28em] text-white/55">
        {open ? 'Press Esc or tap × to close' : 'Pick a book to open it'}
      </p>
    </div>
  );
}
