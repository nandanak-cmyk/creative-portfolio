import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLayoutEffect, useRef } from 'react';

import { introReady } from '@/shared/intro-gate';

gsap.registerPlugin(ScrollTrigger);

const RAIL_LEFT = 'Brands · Web · 3D & Motion';
const RAIL_RIGHT = 'Adviciya Solutions — Creative Studio';

/**
 * Lighting and framing for the outer parts of the hero: light beams from both sides,
 * a perspective floor grid, corner brackets and side rails. Every piece is tied to scroll.
 */
export default function HeroEdges({ section = false }: { section?: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    let cancelled = false;
    const ctx = gsap.context(() => {
      // Scroll: beams swing and brighten, the floor rushes toward you, the frame opens outward.
      const tl = gsap
        .timeline({
          defaults: { ease: 'none' },
          // On the hero: the first ~550px of scroll. In another section: the whole pass through it.
          scrollTrigger: section
            ? { trigger: root.parentElement ?? root, start: 'top bottom', end: 'bottom top', scrub: 0.6 }
            : { trigger: '#top', start: 'top top', end: '+=550', scrub: 0.4 },
        })
        .to('[data-edge-beam-l]', { rotate: -9, xPercent: -10, opacity: 1 }, 0)
        .to('[data-edge-beam-r]', { rotate: 9, xPercent: 10, opacity: 1 }, 0)
        .fromTo('[data-edge-grid]', { backgroundPositionY: '0px' }, { backgroundPositionY: '520px' }, 0)
        .to('[data-edge-haze]', { scale: 1.5, opacity: 0.2 }, 0);
      // On the hero the frame opens outward and fades as you scroll away; in other sections it stays put.
      if (!section) {
        tl.to('[data-edge-rail-l]', { x: -70, opacity: 0 }, 0)
          .to('[data-edge-rail-r]', { x: 70, opacity: 0 }, 0)
          .to('[data-edge-corner]', { scale: 1.6, opacity: 0.1 }, 0);
      }

      // Entrance, after the opening curtain.
      void introReady.then(() => {
        if (cancelled) return;
        gsap.from('[data-edge-beam-l], [data-edge-beam-r]', { opacity: 0, duration: 2.2, ease: 'power2.out', delay: 0.3 });
        gsap.from('[data-edge-grid-wrap]', { opacity: 0, yPercent: 20, duration: 2.2, ease: 'expo.out', delay: 0.6 });
        gsap.from('[data-edge-rail-l]', { x: -40, opacity: 0, duration: 1.4, ease: 'power3.out', delay: 1.1 });
        gsap.from('[data-edge-rail-r]', { x: 40, opacity: 0, duration: 1.4, ease: 'power3.out', delay: 1.1 });
        gsap.from('[data-edge-corner]', { scale: 0.4, opacity: 0, duration: 1.2, ease: 'back.out(1.6)', stagger: 0.1, delay: 1.3 });
      });
    }, root);

    return () => {
      cancelled = true;
      ctx.revert();
    };
  }, [section]);

  const corner = 'absolute hidden h-12 w-12 border-white/55 md:block';

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

      {/* Perspective floor grid, sliding toward the viewer as you scroll */}
      <div data-edge-grid-wrap className="absolute inset-x-0 bottom-0 h-[44%] [perspective:520px]">
        <div
          data-edge-grid
          className="absolute -inset-x-[45%] bottom-0 h-[230%] origin-bottom [background-image:linear-gradient(rgba(255,40,80,0.55)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.28)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:linear-gradient(to_top,#000_4%,transparent_62%)] [transform:rotateX(66deg)]"
        />
      </div>

      {/* Frame: corner brackets */}
      <div data-edge-corner className={`${corner} left-6 top-24 border-l border-t`} />
      <div data-edge-corner className={`${corner} right-6 top-24 border-r border-t`} />
      <div data-edge-corner className={`${corner} bottom-6 left-6 border-b border-l`} />
      <div data-edge-corner className={`${corner} bottom-6 right-6 border-b border-r`} />

      {/* Side rails: vertical labels with a tick ruler */}
      <div className="absolute inset-y-0 left-3 hidden items-center gap-3 md:flex">
        <span
          data-edge-rail-l
          className="flex items-center gap-4 text-[10px] uppercase tracking-[0.42em] text-white/60 [writing-mode:vertical-rl] [transform:rotate(180deg)]"
        >
          {RAIL_LEFT}
          <span className="h-24 w-px bg-gradient-to-b from-transparent via-brand-red to-transparent" />
        </span>
      </div>
      <div className="absolute inset-y-0 right-3 hidden items-center gap-3 md:flex">
        <span
          data-edge-rail-r
          className="flex items-center gap-4 text-[10px] uppercase tracking-[0.42em] text-white/60 [writing-mode:vertical-rl]"
        >
          {RAIL_RIGHT}
          <span className="h-24 w-px bg-gradient-to-b from-transparent via-white/60 to-transparent" />
        </span>
      </div>
    </div>
  );
}
