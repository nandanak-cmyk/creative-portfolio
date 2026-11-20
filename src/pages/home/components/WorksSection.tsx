import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useMemo, useRef, useState } from 'react';

import { PROJECTS, WORK } from '../content';

import SectionBackdrop from './SectionBackdrop';
import SectionLabel from './SectionLabel';
import SplitHeadline from './SplitHeadline';
import WorksLoupeGrid from './WorksLoupeGrid';

const ALL = 'All';

/** Category filter tabs followed by the photo grid with hover magnifiers. */
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

  // When the filter changes (not on first paint) the pictures rise in again, one after another.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return undefined;
    }
    const grid = gridRef.current;
    if (!grid) return undefined;
    const tiles = grid.querySelectorAll<HTMLElement>('[data-tile]');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tween = reduce
      ? null
      : gsap.fromTo(
          tiles,
          { y: 40, opacity: 0, scale: 0.97 },
          { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out', stagger: 0.09, clearProps: 'transform,opacity' },
        );
    ScrollTrigger.refresh();
    return () => {
      tween?.kill();
    };
  }, [category]);

  return (
    <section id="projects" className="relative px-5 py-28 md:px-10 md:py-36">
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

        <div ref={gridRef}>
          <WorksLoupeGrid projects={visible} />
        </div>

        {category !== ALL ? (
          <div className="mt-10 text-center">
            <button type="button" onClick={() => setCategory(ALL)} className="btn-glass inline-block px-9 py-4 text-sm font-semibold">
              {WORK.viewAll}
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
