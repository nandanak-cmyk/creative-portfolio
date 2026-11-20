import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { useEffect } from 'react';

gsap.registerPlugin(ScrollTrigger);

let current: Lenis | null = null;

/** The live smooth-scroll instance (null when reduced motion is on), so other effects can pause or jump it. */
export function getLenis(): Lenis | null {
  return current;
}

/** Lenis inertia scrolling, driven by GSAP's ticker so ScrollTrigger stays in sync. */
export function useSmoothScroll(): void {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const lenis = new Lenis({ duration: 0.9, anchors: true });
    current = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time: number): void => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      if (current === lenis) current = null;
    };
  }, []);
}
