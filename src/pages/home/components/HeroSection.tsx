import { lazy, Suspense } from 'react';

import { HERO } from '../content';

import HeroCardTrack from './HeroCardTrack';
import MagneticLink from './MagneticLink';
import SplitHeadline from './SplitHeadline';

// The animated logo artwork (three.js) is its own chunk so the copy paints first.
const HeroBackground = lazy(() => import('@/shared/components/hero/HeroBackground'));

export default function HeroSection() {
  return (
    <section id="top" className="relative overflow-clip">
      {/* Artwork stays pinned behind every hero screen and dims as you scroll past the first. */}
      <div className="sticky top-0 -mb-[100vh] h-screen overflow-hidden">
        <Suspense fallback={null}>
          <HeroBackground />
        </Suspense>
      </div>

      <div
        id="hero-first"
        className="relative z-10 flex min-h-screen items-end px-5 pb-16 pt-72 md:sticky md:top-0 md:px-10 md:pb-14 md:pt-32"
      >
        <div data-parallax="-70" className="relative z-10 mx-auto w-full max-w-7xl">
          <div className="max-w-3xl">
            <p data-reveal data-delay={0.2} className="mb-5 text-xs uppercase tracking-[0.28em] text-white/65">
              {HERO.eyebrow}
            </p>
            <SplitHeadline
              as="h1"
              text={HERO.headline}
              delay={0.3}
              plain
              className="font-display text-[2.5rem] font-semibold leading-[1.04] tracking-tight sm:text-5xl lg:text-6xl"
            />
            {/* A brushed stroke under the headline, drawn in as if by hand */}
            <svg aria-hidden="true" viewBox="0 0 240 14" className="mt-3 h-3 w-40 overflow-visible text-brand-red md:w-56">
              <path
                className="hand-stroke"
                d="M3 9 C 40 2, 70 12, 110 6 S 190 3, 237 8"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
                pathLength="1"
              />
            </svg>
            <p
              data-reveal
              data-delay={0.9}
              className="mt-6 max-w-xl text-base leading-relaxed text-[#f4efe8]/85 md:text-lg"
            >
              {HERO.sub}
            </p>
            <div data-reveal data-delay={1.05} className="mt-8 flex flex-wrap items-center gap-4">
              <MagneticLink
                href="#projects"
                className="btn-premium inline-block px-9 py-3.5 text-sm font-semibold"
              >
                {HERO.primary}
              </MagneticLink>
              <MagneticLink
                href="#contact"
                className="btn-glass inline-block px-9 py-3.5 text-sm font-semibold"
              >
                {HERO.secondary}
              </MagneticLink>
            </div>
          </div>

        </div>

        <div className="absolute bottom-4 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-white/40 md:flex">
          Scroll
          <span className="h-8 w-px animate-scroll-cue bg-white/50 motion-reduce:animate-none" />
        </div>
      </div>

      {/* The card panel launches up over the hero; then scroll slides cards right-to-left, click tints the hero. */}
      <HeroCardTrack />
    </section>
  );
}
