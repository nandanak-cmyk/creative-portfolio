import { useEffect, useRef, useState } from 'react';

import HeroEdges from './HeroEdges';
import { createHeroScene } from './hero-scene';

interface HeroBackgroundProps {
  /**
   * `true` (default): the hero, with the glass logo that zooms through as you scroll.
   * `false`: the same backdrop without the logo, for use behind another section.
   */
  logo?: boolean;
}

/**
 * The hero backdrop: sky, 3D crystals, light beams, floor grid, rails and glass lines. Fills its nearest
 * positioned parent. With the logo it also draws the zooming artwork (and falls back to the static image
 * if WebGL fails).
 */
export default function HeroBackground({ logo = true }: HeroBackgroundProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const container = wrap?.parentElement;
    if (!canvas || !container) return undefined;

    let disposed = false;
    let dispose: (() => void) | undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Creating the renderer can throw synchronously when WebGL is unavailable; never let that blank the page.
    try {
      createHeroScene(canvas, container, reduced, () => disposed, { logo })
        .then((handle) => {
          if (disposed) handle.dispose();
          else dispose = handle.dispose;
        })
        .catch(() => setFailed(true));
    } catch {
      setFailed(true);
    }

    // On the hero, fade the whole backdrop (sky + artwork) as it is scrolled past.
    let raf = 0;
    const fade = (): void => {
      raf = 0;
      // Full brightness while the logo zooms through, then it dims as the cards take over.
      const p = window.scrollY / window.innerHeight;
      const t = Math.min(1, Math.max(0, (p - 0.9) / 0.9));
      if (wrap) wrap.style.opacity = String(1 - 0.7 * t * t * (3 - 2 * t));
    };
    const onScroll = (): void => {
      if (!raf) raf = requestAnimationFrame(fade);
    };
    if (logo) {
      window.addEventListener('scroll', onScroll, { passive: true });
      fade();
    }

    return () => {
      disposed = true;
      dispose?.();
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, [logo]);

  return (
    <div ref={wrapRef} className="hero-sky pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      {failed ? (
        logo ? (
          <div className="absolute inset-0 bg-[url('/hero-logo.webp')] bg-contain bg-top bg-no-repeat md:bg-center" />
        ) : null
      ) : (
        <canvas ref={canvasRef} className="h-full w-full" />
      )}
      {/* Thin glass light lines: hairlines plus slow sweeping streaks */}
      <div className="absolute inset-y-0 left-[33%] w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
      <div className="absolute inset-y-0 left-[67%] w-px bg-gradient-to-b from-transparent via-white/[0.07] to-transparent" />
      <span className="absolute left-0 top-[20%] h-px w-[55%] animate-streak bg-gradient-to-r from-transparent via-white/40 to-transparent motion-reduce:hidden" />
      <span className="absolute left-0 top-[48%] h-px w-[40%] animate-streak bg-gradient-to-r from-transparent via-brand-red/50 to-transparent [animation-delay:3.5s] motion-reduce:hidden" />
      <span className="absolute left-0 top-[74%] h-px w-[48%] animate-streak bg-gradient-to-r from-transparent via-white/25 to-transparent [animation-delay:7s] motion-reduce:hidden" />
      {/* Legibility + seamless blend into the next section */}
      <div className="absolute inset-0 bg-gradient-to-t from-brand-bg/90 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-brand-bg/40 via-transparent to-transparent" />
      <div className="absolute inset-0 hidden bg-gradient-to-r from-brand-bg/45 via-transparent to-transparent md:block" />
      {/* Edge lighting sits above the legibility gradients so it is never dimmed by them */}
      <HeroEdges section={!logo} />
    </div>
  );
}
