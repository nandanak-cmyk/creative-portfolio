import ParallaxCarousel from '@/shared/components/parallax-carousel/ParallaxCarousel';

import { GALLERY, WORK } from '../content';

import SplitHeadline from './SplitHeadline';

const IMAGES = WORK.items.map((item) => item.image);
const CAPTIONS = WORK.items.map((item) => item.title);

/** Third hero screen: a draggable parallax carousel under oversized, scroll-drifting type. */
export default function HeroGallery() {
  return (
    <div className="relative z-10 flex min-h-screen flex-col justify-center overflow-hidden py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-brand-bg via-brand-bg/70 to-brand-bg" aria-hidden="true" />

      {/* Oversized outline word that drifts sideways as you scroll. */}
      <div
        data-drift="-18"
        aria-hidden="true"
        className="text-outline pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 whitespace-nowrap font-display text-[26vw] font-semibold uppercase leading-none opacity-40"
      >
        {GALLERY.backdropWord} · {GALLERY.backdropWord}
      </div>

      <div className="relative mx-auto mb-10 w-full max-w-7xl px-5 md:px-10">
        <p
          data-reveal
          className="mb-4 text-xs uppercase tracking-[0.28em] text-brand-cyan [text-shadow:0_0_14px_rgba(0,207,255,0.7)]"
        >
          {GALLERY.eyebrow}
        </p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SplitHeadline
            text={GALLERY.headline}
            className="font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl"
          />
          <p data-reveal className="text-sm text-white/50">
            {GALLERY.hint} →
          </p>
        </div>
      </div>

      <div data-reveal data-delay={0.1} className="relative">
        <ParallaxCarousel
          images={IMAGES}
          captions={CAPTIONS}
          imageWidth={440}
          imageHeight={560}
          gap={36}
          borderRadius={22}
          parallaxIntensity={0.5}
          autoplaySpeed={32}
          loop
        />
      </div>
    </div>
  );
}
