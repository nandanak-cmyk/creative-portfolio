import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { ALL_WORK_HREF, PROJECTS, WORK, projectPath } from '../content';
import { rememberHomeScroll } from '../nav-state';

import GlassCard from './GlassCard';
import MagneticLink from './MagneticLink';
import SectionLabel from './SectionLabel';
import SplitHeadline from './SplitHeadline';
import Tag from './Tag';
import SectionBackdrop from './SectionBackdrop';

const ALL = 'All';

/** Category filter tabs followed by the project grid. */
export default function WorksSection() {
  const [category, setCategory] = useState<string>(ALL);
  const gridRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  // Tabs come from the projects' own categories, in the order they first appear.
  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    PROJECTS.forEach((p) => counts.set(p.subtitle, (counts.get(p.subtitle) ?? 0) + 1));
    return [{ name: ALL, count: PROJECTS.length }, ...Array.from(counts, ([name, count]) => ({ name, count }))];
  }, []);

  const visible = category === ALL ? PROJECTS : PROJECTS.filter((p) => p.subtitle === category);

  // Animate the grid when the filter changes (not on first paint), then re-measure scroll triggers.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return undefined;
    }
    const grid = gridRef.current;
    if (!grid) return undefined;
    const items = grid.querySelectorAll<HTMLElement>('[data-work-card]');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tween = reduce
      ? null
      : gsap.fromTo(
          items,
          { y: 36, opacity: 0, scale: 0.96 },
          { y: 0, opacity: 1, scale: 1, duration: 0.7, ease: 'power4.out', stagger: 0.08, clearProps: 'transform,opacity' },
        );
    ScrollTrigger.refresh();
    return () => {
      tween?.kill();
    };
  }, [category]);

  return (
    <section id="projects"  className="relative px-5 py-28 md:px-10 md:py-36">
      <SectionBackdrop variant="projects" />
      <div data-float="-160" className="pointer-events-none absolute left-0 top-1/3 h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(closest-side,rgba(0,107,255,0.14),transparent)] blur-2xl" />
      <div className="relative mx-auto max-w-7xl">
        <SectionLabel>{WORK.eyebrow}</SectionLabel>
        <SplitHeadline
          text={WORK.headline}
          className="font-display text-5xl font-semibold leading-[1.02] tracking-tight md:text-7xl"
        />
        <p data-reveal className="mt-6 max-w-xl text-base text-brand-white/70 md:text-lg">
          {WORK.sub}
        </p>

        {/* Category tabs */}
        <div
          data-reveal
          role="tablist"
          aria-label="Filter works by category"
          className="mt-12 flex flex-wrap gap-2.5 md:mt-14"
        >
          {categories.map((c) => {
            const on = c.name === category;
            return (
              <button
                key={c.name}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setCategory(c.name)}
                className={`group inline-flex items-center gap-2.5 rounded-full border px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
                  on
                    ? 'border-white/40 bg-white/10 text-brand-white shadow-[0_0_34px_-10px_rgba(255,0,60,0.6)]'
                    : 'border-white/12 bg-white/[0.03] text-white/60 hover:border-white/30 hover:text-brand-white'
                }`}
              >
                {c.name}
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] tabular-nums transition-colors ${
                    on ? 'bg-brand-red/80 text-white' : 'bg-white/10 text-white/55'
                  }`}
                >
                  {c.count}
                </span>
              </button>
            );
          })}
        </div>
        <p aria-live="polite" className="sr-only">
          Showing {visible.length} {visible.length === 1 ? 'project' : 'projects'} in {category}
        </p>

        <div ref={gridRef} className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((p, i) => (
            <div key={p.slug} data-scrub-card data-work-card>
              <Link to={projectPath(p.slug)} onClick={rememberHomeScroll} className="block" aria-label={`Open project: ${p.title}`}>
                <GlassCard data-reveal data-delay={(i % 3) * 0.08} className="group overflow-hidden">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={p.image}
                      alt={p.alt}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-bg/90 via-brand-bg/10 to-transparent" />
                    <span className="absolute left-4 top-4 rounded-full border border-white/20 bg-brand-bg/60 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-brand-cyan backdrop-blur-md">
                      {p.subtitle}
                    </span>
                  </div>
                  <div className="p-6">
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="font-display text-2xl font-semibold">{p.title}</h3>
                      <span className="font-display text-sm text-white/45">{p.year}</span>
                    </div>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#ffb3c4]">{p.categories}</p>
                    <p className="mt-4 text-sm leading-relaxed text-brand-white/70">{p.description}</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {p.tags.map((t) => (
                        <Tag key={t}>{t}</Tag>
                      ))}
                    </div>
                    <p className="mt-6 flex items-center gap-2 text-sm font-medium text-brand-white">
                      {WORK.viewProject}
                      <span className="text-brand-red transition-transform duration-300 group-hover:translate-x-1.5">→</span>
                    </p>
                  </div>
                </GlassCard>
              </Link>
            </div>
          ))}
        </div>

        <div data-reveal className="mt-14 text-center">
          <MagneticLink
            href={ALL_WORK_HREF}
            className="btn-glass inline-block px-9 py-4 text-sm font-semibold"
          >
            {WORK.viewAll}
          </MagneticLink>
        </div>
      </div>
    </section>
  );
}
