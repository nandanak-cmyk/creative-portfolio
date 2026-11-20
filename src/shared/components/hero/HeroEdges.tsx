import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLayoutEffect, useRef } from 'react';

import { introReady } from '@/shared/intro-gate';

gsap.registerPlugin(ScrollTrigger);

/**
 * Soft lighting for the outer parts of the hero: warm light from the left and a cool glow from the right,
 * both tied to scroll. (No grids, brackets or labels: just light.)
 */
export default function HeroEdges({ section = false }: { section?: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    let cancelled = false;
    const ctx = gsap.context(() => {
      // Scroll: the light swings and brightens as you move on.
      gsap
        .timeline({
          defaults: { ease: 'none' },
          // On the hero: the first ~550px of scroll. In another section: the whole pass through it.
          scrollTrigger: section
            ? { trigger: root.parentElement ?? root, start: 'top bottom', end: 'bottom top', scrub: 0.6 }
            : { trigger: '#top', start: 'top top', end: '+=550', scrub: 0.4 },
        })
        .to('[data-edge-beam-l]', { rotate: -9, xPercent: -10, opacity: 1 }, 0)
        .to('[data-edge-beam-r]', { rotate: 9, xPercent: 10, opacity: 1 }, 0)
        .to('[data-edge-haze]', { scale: 1.5, opacity: 0.2 }, 0);

      // Entrance, after the opening curtain.
      void introReady.then(() => {
        if (cancelled) return;
        gsap.from('[data-edge-beam-l], [data-edge-beam-r]', { opacity: 0, duration: 2.2, ease: 'power2.out', delay: 0.3 });
      });
    }, root);

    return () => {
      cancelled = true;
      ctx.revert();
    };
  }, [section]);

  return (
    <div ref={rootRef} className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Light beams: warm red from the left, cool silver from the right.
          Outer layer = scroll motion (GSAP); inner layer = idle sway (CSS), so they never fight. */}
      <div data-edge-beam-l className="absolute -left-[14%] -top-[18%] h-[140%] w-[52%] origin-top-left opacity-75 mix-blend-screen">
        <div className="h-full w-full origin-top-left animate-sway bg-[linear-gradient(105deg,rgba(255,10,60,0.34),rgba(255,10,60,0.1)_45%,transparent_75%)] blur-2xl [clip-path:polygon(0_0,85%_0,35%_100%,0_100%)]" />
      </div>
      <div data-edge-beam-r className="absolute -right-[14%] -top-[18%] h-[140%] w-[52%] origin-top-right opacity-75 mix-blend-screen">
        <div className="h-full w-full origin-top-right animate-sway-rev bg-[linear-gradient(255deg,rgba(235,240,255,0.2),rgba(235,240,255,0.05)_45%,transparent_75%)] blur-2xl [clip-path:polygon(15%_0,100%_0,100%_100%,65%_100%)]" />
      </div>

      {/* Corner haze */}
      <div
        data-edge-haze
        className="absolute -left-[10%] -top-[15%] h-[55%] w-[40%] rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.1),transparent)] blur-2xl"
      />
      <div
        data-edge-haze
        className="absolute -bottom-[20%] -right-[8%] h-[60%] w-[45%] rounded-full bg-[radial-gradient(closest-side,rgba(255,0,60,0.26),transparent)] blur-2xl"
      />
    </div>
  );
}
