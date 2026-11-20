import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLayoutEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import InfiniteGallery, { type InfiniteGalleryItem } from '@/shared/components/infinite-gallery/InfiniteGallery';

import { INFINITE, PROJECTS, projectPath } from '../content';
import { rememberHomeScroll } from '../nav-state';

import MarqueeStrip from './MarqueeStrip';
import SectionBackdrop from './SectionBackdrop';
import SectionLabel from './SectionLabel';
import SplitHeadline from './SplitHeadline';

gsap.registerPlugin(ScrollTrigger);

/** Counts shown under the headline, taken from the projects themselves. */
const PICTURE_COUNT = PROJECTS.reduce((n, p) => n + 1 + p.gallery.length, 0);

/**
 * Third section: the scrolling capability band, flowing into an endless 3D field of every
 * project picture (main images and their detail shots) that you drift through.
 */
export default function InfiniteGallerySection() {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);

  // While the section scrolls past, its headline grows, the light line under it draws, and the counts rise in.
  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const ctx = gsap.context(() => {
      const stage = section.querySelector('[data-gallery-stage]');
      gsap
        .timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: stage, start: 'top 85%', end: 'bottom 45%', scrub: 0.6 },
        })
        .fromTo('[data-gallery-copy]', { scale: 0.86 }, { scale: 1.08 }, 0)
        .fromTo('[data-gallery-line]', { scaleX: 0, opacity: 0.2 }, { scaleX: 1, opacity: 1, duration: 0.4 }, 0.05)
        .fromTo('[data-gallery-stats]', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3 }, 0.2);
    }, section);
    return () => ctx.revert();
  }, []);

  const items = useMemo<InfiniteGalleryItem[]>(() => {
    const open = (slug: string) => (): void => {
      rememberHomeScroll();
      navigate(projectPath(slug));
    };
    // Mix main pictures and detail shots so neighbours are rarely from the same project.
    const mains = PROJECTS.map((p) => ({ image: p.image, alt: p.alt, title: p.title, caption: p.subtitle, onOpen: open(p.slug) }));
    const details = PROJECTS.flatMap((p) =>
      p.gallery.map((g) => ({ image: g.image, alt: g.alt, title: p.title, caption: p.subtitle, onOpen: open(p.slug) })),
    );
    const out: InfiniteGalleryItem[] = [];
    const rounds = Math.max(mains.length, Math.ceil(details.length / 2));
    for (let i = 0; i < rounds; i++) {
      if (mains[i]) out.push(mains[i]);
      if (details[i * 2]) out.push(details[i * 2]);
      if (details[i * 2 + 1]) out.push(details[i * 2 + 1]);
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <section ref={sectionRef} id="gallery" className="relative">
      {/* Same light backdrop as the other sections, behind the band and the gallery */}
      <SectionBackdrop variant="gallery" />
      <MarqueeStrip />

      <div data-gallery-stage className="relative h-[94svh] min-h-[560px] overflow-hidden">
        {/* Soft light behind the field */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute left-1/2 top-1/2 h-[70vh] w-[70vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,0,60,0.16),transparent)] blur-3xl" />
        </div>

        <InfiniteGallery
          items={items}
          count={mobile ? 10 : 16}
          planeWidth={mobile ? 195 : 320}
          depth={mobile ? 4200 : 5200}
          speed={mobile ? 100 : 130}
        />

        {/* Edge fade so pictures emerge from, and dissolve into, the dark */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(3,3,5,0.5)_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-brand-bg/80 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-brand-bg/80 to-transparent" />

        {/* Dark halo so the larger headline stays readable over bright pictures */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-[5] h-[62vh] w-[min(96vw,78rem)] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(closest-side,rgba(3,3,5,0.9),rgba(3,3,5,0.65)_58%,transparent)]" aria-hidden="true" />

        <div
          data-gallery-copy
          className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-5 text-center will-change-transform"
        >
          <SectionLabel>{INFINITE.eyebrow}</SectionLabel>
          <SplitHeadline
            text={INFINITE.headline}
            className="max-w-5xl font-display text-5xl font-semibold leading-[1.02] tracking-tight [text-shadow:0_6px_60px_rgba(3,3,5,1)] sm:text-7xl md:text-8xl"
          />
          {/* A line of light that draws itself under the headline as you scroll */}
          <div
            data-gallery-line
            className="mt-8 h-px w-[min(60vw,28rem)] origin-center bg-gradient-to-r from-transparent via-brand-red to-transparent shadow-[0_0_24px_4px_rgba(255,0,60,0.6)]"
            aria-hidden="true"
          />
          <p
            data-gallery-stats
            className="mt-6 text-sm uppercase tracking-[0.3em] text-brand-white/90 [text-shadow:0_2px_24px_rgba(3,3,5,1)]"
          >
            {PROJECTS.length} projects · {PICTURE_COUNT} pictures
          </p>
          <p data-reveal className="mt-6 text-[11px] uppercase tracking-[0.28em] text-white/65 [text-shadow:0_2px_20px_rgba(3,3,5,1)]">
            {INFINITE.hint}
          </p>
        </div>
      </div>
    </section>
  );
}
