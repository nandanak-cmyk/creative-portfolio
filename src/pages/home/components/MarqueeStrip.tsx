import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLayoutEffect, useRef } from 'react';

import { MARQUEE_WORDS } from '../content';

gsap.registerPlugin(ScrollTrigger);

/** Quiet divider between words: a small crimson dot. */
function Divider() {
  return (
    <span aria-hidden="true" className="mx-10 flex shrink-0 items-center md:mx-16">
      <span className="block h-1.5 w-1.5 rounded-full bg-brand-red shadow-[0_0_12px_rgba(255,0,60,0.65)]" />
    </span>
  );
}

/** One endless row of words. Two identical halves let it loop without a jump. */
function Row() {
  const items = [...MARQUEE_WORDS, ...MARQUEE_WORDS];
  return (
    <div data-band-row className="flex overflow-hidden whitespace-nowrap">
      <div data-track className="flex shrink-0 items-center will-change-transform">
        {[0, 1].map((half) => (
          <div key={half} className="flex shrink-0 items-center" aria-hidden={half === 1}>
            {items.map((word, i) => (
              <span key={`${word}-${i}`} className="flex items-center">
                {/* Same type and colours as the page's headings: Space Grotesk semi-bold, with chrome-silver words
                    alternating with the flowing red-to-blue neon accent words. */}
                <span
                  className={`inline-block font-display text-5xl font-semibold leading-[1.15] tracking-tight md:text-7xl ${
                    i % 2 === 0 ? 'neon-chrome' : 'neon-liquid'
                  }`}
                >
                  {word}
                </span>
                <Divider />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * A single, simple band: one row of the page's own heading type, with no lines around it, moving
 * at a calm pace. Scroll speed nudges it, and it glides in diagonally as the card section ends.
 */
export default function MarqueeStrip() {
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const ctx = gsap.context(() => {
      // Entrance: as the card section ends, the band glides in from the top-right and settles level.
      gsap
        .timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 45%', scrub: 0.6, invalidateOnRefresh: true },
        })
        .fromTo(
          '[data-band-sweep]',
          { xPercent: 50, yPercent: -130, rotate: -8 },
          { xPercent: 0, yPercent: 0, rotate: 0, duration: 1 },
          0,
        )
        .fromTo('[data-band-sweep]', { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0);

      const track = gsap.utils.toArray<HTMLElement>('[data-track]')[0];
      const run = gsap.fromTo(track, { xPercent: 0 }, { xPercent: -50, duration: 44, ease: 'none', repeat: -1 });

      // Scroll velocity nudges the speed, then it settles back to a calm pace.
      let dir = 1;
      let target = 1;
      let current = 1;
      ScrollTrigger.create({
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          dir = self.direction === 1 ? 1 : -1;
          target = dir * (1 + Math.min(Math.abs(self.getVelocity()) / 300, 4));
        },
      });
      const tick = (): void => {
        target += (dir - target) * 0.04;
        current += (target - current) * 0.1;
        run.timeScale(current);
      };
      gsap.ticker.add(tick);
      return () => gsap.ticker.remove(tick);
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={root} className="pointer-events-none relative z-30" aria-label="Capabilities">
      <div data-band-sweep>
        <div className="relative py-11 md:py-16">
          {/* The row fades into the dark at both ends */}
          <div className="[mask-image:linear-gradient(to_right,transparent,#000_14%,#000_86%,transparent)]">
            <Row />
          </div>
        </div>
      </div>
    </div>
  );
}
