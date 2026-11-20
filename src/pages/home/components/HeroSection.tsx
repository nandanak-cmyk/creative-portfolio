import { lazy, Suspense } from 'react';

import { HERO } from '../content';

import HeroCardTrack from './HeroCardTrack';
import MagneticLink from './MagneticLink';
import ScrambleText from './ScrambleText';
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
            <p className="mb-5 inline-flex items-center gap-3 text-xs uppercase tracking-[0.28em] text-brand-cyan [text-shadow:0_0_14px_rgba(0,207,255,0.7)]">
              <span className="h-px w-10 bg-gradient-to-r from-brand-red to-brand-blue shadow-[0_0_12px_#FF003C]" />
              <ScrambleText text={HERO.eyebrow} delay={0.2} />
            </p>
            <SplitHeadline
              as="h1"
              text={HERO.headline}
              delay={0.3}
              className="font-display text-[2.5rem] font-semibold leading-[1.04] tracking-tight sm:text-5xl lg:text-6xl"
            />
            <p
              data-reveal
              data-delay={0.9}
              className="mt-6 max-w-xl text-base leading-relaxed text-brand-white/80 [text-shadow:0_2px_24px_rgba(3,3,5,0.9)] md:text-lg"
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
          <span className="h-8 w-px animate-scroll-cue bg-gradient-to-b from-brand-red to-brand-blue motion-reduce:animate-none" />
        </div>
      </div>

      {/* The card panel launches up over the hero; then scroll slides cards right-to-left, click tints the hero. */}
      <HeroCardTrack />
    </section>
  );
}
