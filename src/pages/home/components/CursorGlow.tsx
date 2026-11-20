import gsap from 'gsap';
import { useEffect, useRef } from 'react';

/** Soft red/blue light that trails the cursor (desktop pointers only). */
export default function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(pointer: coarse), (prefers-reduced-motion: reduce)').matches) return undefined;

    gsap.set(el, { xPercent: -50, yPercent: -50, autoAlpha: 0 });
    const moveX = gsap.quickTo(el, 'x', { duration: 0.45, ease: 'power3.out' });
    const moveY = gsap.quickTo(el, 'y', { duration: 0.45, ease: 'power3.out' });
    const onMove = (ev: PointerEvent): void => {
      moveX(ev.clientX);
      moveY(ev.clientY);
      gsap.to(el, { autoAlpha: 1, duration: 0.4, overwrite: 'auto' });
    };
    const onLeave = (): void => {
      gsap.to(el, { autoAlpha: 0, duration: 0.4 });
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      gsap.killTweensOf(el);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-20 h-72 w-72 rounded-full bg-[radial-gradient(closest-side,rgba(255,0,60,0.22),rgba(0,107,255,0.12)_60%,transparent)] mix-blend-screen blur-2xl"
    />
  );
}
